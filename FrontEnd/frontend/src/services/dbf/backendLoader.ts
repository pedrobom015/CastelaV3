/**
 * backendLoader.ts
 * Carrega tabelas DBF a partir do backend Python (modo demo).
 * Reconstrói a mesma estrutura DbfTable produzida pelo DbfReader local,
 * garantindo total compatibilidade com o restante do app.
 */
import type { DbfTable, DbfField, DbfHeader } from './DbfReader'
import type { DbfRecord } from '../../types/models'

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '/api'

// Lista derivada dos arquivos presentes em dados-teste/
const ALL_TABLES = [
  'GRUPOS',   'INSCRITS', 'TAXAS',    'COBRADOR', 'REGIAO',  'ARQGRUP',
  'CLASSES',  'CIRCULAR', 'PAR_ADM',  'PRADENDO', 'ADENDOS', 'CANCELS',
  'PRCESSOS', 'EMCARNE',  'TCARNES',  'BOLETOS',  'BXBOLET', 'BXREC',
  'BXFCC',    'BXTXAS',   'CGRUPOS',  'HISTORIC', 'MENSAG',  'JUROS',
  'CSTSEG',   'ALENDER',  'TXENTR',   'TXPROC',   'LBXBOLET','TFILIAIS',
  'TX2VIA',   'FNCS',     'ATEND800',
]

function parseBackendValue(
  value: unknown,
  type: string,
): string | number | Date | null | boolean {
  if (value === null || value === undefined) return null
  switch (type) {
    case 'D': {
      if (typeof value !== 'string' || !value.trim()) return null
      // Força interpretação local para evitar shift de fuso UTC
      const d = new Date(value + 'T00:00:00')
      return isNaN(d.getTime()) ? null : d
    }
    case 'N':
    case 'F':
      return Number(value) || 0
    case 'L':
      return Boolean(value)
    default:
      return String(value ?? '').trimEnd()
  }
}

async function loadTableFromBackend(tableName: string): Promise<DbfTable> {
  const res = await fetch(`${BACKEND_URL}/tables/${tableName}`)
  if (!res.ok) {
    throw new Error(`Backend retornou ${res.status} para ${tableName}`)
  }

  const data = await res.json() as {
    fields: Array<{ name: string; type: string; length: number }>
    records: Record<string, unknown>[]
  }

  const fields: DbfField[] = data.fields.map(f => ({
    name: f.name.toLowerCase(),
    type: f.type,
    length: f.length,
    decimals: 0,
  }))

  const typeMap = new Map(data.fields.map(f => [f.name.toLowerCase(), f.type]))

  const records: DbfRecord[] = data.records.map(raw => {
    const rec: DbfRecord = {}
    for (const [key, val] of Object.entries(raw)) {
      const k = key.toLowerCase()
      rec[k] = parseBackendValue(val, typeMap.get(k) ?? 'C')
    }
    return rec
  })

  const header: DbfHeader = {
    version: 3,
    lastUpdate: new Date(),
    recordCount: records.length,
    headerSize: 32 + fields.length * 32 + 1,
    recordSize: 1 + fields.reduce((s, f) => s + f.length, 0),
    fields,
  }

  return { header, records, fileName: `${tableName.toUpperCase()}.DBF` }
}

// ---------- escrita ----------------------------------------------------------

/** Serializa um DbfRecord para o formato JSON que o backend espera (datas como ISO string). */
function serializeRecord(record: DbfRecord): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(record)) {
    if (v instanceof Date) {
      out[k] = v.toISOString().slice(0, 10) // "YYYY-MM-DD"
    } else {
      out[k] = v
    }
  }
  return out
}

/** Atualiza um registro existente pelo índice (0-based). */
export async function updateRecord(
  tableName: string,
  recordIndex: number,
  record: DbfRecord,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/tables/${tableName}/records/${recordIndex}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializeRecord(record)),
    },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? `Erro ${res.status} ao atualizar ${tableName}[${recordIndex}]`)
  }
}

/** Adiciona um novo registro ao final da tabela. Retorna o índice criado. */
export async function addRecord(
  tableName: string,
  record: DbfRecord,
): Promise<number> {
  const res = await fetch(`${BACKEND_URL}/tables/${tableName}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializeRecord(record)),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? `Erro ${res.status} ao adicionar em ${tableName}`)
  }
  const data = await res.json() as { index: number }
  return data.index
}

/** Marca um registro como deletado (soft delete DBF). */
export async function deleteRecord(
  tableName: string,
  recordIndex: number,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/tables/${tableName}/records/${recordIndex}`,
    { method: 'DELETE' },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? `Erro ${res.status} ao deletar ${tableName}[${recordIndex}]`)
  }
}

// ---------- leitura em lote --------------------------------------------------

export async function loadAllFromBackend(
  onProgress?: (loaded: number, total: number, name: string) => void,
): Promise<Map<string, DbfTable>> {
  const result = new Map<string, DbfTable>()

  for (let i = 0; i < ALL_TABLES.length; i++) {
    const name = ALL_TABLES[i]
    onProgress?.(i, ALL_TABLES.length, name)
    try {
      const table = await loadTableFromBackend(name)
      result.set(name.toLowerCase(), table)
    } catch (e) {
      console.warn(`[backendLoader] Erro ao carregar ${name}:`, e)
    }
  }

  onProgress?.(ALL_TABLES.length, ALL_TABLES.length, 'Concluído')
  return result
}
