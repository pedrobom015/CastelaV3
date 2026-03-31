import { cp850ToString } from './cp850'
import type { DbfRecord } from '../../types/models'
import { saveTableToBackend } from './backendWriter'

const utf8Decoder = new TextDecoder('utf-8', { fatal: false })

/**
 * Decodifica bytes de um campo textual do DBF.
 * Tenta UTF-8 primeiro; se o resultado contiver o caractere de substituição (U+FFFD),
 * usa CP850 (codificação padrão de arquivos DBF antigos/DOS).
 */
function decodeDbfString(bytes: Uint8Array): string {
  const utf8Result = utf8Decoder.decode(bytes)
  if (utf8Result.includes('\uFFFD')) {
    return cp850ToString(bytes)
  }
  return utf8Result.trimEnd()
}

const IS_DEMO = import.meta.env.VITE_MODE_DEMO === 'true'

export interface DbfField {
  name: string
  type: string   // C=Char, N=Numeric, D=Date, L=Logical, M=Memo
  length: number
  decimals: number
}

export interface DbfHeader {
  version: number
  lastUpdate: Date
  recordCount: number
  headerSize: number
  recordSize: number
  fields: DbfField[]
}

export interface DbfTable {
  header: DbfHeader
  records: DbfRecord[]
  fileName?: string
}

function readUint32LE(buffer: ArrayBuffer, offset: number): number {
  const view = new DataView(buffer)
  return view.getUint32(offset, true)
}

function readUint16LE(buffer: ArrayBuffer, offset: number): number {
  const view = new DataView(buffer)
  return view.getUint16(offset, true)
}

function parseDbfDate(str: string): Date | null {
  // DBF date format: YYYYMMDD
  if (!str || str.trim() === '        ' || str.trim() === '00000000') return null
  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10)
  const day = parseInt(str.substring(6, 8), 10)
  if (isNaN(year) || isNaN(month) || isNaN(day) || year === 0) return null
  return new Date(year, month - 1, day)
}

export function parseDbfBuffer(buffer: ArrayBuffer, fileName: string): DbfTable {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  // Header: primeiros 32 bytes
  const version = bytes[0]
  const lastUpdate = new Date(1900 + bytes[1], bytes[2] - 1, bytes[3])
  const recordCount = readUint32LE(buffer, 4)
  const headerSize = readUint16LE(buffer, 8)
  const recordSize = readUint16LE(buffer, 10)

  // Field descriptors: 32 bytes cada, começam no offset 32
  const fields: DbfField[] = []
  let offset = 32

  while (offset < headerSize - 1 && bytes[offset] !== 0x0D) {
    const nameBytes = bytes.slice(offset, offset + 11)
    // Nome termina no primeiro byte nulo
    let nameEnd = 0
    while (nameEnd < 11 && nameBytes[nameEnd] !== 0) nameEnd++
    const name = cp850ToString(nameBytes.slice(0, nameEnd)).toLowerCase() // nomes de campos são sempre ASCII
    const type = String.fromCharCode(bytes[offset + 11])
    const length = bytes[offset + 16]
    const decimals = bytes[offset + 17]

    fields.push({ name, type, length, decimals })
    offset += 32
  }

  // Registros
  const records: DbfRecord[] = []
  let recOffset = headerSize

  for (let i = 0; i < recordCount; i++) {
    if (recOffset + recordSize > buffer.byteLength) break
    const deletionFlag = bytes[recOffset]
    if (deletionFlag === 0x2A) { // '*' = deletado
      recOffset += recordSize
      continue
    }

    const record: DbfRecord = {}
    let fieldOffset = recOffset + 1 // pula o flag de deleção

    for (const field of fields) {
      const rawBytes = bytes.slice(fieldOffset, fieldOffset + field.length)
      const rawStr = decodeDbfString(rawBytes)

      switch (field.type) {
        case 'C': // Character
          record[field.name] = rawStr.trimEnd()
          break
        case 'N': // Numeric
        case 'F': // Float
          {
            const numStr = rawStr.trim()
            record[field.name] = numStr === '' ? 0 : parseFloat(numStr) || 0
          }
          break
        case 'D': // Date
          record[field.name] = parseDbfDate(rawStr)
          break
        case 'L': // Logical
          record[field.name] = rawStr.trim().toUpperCase() === 'T' || rawStr.trim() === 'Y'
          break
        case 'M': // Memo (só armazena referência, não lemos .fpt por ora)
          record[field.name] = ''
          break
        default:
          record[field.name] = rawStr.trimEnd()
      }

      fieldOffset += field.length
    }

    records.push(record)
    recOffset += recordSize
  }

  return {
    header: { version, lastUpdate, recordCount: records.length, headerSize, recordSize, fields },
    records,
    fileName,
  }
}

