/**
 * recebimento.ts
 * Lógica de recebimento de taxas — baseada em BXREC.PRG (Harbour)
 *
 * Fluxo:
 *  1. Busca contrato em GRUPOS
 *  2. Lista taxas pendentes (valorpg = 0, stat != '6')
 *  3. Calcula juros/multa (JUROS.DBF) se vencida
 *  4. Confirma recebimento:
 *     - TAXAS: stat='6', pgto_=hoje, valorpg, forma='P', baixa_=hoje, por
 *     - GRUPOS: qtcircpg+1 (se tipo != '1')
 *     - BXREC: novo registro de recibo
 */

import type { DbfTable } from './dbf/DbfReader'
import { writeDbfFile } from './dbf/DbfReader'
import type { DbfRecord } from '../types/models'

// ─── tipos públicos ───────────────────────────────────────────────────────────

export interface ContratoInfo {
  codigo: string
  nome: string
  grupo: string
  cobrador: string
  situacao: string
  endereco: string
  bairro: string
  cidade: string
  qtcircpg: number
}

export interface TaxaPendente {
  _taxaIdx: number       // índice no array de records de TAXAS
  codigo: string
  tipo: string
  circ: string
  emissao_: Date | null
  valor: number
  cobrador: string
  diasAtraso: number
  multa: number          // valor da multa calculada
  juros: number          // valor dos juros calculado
  acrescimo: number      // multa + juros
  total: number          // valor + acrescimo
}

export interface ParamsRecebimento {
  taxa: TaxaPendente
  valorPago: number
  dataRecebimento: Date
}

export interface ResultadoRecebimento {
  ano: string
  numero: string
  valorPago: number
  acrescimo: number
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function strVal(v: unknown): string {
  return String(v ?? '').trim()
}

function numVal(v: unknown): number {
  return Number(v ?? 0)
}

function diffDias(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000)
}

// ─── funções públicas ─────────────────────────────────────────────────────────

/** Busca contrato pelo código em GRUPOS */
export function buscarContrato(
  tables: Map<string, DbfTable>,
  codigo: string
): ContratoInfo | null {
  const t = tables.get('grupos')
  if (!t) return null
  const rec = t.records.find(
    r => !r._deleted && strVal(r.codigo) === codigo.padStart(9, '0')
  )
  if (!rec) return null
  return {
    codigo:   strVal(rec.codigo),
    nome:     strVal(rec.nome),
    grupo:    strVal(rec.grupo),
    cobrador: strVal(rec.cobrador),
    situacao: strVal(rec.situacao),
    endereco: strVal(rec.endereco),
    bairro:   strVal(rec.bairro),
    cidade:   strVal(rec.cidade),
    qtcircpg: numVal(rec.qtcircpg),
  }
}

/**
 * Lista taxas pendentes do contrato — apenas stat != '6' e valorpg = 0.
 * Calcula juros/multa usando JUROS.DBF.
 * Ordenadas por data de emissão.
 */
export function listarTaxasPendentes(
  tables: Map<string, DbfTable>,
  codigo: string,
  hoje: Date = new Date()
): TaxaPendente[] {
  const taxasTable = tables.get('taxas')
  const jurosTable = tables.get('juros')
  if (!taxasTable) return []

  // Monta lookup de parâmetros de juros por tipo
  const jurosMap = new Map<string, { multa: number; mltcaren: number; juros: number; jrscaren: number }>()
  jurosTable?.records.forEach(r => {
    if (!r._deleted) {
      jurosMap.set(strVal(r.tipo), {
        multa:    numVal(r.multa),
        mltcaren: numVal(r.mltcaren),
        juros:    numVal(r.juros),
        jrscaren: numVal(r.jrscaren),
      })
    }
  })

  const codigoPad = codigo.padStart(9, '0')
  const pendentes: TaxaPendente[] = []

  taxasTable.records.forEach((r, idx) => {
    if (r._deleted) return
    if (strVal(r.codigo) !== codigoPad) return
    if (numVal(r.valorpg) > 0) return   // já pago
    if (strVal(r.stat) === '6') return  // stat pago

    const emissao = r.emissao_
      ? (r.emissao_ instanceof Date ? r.emissao_ : new Date(r.emissao_ as string))
      : null
    const valor   = numVal(r.valor)
    const tipo    = strVal(r.tipo)

    // Calcula acréscimos se vencida
    let multaVal = 0
    let jurosVal = 0
    let diasAtraso = 0

    if (emissao && emissao < hoje) {
      diasAtraso = diffDias(emissao, hoje)
      const jp = jurosMap.get(tipo)
      if (jp) {
        if (diasAtraso > jp.mltcaren) {
          multaVal = parseFloat((valor * jp.multa / 100).toFixed(2))
        }
        if (diasAtraso > jp.jrscaren) {
          jurosVal = parseFloat((valor * diasAtraso * jp.juros / 100 / 30).toFixed(2))
        }
      }
    }

    const acrescimo = parseFloat((multaVal + jurosVal).toFixed(2))

    pendentes.push({
      _taxaIdx:   idx,
      codigo:     codigoPad,
      tipo,
      circ:       strVal(r.circ),
      emissao_:   emissao,
      valor,
      cobrador:   strVal(r.cobrador),
      diasAtraso,
      multa:      multaVal,
      juros:      jurosVal,
      acrescimo,
      total:      parseFloat((valor + acrescimo).toFixed(2)),
    })
  })

  // Ordena por emissão (mais antigas primeiro)
  pendentes.sort((a, b) => {
    if (!a.emissao_) return 1
    if (!b.emissao_) return -1
    return a.emissao_.getTime() - b.emissao_.getTime()
  })

  return pendentes
}

