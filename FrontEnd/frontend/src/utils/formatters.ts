import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date as string)
  if (!isValid(d)) return ''
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

// Converte Date (ou string ISO após rehidratação do store) para o formato esperado por <input type="date">
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date as string)
  if (isNaN(d.getTime())) return ''
  // Usa métodos de hora local para evitar bug de fuso horário
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return ''
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCep(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return cep
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatTelefone(tel: string): string {
  const clean = tel.replace(/\D/g, '')
  if (clean.length === 10) return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  if (clean.length === 11) return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  return tel
}

export function formatMesRef(mesref: string): string {
  // Formato: MMAA -> MM/AA
  if (!mesref || mesref.length < 4) return mesref
  return `${mesref.substring(0, 2)}/${mesref.substring(2, 4)}`
}

export function parseDate(dateStr: string): Date | null {
  // dd/MM/yyyy
  if (!dateStr || dateStr.length < 8) return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    return isValid(d) ? d : null
  }
  return null
}

export function dateToDbf(date: Date | null): string {
  if (!date || !isValid(date)) return '        '
  return format(date, 'yyyyMMdd')
}

export function situacaoLabel(sit: string): string {
  const map: Record<string, string> = {
    '1': 'Ativo',
    '2': 'Cancelado',
    '3': 'Suspenso',
    '4': 'Inadimplente',
    '0': 'Inativo',
  }
  return map[sit?.trim()] ?? sit ?? '-'
}

export function estadoCivilLabel(ec: string): string {
  const map: Record<string, string> = {
    'SO': 'Solteiro(a)',
    'CA': 'Casado(a)',
    'DI': 'Divorciado(a)',
    'VI': 'Viúvo(a)',
    'SE': 'Separado(a)',
    'UN': 'União Estável',
  }
  return map[ec?.trim().toUpperCase()] ?? ec ?? '-'
}

export function formaPagtoLabel(fp: string): string {
  const map: Record<string, string> = {
    '01': 'Mensalidade',
    '02': 'Carnê',
    '03': 'Débito automático',
    '04': 'Boleto',
    '05': 'Cartão',
  }
  return map[fp?.trim()] ?? fp ?? '-'
}
