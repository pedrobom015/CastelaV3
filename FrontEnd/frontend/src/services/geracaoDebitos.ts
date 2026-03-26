/**
 * geracaoDebitos.ts
 * Lógica de geração de débitos/taxas — baseada em adm_r002.prg (Harbour)
 *
 * Regras do sistema original:
 *  - Chave única de TAXAS: codigo + tipo + circ  (sem duplicatas)
 *  - tipo '2' = taxa mensal  |  '3' = periódico/carné
 *  - stat '1' = Gerada (não impressa ainda)
 *  - stat '2' = Impressa
 *  - Contrato é ignorado se: cancelado, remido, ou saitxa < mesref
 *  - GRUPOS->qtcircs e ultcirc são atualizados a cada nova taxa gerada
 */

import type { DbfTable } from './dbf/DbfReader'
import { writeDbfFile } from './dbf/DbfReader'
import type { DbfRecord } from '../types/models'

type R = Record<string, unknown>

// ─── tipos públicos ───────────────────────────────────────────────────────────

export interface ParamsGeracaoMes {
  grupo: string
  circIni: string      // circular inicial (ex: '010')
  circFim: string      // circular final
  emissaoFallback: Date
  mesref: string       // MMAA  ex: '0326'
  valorFallback: number
  cod1: string         // contrato inicial ('000000000' = todos)
  cod2: string         // contrato final
  formapgtoFiltro?: string[]  // para Débitos do Cartão
  percentual?: number          // para Débitos com Porcentagem (ex: 5 = 5%)
}

export interface ParamsGeracaoPeriodico {
  grupo: string
  cod1: string
  cod2: string
  vencimentoFim: Date  // data de vencimento final para o período
  usuario: string
  vlparc?: number      // valor base adicional informado pelo usuário (adp_pxp7: vlparc)
  porcparc?: number    // percentual de reajuste (ex: 5 = 5%)
}

export interface ParamsGeracaoPeriodo4 {
  grupo: string
  cod1: string
  cod2: string
  // adp_px07: vini_ = limite superior do último vencimento a considerar
  // Contratos com último débito tipo 3/4 posterior a esta data são ignorados
  vini: Date
  // adp_px07: vfim_ = data da primeira parcela a gerar
  vfim: Date
  vlparc: number      // valor adicional por parcela (multiplicado por mforma)
  usuario: string
}

export interface ItemGerado {
  codigo: string
  nome: string
  circ: string
  tipo: string
  valor: number
  cobrador: string
  ignorado: boolean
  motivo?: string
}

export interface ResultadoGeracao {
  itens: ItemGerado[]
  criadas: number
  ignoradas: number
}

// ─── helpers internos ─────────────────────────────────────────────────────────

function strVal(v: unknown): string {
  return String(v ?? '').trim()
}

function numVal(v: unknown): number {
  return Number(v ?? 0)
}

/**
 * Equivalente a RV4401F9.PRG — retorna motivo para ignorar ou '' se OK.
 * Verifica: cancelado, remido, saída de taxa.
 */
function motivoIgnorar(
  g: Record<string, unknown>,
  arqgrup: Record<string, unknown> | undefined,
  mesref: string  // MMAA
): string {
  const situacao = strVal(g.situacao)
  if (situacao !== 'A' && situacao !== '1') return 'Cancelado'

  if (!arqgrup) return 'Grupo não cadastrado'

  const qtdremir = numVal(arqgrup.qtdremir)
  if (qtdremir > 0) {
    const qtcircs  = numVal(g.qtcircs)
    const funerais = numVal(g.funerais)
    const poratend = strVal(arqgrup.poratend)
    // rv4401f9: se poratend='S' → limite = (MAX(funerais,0)+1)*qtdremir, senão = qtdremir
    const limite = poratend === 'S' ? (Math.max(0, funerais) + 1) * qtdremir : qtdremir
    if (qtcircs >= limite) return 'Remido'
  }

  const saitxa = strVal(g.saitxa)
  if (saitxa === '9999') return 'Remido'

  // saitxa = INÍCIO da cobrança (MMAA). Inclui quando saitxa <= mesref.
  // Bloqueia apenas se saitxa > mesref (cobrança ainda não começou).
  if (saitxa.length === 4 && /^\d{4}$/.test(saitxa)) {
    const sMM = parseInt(saitxa.slice(0, 2))
    const sAA = parseInt(saitxa.slice(2, 4))
    const rMM = parseInt(mesref.slice(0, 2))
    const rAA = parseInt(mesref.slice(2, 4))
    const sNum = sAA * 100 + sMM
    const rNum = rAA * 100 + rMM
    if (sNum > rNum) return `SaíTxa ${saitxa} > Emissão (cobrança ainda não iniciada)`
  }

  return ''
}

