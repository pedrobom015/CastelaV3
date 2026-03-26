import type { DbfTable, DbfField } from '../services/dbf/DbfReader'
import type { DbfRecord } from '../types/models'

// Retorna todos os registros de uma tabela (não deletados)
export function getRecords(table: DbfTable | undefined): DbfRecord[] {
  if (!table) return []
  return table.records
}

// Busca um registro por campo/valor
export function findRecord(
  table: DbfTable | undefined,
  field: string,
  value: string | number
): DbfRecord | undefined {
  if (!table) return undefined
  const v = typeof value === 'string' ? value.trim() : value
  return table.records.find((r) => {
    const rv = r[field]
    if (typeof rv === 'string') return rv.trim() === v
    return rv === v
  })
}

// Filtra registros por campo/valor
export function filterRecords(
  table: DbfTable | undefined,
  field: string,
  value: string | number
): DbfRecord[] {
  if (!table) return []
  const v = typeof value === 'string' ? value.trim().toUpperCase() : value
  return table.records.filter((r) => {
    const rv = r[field]
    if (typeof rv === 'string') return rv.trim().toUpperCase() === v
    return rv === v
  })
}

// Busca registros com múltiplos critérios
export function queryRecords(
  table: DbfTable | undefined,
  criteria: Partial<Record<string, string | number | null>>
): DbfRecord[] {
  if (!table) return []
  return table.records.filter((r) =>
    Object.entries(criteria).every(([field, value]) => {
      if (value === null || value === undefined) return true
      const rv = r[field]
      if (typeof rv === 'string' && typeof value === 'string') {
        return rv.trim().toUpperCase() === value.trim().toUpperCase()
      }
      return rv === value
    })
  )
}

// Pesquisa por texto parcial em qualquer campo string
export function searchRecords(
  table: DbfTable | undefined,
  searchText: string,
  fields?: string[]
): DbfRecord[] {
  if (!table || !searchText.trim()) return getRecords(table)
  const text = searchText.trim().toLowerCase()
  const searchFields = fields ?? table.header.fields.filter(f => f.type === 'C').map(f => f.name)

  return table.records.filter((r) =>
    searchFields.some((field) => {
      const val = r[field]
      if (typeof val === 'string') return val.toLowerCase().includes(text)
      return false
    })
  )
}

// Ordena registros por campo
export function sortRecords(records: DbfRecord[], field: string, asc = true): DbfRecord[] {
  return [...records].sort((a, b) => {
    const va = a[field] ?? ''
    const vb = b[field] ?? ''
    if (va < vb) return asc ? -1 : 1
    if (va > vb) return asc ? 1 : -1
    return 0
  })
}

// Gera próximo código numérico
export function nextCode(table: DbfTable | undefined, field: string, pad = 9): string {
  if (!table || table.records.length === 0) return '1'.padStart(pad, '0')
  const max = table.records.reduce((acc, r) => {
    const val = parseInt(String(r[field] ?? '0'), 10)
    return val > acc ? val : acc
  }, 0)
  return String(max + 1).padStart(pad, '0')
}

// Cria estrutura de cabeçalho para nova tabela DBF
export function createDbfHeader(fields: DbfField[]): { headerSize: number; recordSize: number } {
  const headerSize = 32 + fields.length * 32 + 1
  const recordSize = 1 + fields.reduce((acc, f) => acc + f.length, 0)
  return { headerSize, recordSize }
}

// Converte DbfRecord para tipo específico (helper genérico)
export function recordAs<T>(record: DbfRecord): T {
  return record as unknown as T
}

// Agrupa registros por campo
export function groupBy(records: DbfRecord[], field: string): Record<string, DbfRecord[]> {
  return records.reduce<Record<string, DbfRecord[]>>((acc, r) => {
    const key = String(r[field] ?? '').trim()
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})
}

// Soma campo numérico
export function sumField(records: DbfRecord[], field: string): number {
  return records.reduce((acc, r) => acc + (Number(r[field]) || 0), 0)
}