/** Gera próximo número de recibo (ano + numero sequencial) */
function proximoNumeroRecibo(bxrecTable: DbfTable | undefined, hoje: Date): { ano: string; numero: string } {
  const ano = String(hoje.getFullYear()).slice(-2)
  let maxNum = 0
  bxrecTable?.records.forEach(r => {
    if (!r._deleted && strVal(r.ano) === ano) {
      const n = parseInt(strVal(r.numero)) || 0
      if (n > maxNum) maxNum = n
    }
  })
  return { ano, numero: String(maxNum + 1).padStart(9, '0') }
}

/**
 * Confirma o recebimento da taxa.
 * Atualiza TAXAS, GRUPOS e BXREC.
 */
export async function receberTaxa(
  dirHandle: FileSystemDirectoryHandle,
  tables: Map<string, DbfTable>,
  params: ParamsRecebimento,
  usuario: string
): Promise<ResultadoRecebimento> {
  const taxasTable  = tables.get('taxas')
  const gruposTable = tables.get('grupos')
  const bxrecTable  = tables.get('bxrec')

  if (!taxasTable || !gruposTable) throw new Error('Tabelas TAXAS e GRUPOS são necessárias')

  const { taxa, valorPago, dataRecebimento } = params
  const hoje = dataRecebimento

  // ─── 1. Atualiza TAXAS ───────────────────────────────────────────────────────
  const novosTaxas = taxasTable.records.map((r, idx) => {
    if (idx !== taxa._taxaIdx) return r
    return {
      ...r,
      pgto_:   hoje,
      forma:   'P',      // P = Presencial/Dinheiro
      baixa_:  hoje,
      stat:    '6',      // 6 = BxRecepção (pago)
      valorpg: valorPago,
      por:     usuario,
    } as DbfRecord
  })

  const newTaxasTable = { ...taxasTable, records: novosTaxas }
  await writeDbfFile(dirHandle, 'TAXAS.DBF', newTaxasTable)
  tables.set('taxas', newTaxasTable)

  // ─── 2. Atualiza GRUPOS (qtcircpg + 1 se tipo != '1' e != '6') ─────────────
  // Regra original Harbour: IF !(tipo$'16') → tipos '1' (Jóia) e '6' não contam
  if (!('16'.includes(taxa.tipo))) {
    const novosGrupos = gruposTable.records.map(r => {
      if (String(r.codigo ?? '').trim() !== taxa.codigo) return r
      return { ...r, qtcircpg: numVal(r.qtcircpg) + 1 } as DbfRecord
    })
    const newGruposTable = { ...gruposTable, records: novosGrupos }
    await writeDbfFile(dirHandle, 'GRUPOS.DBF', newGruposTable)
    tables.set('grupos', newGruposTable)
  }

  // ─── 3. Registra em BXREC ────────────────────────────────────────────────────
  const grupoRec = gruposTable.records.find(
    r => !r._deleted && strVal(r.codigo) === taxa.codigo
  )
  const { ano, numero } = proximoNumeroRecibo(bxrecTable, hoje)

  const novoRecibo: DbfRecord = {
    ano,
    numero,
    codigo:   taxa.codigo,
    tipo:     taxa.tipo,
    circ:     taxa.circ,
    valorpg:  valorPago,
    valoraux: parseFloat((valorPago - taxa.valor).toFixed(2)),
    emitido_: hoje,
    por:      usuario,
    numop:    '',
    grupo:    strVal(grupoRec?.grupo),
    filial:   '01',
    intlan:   '',
  }

  const newBxrecTable = bxrecTable
    ? {
        ...bxrecTable,
        records: [...bxrecTable.records, novoRecibo],
        header: { ...bxrecTable.header, recordCount: bxrecTable.records.length + 1 },
      }
    : {
        header: { version: 3, lastUpdate: hoje, recordCount: 1, headerSize: 0, recordSize: 0, fields: [] },
        records: [novoRecibo],
      }

  await writeDbfFile(dirHandle, 'BXREC.DBF', newBxrecTable)
  tables.set('bxrec', newBxrecTable)

  return { ano, numero, valorPago, acrescimo: taxa.acrescimo }
}