function padCirc(n: number): string {
  return String(n).padStart(3, '0')
}

/**
 * Arredondamento conforme adp_pxp7:
 * vl += 0.05 → INT(vl * 10) / 10
 * Exemplos: 30,02 → 30,00 | 41,56 → 41,60 | 30,07 → 30,10
 */
function arredondar(valor: number): number {
  return Math.floor((valor + 0.05) * 10) / 10
}

function dateToDbf(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

// ─── geração de débitos do mês / período / cartão / porcentagem ───────────────

/**
 * Núcleo da geração — tipo '2' (taxa mensal).
 * Usado por: Débitos do Mês, Débitos do Período, Débitos do Cartão,
 *            Débitos com Porcentagem.
 */
export async function gerarDebitosTipo2(
  dirHandle: FileSystemDirectoryHandle,
  tables: Map<string, DbfTable>,
  params: ParamsGeracaoMes,
  usuario: string,
  dryRun = false
): Promise<ResultadoGeracao> {
  const gruposTable  = tables.get('grupos')
  const taxasTable   = tables.get('taxas')
  const arqgrupTable = tables.get('arqgrup')
  const classesTable = tables.get('classes')
  const circularTable = tables.get('circular')

  if (!gruposTable || !taxasTable) {
    throw new Error('Tabelas GRUPOS e TAXAS são necessárias')
  }

  // --- maps de lookup ---
  const arqgrupMap = new Map<string, R>()
  arqgrupTable?.records.forEach(r => {
    if (!r._deleted) arqgrupMap.set(strVal(r.grup), r as R)
  })

  const classesMap = new Map<string, R>()
  classesTable?.records.forEach(r => {
    if (!r._deleted) classesMap.set(strVal(r.classcod), r as R)
  })

  const circularMap = new Map<string, R>()
  circularTable?.records.forEach(r => {
    if (!r._deleted) {
      const key = `${strVal(r.grupo)}|${strVal(r.circ)}`
      circularMap.set(key, r as R)
    }
  })

  // chave existente: codigo+tipo+circ
  const taxasExist = new Set<string>()
  taxasTable.records.forEach(r => {
    if (!r._deleted)
      taxasExist.add(`${strVal(r.codigo)}|${strVal(r.tipo)}|${strVal(r.circ)}`)
  })

  const circIni = parseInt(params.circIni.padStart(3, '0') || '1')
  const circFim = parseInt(params.circFim.padStart(3, '0') || params.circIni.padStart(3, '0') || '1')

  const itens: ItemGerado[] = []
  const novasTaxas: DbfRecord[] = []
  const gruposUpd  = new Map<string, DbfRecord>()
  const arqgrupUpd = new Map<string, DbfRecord>()  // acumula atualizações em ARQGRUP

  for (const g of gruposTable.records) {
    if (g._deleted) continue

    const codigo     = strVal(g.codigo)
    const grupoCode  = strVal(g.grupo)
    const tipcont    = strVal(g.tipcont)

    // filtro de grupo
    if (params.grupo.trim() && grupoCode !== params.grupo.trim()) continue

    // filtro de intervalo de contratos
    if (params.cod1 && params.cod1 !== '000000000' && codigo < params.cod1) continue
    if (params.cod2 && params.cod2 !== '000000000' && codigo > params.cod2) continue

    // filtro de forma de pagamento (Débitos do Cartão)
    if (params.formapgtoFiltro && params.formapgtoFiltro.length > 0) {
      if (!params.formapgtoFiltro.includes(strVal(g.formapgto))) continue
    }

    const arqgrup = arqgrupMap.get(grupoCode)
    // fallback: tipcont "00" ou vazio → usa a classe padrão do grupo
    const classeEfetiva = (!tipcont || tipcont === '00')
      ? strVal(arqgrup?.classe)
      : tipcont
    const classes  = classesMap.get(classeEfetiva)

    // classe não encontrada
    if (!classes && classeEfetiva) {
      itens.push({ codigo, nome: strVal(g.nome), circ: padCirc(circIni), tipo: '2', valor: 0, cobrador: '', ignorado: true, motivo: `Classe "${classeEfetiva}" não cadastrada em CLASSES` })
      continue
    }

    const motivo = motivoIgnorar(g as R, arqgrup, params.mesref)
    if (motivo) {
      itens.push({ codigo, nome: strVal(g.nome), circ: padCirc(circIni), tipo: '2', valor: 0, cobrador: '', ignorado: true, motivo })
      continue
    }

    // prior='S' (VIP) → gera com tipo='3' no mesmo loop (conforme adp_p001.prg)
    // prior≠'S'       → gera com tipo='2' (taxa mensal normal)
    const prior    = strVal(classes?.prior)
    const tipoTaxa = prior === 'S' ? '3' : '2'

    const vlmensal = numVal(classes?.vlmensal)
    const vldepend = numVal(classes?.vldepend)
    const nrdepend = numVal(g.nrdepend)
    const mforma   = Math.max(1, parseInt(strVal(g.formapgto)) || 1)

    let gerouAlgo = false
    for (let c = circIni; c <= circFim; c++) {
      const circ = padCirc(c)
      const key  = `${codigo}|${tipoTaxa}|${circ}`
      if (taxasExist.has(key)) continue  // já existe — nunca duplicar

      // rv4401f9: VIP skip — não gera se circ < ultcirc + formapgto
      // (VIP paga com periodicidade = formapgto, não a cada circular)
      if (prior === 'S') {
        const ultCircNum = parseInt(strVal(g.ultcirc)) || 0
        if (ultCircNum > 0 && c < ultCircNum + mforma) continue
      }

      const circular = circularMap.get(`${grupoCode}|${circ}`)
      const rvlaux   = numVal(circular?.valor)  // valor adicional da circular (pode ser 0)

      // val_01f9:
      //   VIP  (prior='S'): (rvlaux + vlmensal + nrdepend*vldepend) * formapgto
      //   Não-VIP (rnraux=1): rvlaux + vlmensal + nrdepend*vldepend
      let valor: number
      if (prior === 'S') {
        valor = arredondar((rvlaux + vlmensal + nrdepend * vldepend) * mforma)
      } else {
        valor = arredondar(rvlaux + vlmensal + nrdepend * vldepend)
      }
      if (valor === 0) valor = params.valorFallback || 0

      // aplica porcentagem se informada
      if (params.percentual && params.percentual !== 0) {
        valor = parseFloat((valor * (1 + params.percentual / 100)).toFixed(2))
      }

      const emissao = (circular?.emissao_ instanceof Date ? circular.emissao_ : params.emissaoFallback)
      const cobrador = strVal(g.cobrador)

      itens.push({ codigo, nome: strVal(g.nome), circ, tipo: tipoTaxa, valor, cobrador, ignorado: false })
      gerouAlgo = true

      if (!dryRun) {
        novasTaxas.push({
          codigo, tipo: tipoTaxa, circ,
          emissao_:  emissao,
          valor,
          pgto_:     null,
          valorpg:   0,
          cobrador,
          forma:     '',
          baixa_:    null,
          por:       usuario,
          stat:      '1',   // Gerada
          filial:    '01',
          flag_excl: ' ',
          cedente: '', nnumero: '', codlan: '',
        })
        taxasExist.add(key)

        // acumula atualizações no GRUPOS
        const gAtual = (gruposUpd.get(codigo) ?? { ...g }) as DbfRecord
        const qtAtual  = numVal(gAtual.qtcircs)
        const ultAtual = strVal(gAtual.ultcirc)
        const iniAtual = strVal(gAtual.circinic)
        gruposUpd.set(codigo, {
          ...gAtual,
          qtcircs:  qtAtual + 1,
          ultcirc:  circ > ultAtual ? circ : ultAtual,
          circinic: (iniAtual === '000' || iniAtual === '' || iniAtual === '   ') ? circ : iniAtual,
        })

        // acumula atualizações em ARQGRUP (ultcirc e emissao_ do grupo)
        const agRaw  = arqgrupMap.get(grupoCode)
        if (agRaw) {
          const agAtual   = (arqgrupUpd.get(grupoCode) ?? { ...agRaw }) as DbfRecord
          const agUlt     = strVal(agAtual.ultcirc)
          arqgrupUpd.set(grupoCode, {
            ...agAtual,
            ultcirc:  circ > agUlt ? circ : agUlt,
            emissao_: emissao,
          })
        }
      }
    }

    if (!gerouAlgo && !itens.find(i => i.codigo === codigo)) {
      itens.push({ codigo, nome: strVal(g.nome), circ: padCirc(circIni), tipo: '2', valor: 0, cobrador: '', ignorado: true, motivo: 'Já gerado' })
    }
  }

  // --- persiste se não for dry run ---
  if (!dryRun && novasTaxas.length > 0) {
    const newTaxas: typeof taxasTable = {
      ...taxasTable,
      records: [...taxasTable.records, ...novasTaxas],
      header:  { ...taxasTable.header, recordCount: taxasTable.records.length + novasTaxas.length },
    }
    await writeDbfFile(dirHandle, 'TAXAS.DBF', newTaxas)
    tables.set('taxas', newTaxas)
  }

  if (!dryRun && gruposUpd.size > 0) {
    const novosRec = gruposTable.records.map(g =>
      gruposUpd.get(strVal(g.codigo)) ?? g
    )
    const newGrupos: typeof gruposTable = {
      ...gruposTable,
      records: novosRec,
    }
    await writeDbfFile(dirHandle, 'GRUPOS.DBF', newGrupos)
    tables.set('grupos', newGrupos)
  }

  if (!dryRun && arqgrupUpd.size > 0 && arqgrupTable) {
    const novosArq = arqgrupTable.records.map(r =>
      arqgrupUpd.get(strVal(r.grup)) ?? r
    )
    const newArqgrup = { ...arqgrupTable, records: novosArq }
    await writeDbfFile(dirHandle, 'ARQGRUP.DBF', newArqgrup)
    tables.set('arqgrup', newArqgrup)
  }

  const criadas   = itens.filter(i => !i.ignorado).length
  const ignoradas = itens.filter(i => i.ignorado).length
  return { itens, criadas, ignoradas }
}

// ─── geração de débitos periódicos (tipo='3' — carné/parcelas anuais) ─────────
// Baseado em adp_py07.prg

export async function gerarDebitosPeriodicos(
  dirHandle: FileSystemDirectoryHandle,
  tables: Map<string, DbfTable>,
  params: ParamsGeracaoPeriodico,
  dryRun = false
): Promise<ResultadoGeracao> {
  const gruposTable  = tables.get('grupos')
  const taxasTable   = tables.get('taxas')
  const arqgrupTable = tables.get('arqgrup')
  const classesTable = tables.get('classes')

  if (!gruposTable || !taxasTable) throw new Error('Tabelas necessárias não carregadas')

  const arqgrupMap = new Map<string, R>()
  arqgrupTable?.records.forEach(r => {
    if (!r._deleted) arqgrupMap.set(strVal(r.grup), r as R)
  })

  const classesMap = new Map<string, R>()
  classesTable?.records.forEach(r => {
    if (!r._deleted) classesMap.set(strVal(r.classcod), r as R)
  })

  const taxasExist = new Set<string>()
  // Mapa: codigo => maior circ tipo=3
  const ultimoCircPer = new Map<string, number>()
  taxasTable.records.forEach(r => {
    if (!r._deleted) {
      const key = `${strVal(r.codigo)}|${strVal(r.tipo)}|${strVal(r.circ)}`
      taxasExist.add(key)
      if (strVal(r.tipo) === '3') {
        const cod  = strVal(r.codigo)
        const circ = parseInt(strVal(r.circ)) || 0
        if (!ultimoCircPer.has(cod) || circ > ultimoCircPer.get(cod)!) {
          ultimoCircPer.set(cod, circ)
        }
      }
    }
  })

  const mesref = `${String(params.vencimentoFim.getMonth() + 1).padStart(2, '0')}${String(params.vencimentoFim.getFullYear()).slice(-2)}`

  const itens: ItemGerado[] = []
  const novasTaxas: DbfRecord[] = []
  const gruposUpd = new Map<string, DbfRecord>()

  for (const g of gruposTable.records) {
    if (g._deleted) continue

    const codigo    = strVal(g.codigo)
    const grupoCode = strVal(g.grupo)
    const tipcont   = strVal(g.tipcont)

    if (params.grupo.trim() && grupoCode !== params.grupo.trim()) continue
    if (params.cod1 && params.cod1 !== '000000000' && codigo < params.cod1) continue
    if (params.cod2 && params.cod2 !== '000000000' && codigo > params.cod2) continue

    const arqgrup = arqgrupMap.get(grupoCode)
    // fallback: tipcont "00" ou vazio → usa a classe padrão do grupo
    const classeEfetiva = (!tipcont || tipcont === '00')
      ? strVal(arqgrup?.classe)
      : tipcont
    const classes  = classesMap.get(classeEfetiva)

    if (!classes && classeEfetiva) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '3', valor: 0, cobrador: '', ignorado: true, motivo: `Classe "${classeEfetiva}" não cadastrada em CLASSES` })
      continue
    }

    const motivo = motivoIgnorar(g as R, arqgrup, mesref)
    if (motivo) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '3', valor: 0, cobrador: '', ignorado: true, motivo })
      continue
    }

    // adp_py07: valor = vlparc + (vlmensal + nrdepend * vldepend) * formapgto
    // vlparc é buscado de TCARNES pelo grupo/mforma; aqui é informado pelo usuário
    const vlmensal  = numVal(classes?.vlmensal)
    const vldepend  = numVal(classes?.vldepend)
    const nrdepend  = numVal(g.nrdepend)
    const mforma    = Math.max(1, numVal(g.formapgto) || 1)
    const vlparc    = params.vlparc ?? 0
    const porcparc  = params.porcparc ?? 0
    let vlparcela   = arredondar(vlparc + (vlmensal + nrdepend * vldepend) * mforma)
    if (porcparc !== 0) {
      vlparcela = arredondar(vlparcela * (1 + porcparc / 100))
    }

    const numParcelas = Math.floor(12 / mforma)
    const ultimoCirc  = ultimoCircPer.get(codigo) ?? 0

    // Data inicial do vencimento: 1º do mês seguinte ao vencimentoFim
    let proxVcto = new Date(params.vencimentoFim)
    proxVcto.setDate(1)
    proxVcto.setMonth(proxVcto.getMonth() + 1)

    let gerouAlgo = false
    for (let nparc = 1; nparc <= numParcelas; nparc++) {
      const circ = padCirc(ultimoCirc + nparc)
      const key  = `${codigo}|3|${circ}`
      if (taxasExist.has(key)) continue

      itens.push({ codigo, nome: strVal(g.nome), circ, tipo: '3', valor: vlparcela, cobrador: strVal(g.cobrador), ignorado: false })
      gerouAlgo = true

      if (!dryRun) {
        novasTaxas.push({
          codigo, tipo: '3', circ,
          emissao_:  new Date(proxVcto),
          valor:     vlparcela,
          pgto_:     null,
          valorpg:   0,
          cobrador:  strVal(g.cobrador),
          forma:     '',
          baixa_:    null,
          por:       params.usuario,
          stat:      '1',
          filial:    '01',
          flag_excl: ' ',
          cedente: '', nnumero: '', codlan: '',
        })
        taxasExist.add(key)

        const gAtual   = (gruposUpd.get(codigo) ?? { ...g }) as DbfRecord
        const iniAtual = strVal(gAtual.circinic)
        gruposUpd.set(codigo, {
          ...gAtual,
          qtcircs:  numVal(gAtual.qtcircs) + 1,
          ultcirc:  circ > strVal(gAtual.ultcirc) ? circ : strVal(gAtual.ultcirc),
          circinic: (iniAtual === '000' || iniAtual === '' || iniAtual === '   ') ? circ : iniAtual,
        })
      }

      // avança data pelo período
      proxVcto = new Date(proxVcto)
      proxVcto.setMonth(proxVcto.getMonth() + mforma)
    }

    if (!gerouAlgo) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '3', valor: 0, cobrador: '', ignorado: true, motivo: 'Já gerado' })
    }
  }

  if (!dryRun && novasTaxas.length > 0) {
    const newTaxas: typeof taxasTable = {
      ...taxasTable,
      records: [...taxasTable.records, ...novasTaxas],
      header:  { ...taxasTable.header, recordCount: taxasTable.records.length + novasTaxas.length },
    }
    await writeDbfFile(dirHandle, 'TAXAS.DBF', newTaxas)
    tables.set('taxas', newTaxas)
  }

  if (!dryRun && gruposUpd.size > 0) {
    const novosRec = gruposTable.records.map(g => gruposUpd.get(strVal(g.codigo)) ?? g)
    const newGrupos: typeof gruposTable = { ...gruposTable, records: novosRec }
    await writeDbfFile(dirHandle, 'GRUPOS.DBF', newGrupos)
    tables.set('grupos', newGrupos)
  }

  return {
    itens,
    criadas:   itens.filter(i => !i.ignorado).length,
    ignoradas: itens.filter(i => i.ignorado).length,
  }
}

