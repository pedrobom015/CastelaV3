/**
 * acordo.ts
 * Lógica de Acordo de Dívidas — Recepção 0800
 *
 * Fluxo:
 *  1. Selecionar uma ou mais taxas pendentes
 *  2. Definir valor total do acordo e número de parcelas
 *  3. As taxas selecionadas são baixadas com valorpg=0.01, stat='6', forma='A',
 *     codlan='ACRD'+numero (marcadas como "baixadas por acordo XXXXX")
 *  4. Novas taxas são criadas para cada parcela do acordo (tipo='2', stat='2')
 *  5. Um registro é gravado em ACORDOS.DBF
 */

import type { DbfTable } from './dbf/DbfReader'
import { writeDbfFile, serializeDbf } from './dbf/DbfReader'
import type { DbfRecord } from '../types/models'
import type { TaxaPendente } from './recebimento'
import { DBF_STRUCTURES } from './dbf/initializeDbfs'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParamsAcordo {
  taxas: TaxaPendente[]         // taxas selecionadas para o acordo
  valorTotal: number            // valor total negociado
  numParcelas: number           // número de parcelas
  primeiroVencimento: Date      // data de vencimento da 1ª parcela
  atendNumero: string           // nº do atendimento (ATEND800)
  obsAcordo: string             // observação livre
}

export interface ParcelaAcordo {
  seq: number
  emissao_: Date
  valor: number
}

export interface ResultadoAcordo {
  numero: string                // número do acordo gerado
  parcelas: ParcelaAcordo[]     // parcelas criadas em TAXAS
  valorParc: number             // valor de cada parcela
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strVal(v: unknown): string {
  return String(v ?? '').trim()
}

function proximoNumeroAcordo(acordosTable: DbfTable | undefined): string {
  let max = 0
  acordosTable?.records.forEach(r => {
    if (!r._deleted) {
      const n = parseInt(strVal(r.numero)) || 0
      if (n > max) max = n
    }
  })
  return String(max + 1).padStart(8, '0')
}

/** Adiciona `meses` meses a uma data sem alterar o dia */
function addMeses(d: Date, meses: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + meses)
  return r
}

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Retorna o próximo número de circ disponível para o grupo e incrementa
 * o proxcirc em ARQGRUP. Retorna array de circ strings para `count` parcelas.
 */
function proximasCircs(
  tables: Map<string, DbfTable>,
  grupo: string,
  count: number
): { circs: string[]; newArqgrup: DbfTable | undefined } {
  const arqgrupTable = tables.get('arqgrup')
  if (!arqgrupTable) {
    // Fallback: usa números altos que não colidam
    const circs = Array.from({ length: count }, (_, i) => String(900 + i).padStart(3, '0'))
    return { circs, newArqgrup: undefined }
  }

  let proxNum = 1
  const recIdx = arqgrupTable.records.findIndex(
    r => !r._deleted && strVal(r.grup) === grupo
  )
  if (recIdx >= 0) {
    const rec = arqgrupTable.records[recIdx]
    proxNum = parseInt(strVal(rec.proxcirc)) || parseInt(strVal(rec.ultcirc)) + 1 || 1
  }

  const circs: string[] = []
  for (let i = 0; i < count; i++) {
    circs.push(String(proxNum + i).padStart(3, '0'))
  }

  // Atualiza proxcirc e ultcirc no ARQGRUP
  const newRecords = arqgrupTable.records.map((r, idx) => {
    if (idx !== recIdx) return r
    return {
      ...r,
      proxcirc: String(proxNum + count).padStart(3, '0'),
      ultcirc:  circs[circs.length - 1],
    } as DbfRecord
  })
  const newArqgrup = { ...arqgrupTable, records: newRecords }
  return { circs, newArqgrup }
}