// Carrega todos os DBFs da pasta dados-teste via fetch (sem File System Access API)
export async function loadDadosTeste(
  onProgress?: (loaded: number, total: number, name: string) => void
): Promise<Map<string, DbfTable>> {
  const indexRes = await fetch('/dados-teste/index.json')
  if (!indexRes.ok) throw new Error('Pasta dados-teste não encontrada. Execute: node seed-data.cjs')
  const text = await indexRes.text()
  let files: string[]
  try {
    files = JSON.parse(text)
  } catch {
    throw new Error('Servidor retornou resposta inválida para dados-teste/index.json. Reinicie o servidor com npm run dev.')
  }
  const result = new Map<string, DbfTable>()

  for (let i = 0; i < files.length; i++) {
    const name = files[i]
    onProgress?.(i, files.length, name)
    try {
      const res = await fetch(`/dados-teste/${name}`)
      const buffer = await res.arrayBuffer()
      const table = parseDbfBuffer(buffer, name)
      result.set(name.toLowerCase().replace('.dbf', ''), table)
    } catch (e) {
      console.warn(`Erro ao carregar ${name}:`, e)
    }
  }

  onProgress?.(files.length, files.length, 'Concluído')
  return result
}

// Lê um arquivo DBF de um FileSystemFileHandle ou File
export async function readDbfFile(file: File): Promise<DbfTable> {
  const buffer = await file.arrayBuffer()
  return parseDbfBuffer(buffer, file.name)
}

// Lê todos os DBFs de um diretório
export async function readAllDbfs(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (loaded: number, total: number, name: string) => void
): Promise<Map<string, DbfTable>> {
  const result = new Map<string, DbfTable>()
  const dbfFiles: File[] = []

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file' && name.toLowerCase().endsWith('.dbf')) {
      const file = await (handle as FileSystemFileHandle).getFile()
      dbfFiles.push(file)
    }
  }

  for (let i = 0; i < dbfFiles.length; i++) {
    const file = dbfFiles[i]
    onProgress?.(i, dbfFiles.length, file.name)
    try {
      const table = await readDbfFile(file)
      const key = file.name.toLowerCase().replace('.dbf', '')
      result.set(key, table)
    } catch (e) {
      console.warn(`Erro ao ler ${file.name}:`, e)
    }
  }

  onProgress?.(dbfFiles.length, dbfFiles.length, 'Concluído')
  return result
}

// Lê um DBF específico do diretório
export async function readSingleDbf(
  dirHandle: FileSystemDirectoryHandle,
  dbfName: string
): Promise<DbfTable | null> {
  const nameUpper = dbfName.toUpperCase().endsWith('.DBF') ? dbfName.toUpperCase() : `${dbfName.toUpperCase()}.DBF`
  const nameLower = nameUpper.toLowerCase()

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file' && (name.toUpperCase() === nameUpper || name === nameLower)) {
      const file = await (handle as FileSystemFileHandle).getFile()
      return readDbfFile(file)
    }
  }
  return null
}