// ─── geração de débitos do período (tipo='4' — adp_px07) ─────────────────────
// Baseado em adp_px07.prg
// Diferença do tipo='3' (adp_py07):
//   - tipo='4' na taxa
//   - vlparc é multiplicado por mforma (valor mensal escalado pela periodicidade)
//   - filtro por data do último débito (vini), não por circ existente
//   - contratos sem débito tipo 3/4 com último vencimento após vini são ignorados

export async function gerarDebitosTipo4(
  dirHandle: FileSystemDirectoryHandle,
  tables: Map<string, DbfTable>,
  params: ParamsGeracaoPeriodo4,
  dryRun = false
): Promise<ResultadoGeracao> {
  const gruposTable  = tables.get('grupos')
  const taxasTable   = tables.get('taxas')
  const arqgrupTable = tables.get('arqgrup')
  const classesTable = tables.get('classes')

  if (!gruposTable || !taxasTable) throw new Error('Tabelas necessárias não carregadas')

  const arqgrupMap = new Map<string, R>()
  arqgrupTable?.records.forEach(r => {
    if (!r._deleted) arqgrupMap.set(strVal(r.grup), r as R)
  })

  const classesMap = new Map<string, R>()
  classesTable?.records.forEach(r => {
    if (!r._deleted) classesMap.set(strVal(r.classcod), r as R)
  })

  // Mapa: codigo => { lastCirc, lastDate } para taxas tipo='3' ou '4'
  const ultimaTaxa = new Map<string, { circ: number; date: Date }>()
  const taxasExist  = new Set<string>()
  taxasTable.records.forEach(r => {
    if (r._deleted) return
    taxasExist.add(`${strVal(r.codigo)}|${strVal(r.tipo)}|${strVal(r.circ)}`)
    const tipo = strVal(r.tipo)
    if (tipo === '3' || tipo === '4') {
      const cod  = strVal(r.codigo)
      const circ = parseInt(strVal(r.circ)) || 0
      const dt   = r.emissao_ instanceof Date ? r.emissao_ : null
      const ant  = ultimaTaxa.get(cod)
      if (!ant || circ > ant.circ) {
        ultimaTaxa.set(cod, { circ, date: dt ?? new Date(0) })
      }
    }
  })

  // adp_px07: limitefinal = início do mês de (vfim + ~12 meses)
  const limitefinalMs  = new Date(params.vfim)
  limitefinalMs.setDate(limitefinalMs.getDate() + 370)
  limitefinalMs.setDate(1)

  // ultdiavfim = último dia do mês de vfim (para comparação com dtproxvcto)
  const ultdiavfim = new Date(params.vfim)
  ultdiavfim.setMonth(ultdiavfim.getMonth() + 1)
  ultdiavfim.setDate(0)  // volta ao último dia do mês anterior

  const mesref = `${String(params.vfim.getMonth() + 1).padStart(2, '0')}${String(params.vfim.getFullYear()).slice(-2)}`

  function addMonths(d: Date, m: number): Date {
    const r = new Date(d)
    r.setMonth(r.getMonth() + m)
    return r
  }

  const itens: ItemGerado[] = []
  const novasTaxas: DbfRecord[] = []
  const gruposUpd = new Map<string, DbfRecord>()

  for (const g of gruposTable.records) {
    if (g._deleted) continue

    const codigo    = strVal(g.codigo)
    const grupoCode = strVal(g.grupo)
    const tipcont   = strVal(g.tipcont)

    if (params.grupo.trim() && grupoCode !== params.grupo.trim()) continue
    if (params.cod1 && params.cod1 !== '000000000' && codigo < params.cod1) continue
    if (params.cod2 && params.cod2 !== '000000000' && codigo > params.cod2) continue

    // filtro de faixa do grupo (inicio–final em ARQGRUP)
    const arqgrup = arqgrupMap.get(grupoCode)
    if (arqgrup) {
      const ini = strVal(arqgrup.inicio)
      const fin = strVal(arqgrup.final)
      if (ini && codigo < ini) continue
      if (fin && codigo > fin) continue
    }

    const classeEfetiva = (!tipcont || tipcont === '00')
      ? strVal(arqgrup?.classe) : tipcont
    const classes = classesMap.get(classeEfetiva)

    if (!classes && classeEfetiva) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '4', valor: 0, cobrador: '', ignorado: true, motivo: `Classe "${classeEfetiva}" não cadastrada` })
      continue
    }

    const motivo = motivoIgnorar(g as R, arqgrup, mesref)
    if (motivo) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '4', valor: 0, cobrador: '', ignorado: true, motivo })
      continue
    }

    const ultima   = ultimaTaxa.get(codigo)
    const ultvct   = ultima?.date ?? null
    const ultimoC  = ultima?.circ ?? 0

    // adp_px07: se não tem taxa e não foi fornecida data ini → ignora contratos sem histórico
    // (equivale ao "!EMPT(vin0_).AND.!temtxa → skip")
    if (!ultima) {
      // sem taxas anteriores: usa vfim como ponto de partida
    } else {
      // tem taxa: skip se último vencimento > vini (já gerado além do período)
      if (ultvct && ultvct > params.vini) {
        itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '4', valor: 0, cobrador: '', ignorado: true, motivo: 'Último débito posterior ao período' })
        continue
      }
    }

    const mforma = Math.max(1, numVal(g.formapgto) || 1)

    // adp_px07: dtproxvcto — próximo vencimento a partir do último
    let dtproxvcto: Date
    if (!ultvct || ultvct.getTime() === new Date(0).getTime()) {
      dtproxvcto = addMonths(params.vfim, 1)
      dtproxvcto.setDate(1)
    } else {
      dtproxvcto = addMonths(ultvct, 1 + mforma)
      dtproxvcto.setDate(1)
    }

    // skip se próximo vencimento cai depois do último dia do mês de vfim
    if (dtproxvcto > ultdiavfim) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '4', valor: 0, cobrador: '', ignorado: true, motivo: 'Próxima parcela além do período' })
      continue
    }

    // adp_px07: ajusta com saitxa (cobra só a partir de saitxa se for posterior)
    const saitxa = strVal(g.saitxa)
    if (saitxa.length === 4 && /^\d{4}$/.test(saitxa)) {
      const saitxaDate = new Date(2000 + parseInt(saitxa.slice(2, 4)), parseInt(saitxa.slice(0, 2)) - 1, 1)
      const saitxaNext = addMonths(saitxaDate, 1)
      if (saitxaNext > dtproxvcto) dtproxvcto = saitxaNext
    }

    const vlmensal = numVal(classes?.vlmensal)
    const vldepend = numVal(classes?.vldepend)
    const nrdepend = numVal(g.nrdepend)
    // adp_px07: (vlparc * mforma) + (vlmensal + nrdepend*vldepend) * mforma
    //         = (vlparc + vlmensal + nrdepend*vldepend) * mforma
    const vlparcela = arredondar((params.vlparc + vlmensal + nrdepend * vldepend) * mforma)

    const numParcelas = Math.floor(12 / mforma)
    let proxVcto = new Date(dtproxvcto)
    let gerouAlgo = false

    for (let nparc = 1; nparc <= numParcelas; nparc++) {
      const circ = padCirc(ultimoC + nparc)
      const key  = `${codigo}|4|${circ}`
      if (taxasExist.has(key)) continue

      itens.push({ codigo, nome: strVal(g.nome), circ, tipo: '4', valor: vlparcela, cobrador: strVal(g.cobrador), ignorado: false })
      gerouAlgo = true

      if (!dryRun) {
        novasTaxas.push({
          codigo, tipo: '4', circ,
          emissao_:  new Date(proxVcto),
          valor:     vlparcela,
          pgto_:     null,
          valorpg:   0,
          cobrador:  strVal(g.cobrador),
          forma:     '',
          baixa_:    null,
          por:       params.usuario,
          stat:      '1',
          filial:    '01',
          flag_excl: ' ',
          cedente: '', nnumero: '', codlan: '',
        })
        taxasExist.add(key)

        const gAtual   = (gruposUpd.get(codigo) ?? { ...g }) as DbfRecord
        const iniAtual = strVal(gAtual.circinic)
        gruposUpd.set(codigo, {
          ...gAtual,
          qtcircs:  numVal(gAtual.qtcircs) + 1,
          ultcirc:  circ > strVal(gAtual.ultcirc) ? circ : strVal(gAtual.ultcirc),
          circinic: (iniAtual === '000' || iniAtual === '' || iniAtual === '   ') ? circ : iniAtual,
        })
      }

      proxVcto = addMonths(proxVcto, mforma)
    }

    if (!gerouAlgo) {
      itens.push({ codigo, nome: strVal(g.nome), circ: '---', tipo: '4', valor: 0, cobrador: '', ignorado: true, motivo: 'Já gerado' })
    }
  }

  if (!dryRun && novasTaxas.length > 0) {
    const newTaxas: typeof taxasTable = {
      ...taxasTable,
      records: [...taxasTable.records, ...novasTaxas],
      header:  { ...taxasTable.header, recordCount: taxasTable.records.length + novasTaxas.length },
    }
    await writeDbfFile(dirHandle, 'TAXAS.DBF', newTaxas)
    tables.set('taxas', newTaxas)
  }

  if (!dryRun && gruposUpd.size > 0) {
    const novosRec = gruposTable.records.map(g => gruposUpd.get(strVal(g.codigo)) ?? g)
    const newGrupos = { ...gruposTable, records: novosRec }
    await writeDbfFile(dirHandle, 'GRUPOS.DBF', newGrupos)
    tables.set('grupos', newGrupos)
  }

  return {
    itens,
    criadas:   itens.filter(i => !i.ignorado).length,
    ignoradas: itens.filter(i => i.ignorado).length,
  }
}

export { dateToDbf }