export async function fazerAcordo(
  dirHandle: FileSystemDirectoryHandle,
  tables: Map<string, DbfTable>,
  params: ParamsAcordo,
  usuario: string
): Promise<ResultadoAcordo> {
  const { taxas, valorTotal, numParcelas, primeiroVencimento, atendNumero, obsAcordo } = params

  const taxasTable   = tables.get('taxas')
  const acordosTable = tables.get('acordos')
  const gruposTable  = tables.get('grupos')

  if (!taxasTable) throw new Error('Tabela TAXAS não encontrada.')
  if (taxas.length === 0) throw new Error('Selecione ao menos uma taxa para o acordo.')
  if (valorTotal <= 0) throw new Error('Informe um valor total maior que zero.')
  if (numParcelas < 1 || numParcelas > 360) throw new Error('Número de parcelas inválido.')

  const hoje = new Date()
  const numero = proximoNumeroAcordo(acordosTable)
  const codlan = ('ACRD' + numero).padEnd(20, ' ').slice(0, 20)

  // Descobre o grupo do contrato para pegar a sequência de circ
  const codigo = taxas[0].codigo
  const grupoRec = gruposTable?.records.find(
    r => !r._deleted && strVal(r.codigo) === codigo
  )
  const grupo = strVal(grupoRec?.grupo) || '01'

  // ── 1. Baixar taxas selecionadas com 0.01 (marcadas como "acordo") ───────────
  const idxsAcordar = new Set(taxas.map(t => t._taxaIdx))

  const novosTaxasRecords = taxasTable.records.map((r, idx) => {
    if (!idxsAcordar.has(idx)) return r
    return {
      ...r,
      pgto_:   hoje,
      baixa_:  hoje,
      valorpg: 0.01,
      forma:   'A',          // A = Acordo
      stat:    '6',          // 6 = baixada
      por:     usuario,
      codlan,                // marca qual acordo baixou
    } as DbfRecord
  })

  // ── 2. Criar novas taxas para as parcelas — circ sequencial do grupo ─────────
  const valorParc = parseFloat((valorTotal / numParcelas).toFixed(2))
  const valorUltima = parseFloat((valorTotal - valorParc * (numParcelas - 1)).toFixed(2))

  const parcelas: ParcelaAcordo[] = []
  const cobrador = taxas[0].cobrador

  // Reserva circ sequenciais no ARQGRUP
  const { circs, newArqgrup } = proximasCircs(tables, grupo, numParcelas)

  for (let i = 0; i < numParcelas; i++) {
    // 1ª parcela = primeiroVencimento; demais +1 mês sequencialmente
    const emissao = addMeses(primeiroVencimento, i)
    const vlParcela = i === numParcelas - 1 ? valorUltima : valorParc
    parcelas.push({ seq: i + 1, emissao_: emissao, valor: vlParcela })

    const novaTaxa: DbfRecord = {
      codigo,
      tipo:     '2',          // Taxa mensal — mesmo tipo das demais cobranças
      circ:     circs[i],     // sequência contínua do grupo (adm_r002 regra)
      emissao_: emissao,
      valor:    vlParcela,
      pgto_:    null,
      valorpg:  0,
      cobrador,
      forma:    '',
      baixa_:   null,
      por:      usuario,
      stat:     '2',          // 2 = Impressa/pendente
      filial:   '01',
      flag_excl: '',
      cedente:  '',
      nnumero:  '',
      codlan,
    }
    novosTaxasRecords.push(novaTaxa)
  }

  const newTaxasTable = {
    ...taxasTable,
    records: novosTaxasRecords,
    header: { ...taxasTable.header, recordCount: novosTaxasRecords.length },
  }

  // ── 3. Montar registro em ACORDOS ────────────────────────────────────────────
  const novoAcordo: DbfRecord = {
    numero,
    atend:    atendNumero,
    codigo,
    parcelas: numParcelas,
    valor:    valorTotal,
    vlparc:   valorParc,
    data_:    hoje,
    por:      usuario,
    stat:     'A',
    obs:      obsAcordo.slice(0, 100),
  }

  const acordosFields = DBF_STRUCTURES.ACORDOS
  const newAcordosTable = acordosTable
    ? {
        ...acordosTable,
        records: [...acordosTable.records, novoAcordo],
        header: { ...acordosTable.header, recordCount: acordosTable.records.length + 1 },
      }
    : {
        header: {
          version: 3, lastUpdate: hoje, recordCount: 1,
          headerSize: 32 + acordosFields.length * 32 + 1,
          recordSize: 1 + acordosFields.reduce((s, f) => s + f.length, 0),
          fields: acordosFields,
        },
        records: [novoAcordo],
      }

  // ── 4. Serializa tudo antes de qualquer escrita ──────────────────────────────
  // Importante: obtém TODOS os FileHandle e cria TODOS os writables ANTES de
  // qualquer escrita. Quando ACORDOS.DBF não existe ainda, o Chrome cria o entry
  // em memória mas não o "ancora" no disco. Se o diretório muda entre createWritable
  // e write (por causa de outra escrita), o writable fica inválido (InvalidStateError).
  // Criar todos os writables upfront garante que os swap-files são abertos enquanto
  // o diretório ainda está em estado limpo.

  const bufArqgrup  = newArqgrup ? serializeDbf(newArqgrup) : null
  const bufTaxas    = serializeDbf(newTaxasTable)
  const bufAcordos  = serializeDbf(newAcordosTable)

  const fhArqgrup  = newArqgrup ? await dirHandle.getFileHandle('ARQGRUP.DBF') : null
  const fhTaxas    = await dirHandle.getFileHandle('TAXAS.DBF')
  const fhAcordos  = await dirHandle.getFileHandle('ACORDOS.DBF', { create: true })

  const wArqgrup   = fhArqgrup  ? await fhArqgrup.createWritable()  : null
  const wTaxas     = await fhTaxas.createWritable()
  const wAcordos   = await fhAcordos.createWritable()

  // Agora escreve — todos os writables já estão abertos
  if (wArqgrup && newArqgrup && bufArqgrup) {
    await wArqgrup.write(bufArqgrup)
    await wArqgrup.close()
    tables.set('arqgrup', newArqgrup)
  }

  await wTaxas.write(bufTaxas)
  await wTaxas.close()
  tables.set('taxas', newTaxasTable)

  await wAcordos.write(bufAcordos)
  await wAcordos.close()
  tables.set('acordos', newAcordosTable)

  return { numero, parcelas, valorParc }
}