// Salva registros de volta ao DBF (sobrescreve o arquivo)
// Em modo demo (VITE_MODE_DEMO=true) roteia para o backend Python.
export async function writeDbfFile(
  dirHandle: FileSystemDirectoryHandle,
  dbfName: string,
  table: DbfTable
): Promise<void> {
  if (IS_DEMO) {
    await saveTableToBackend(dbfName, table.records)
    return
  }

  const nameUpper = dbfName.toUpperCase().endsWith('.DBF') ? dbfName.toUpperCase() : `${dbfName.toUpperCase()}.DBF`

  const buffer = serializeDbf(table)

  // Usa getFileHandle com create:true para abrir ou criar sem iterar o diretório.
  // Iterar dirHandle.entries() após uma escrita pode causar InvalidStateError
  // porque o browser detecta que o estado do diretório mudou.
  const fileHandle = await dirHandle.getFileHandle(nameUpper, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(buffer)
  await writable.close()
}

export function serializeDbf(table: DbfTable): ArrayBuffer {
  const { header, records } = table

  // Always recompute from actual fields — never trust stored header values
  // (they may be 0 for brand-new tables created without reading from disk)
  const headerSize  = 32 + header.fields.length * 32 + 1
  const recordSize  = 1 + header.fields.reduce((s, f) => s + f.length, 0)
  const totalSize   = headerSize + records.length * recordSize + 1

  const buffer = new ArrayBuffer(totalSize)
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  // Header
  bytes[0] = header.version || 3
  const now = new Date()
  bytes[1] = now.getFullYear() - 1900
  bytes[2] = now.getMonth() + 1
  bytes[3] = now.getDate()
  view.setUint32(4, records.length, true)
  view.setUint16(8, headerSize, true)
  view.setUint16(10, recordSize, true)

  // Field descriptors
  let offset = 32
  for (const field of header.fields) {
    const nameBytes = new TextEncoder().encode(field.name.toUpperCase().padEnd(11, '\0'))
    for (let i = 0; i < 11; i++) bytes[offset + i] = nameBytes[i] || 0
    bytes[offset + 11] = field.type.charCodeAt(0)
    bytes[offset + 16] = field.length
    bytes[offset + 17] = field.decimals
    offset += 32
  }
  bytes[offset] = 0x0D // terminator

  // Records
  let recOffset = headerSize
  for (const record of records) {
    bytes[recOffset] = 0x20 // não deletado
    let fieldOffset = recOffset + 1

    for (const field of header.fields) {
      const val = record[field.name]
      let str = ''

      switch (field.type) {
        case 'C':
          str = String(val ?? '').padEnd(field.length, ' ').substring(0, field.length)
          break
        case 'N':
        case 'F':
          {
            const num = Number(val ?? 0)
            if (field.decimals > 0) {
              str = num.toFixed(field.decimals).padStart(field.length, ' ').substring(0, field.length)
            } else {
              str = Math.floor(num).toString().padStart(field.length, ' ').substring(0, field.length)
            }
          }
          break
        case 'D':
          {
            // Aceita Date object ou string ISO (vinda do IDB após rehydration)
            let d: Date | null = null
            if (val instanceof Date) {
              d = val
            } else if (typeof val === 'string' && val.trim()) {
              const parsed = new Date(val)
              if (!isNaN(parsed.getTime())) d = parsed
            }
            if (d && !isNaN(d.getTime())) {
              str = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
            } else {
              str = '        '
            }
          }
          break
        case 'L':
          str = val ? 'T' : 'F'
          break
        case 'M':
          str = '          ' // 10 spaces - memo reference
          break
        default:
          str = String(val ?? '').padEnd(field.length, ' ').substring(0, field.length)
      }

      const encoded = new TextEncoder().encode(str)
      for (let i = 0; i < field.length; i++) {
        bytes[fieldOffset + i] = encoded[i] || 0x20
      }
      fieldOffset += field.length
    }
    recOffset += recordSize
  }

  bytes[recOffset] = 0x1A // EOF
  return buffer
}
