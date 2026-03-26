/**
 * BuscaContratoInput — campo de busca inteligente de contrato
 * Busca por código, nome, telefone ou CPF com dropdown de sugestões.
 */
import { useRef, useEffect, useMemo } from 'react'
import { useAppStore } from '../../store/appStore'

interface Props {
  value: string
  onChange: (v: string) => void
  onSelecionar: (codigo: string) => void
  dropdownAberto: boolean
  setDropdownAberto: (v: boolean) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function BuscaContratoInput({
  value,
  onChange,
  onSelecionar,
  dropdownAberto,
  setDropdownAberto,
  disabled,
  autoFocus,
}: Props) {
  const gruposTable = useAppStore((s) => s.tables.get('grupos'))
  const wrapRef = useRef<HTMLDivElement>(null)

  const sugestoes = useMemo(() => {
    const q = value.trim()
    if (!q || q.length < 2 || !gruposTable) return []
    const qUp = q.toUpperCase()
    const qDigits = q.replace(/\D/g, '')
    return gruposTable.records
      .filter((r) => {
        if (r._deleted) return false
        const cod = String(r.codigo ?? '').trim()
        const nom = String(r.nome ?? '').toUpperCase()
        const tel = String(r.telefone ?? '').replace(/\D/g, '')
        const cpf = String(r.cpf ?? '').replace(/\D/g, '')
        return (
          cod.includes(qUp) ||
          nom.includes(qUp) ||
          (qDigits.length >= 3 && tel.includes(qDigits)) ||
          (qDigits.length >= 5 && cpf.includes(qDigits))
        )
      })
      .slice(0, 12)
  }, [value, gruposTable])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setDropdownAberto])

  return (
    <div className="relative flex-1 min-w-64" ref={wrapRef}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Buscar por código, nome, telefone ou CPF
      </label>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setDropdownAberto(true)
        }}
        onFocus={() => value.trim().length >= 2 && setDropdownAberto(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (sugestoes.length === 1) {
              onSelecionar(String(sugestoes[0].codigo ?? '').trim())
            } else {
              onSelecionar(value.trim())
            }
          } else if (e.key === 'Escape') {
            setDropdownAberto(false)
          }
        }}
        className="w-full border rounded px-3 py-1.5 text-sm"
        placeholder="Ex: 000000001 · João Silva · (11)99999 · 123.456..."
        disabled={disabled}
      />

      {dropdownAberto && sugestoes.length > 0 && !disabled && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {sugestoes.map((r, i) => {
            const cod = String(r.codigo ?? '').trim()
            const nom = String(r.nome ?? '').trim()
            const tel = String(r.telefone ?? '').trim()
            const cpf = String(r.cpf ?? '').trim()
            const sit = String(r.situacao ?? '').trim()
            return (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelecionar(cod)
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-3 text-sm"
              >
                <span className="font-mono text-blue-900 font-bold w-24 shrink-0">{cod}</span>
                <span className="flex-1 font-medium truncate">{nom}</span>
                {cpf && <span className="text-xs text-gray-400 shrink-0 hidden md:block">{cpf}</span>}
                {tel && <span className="text-xs text-gray-400 shrink-0 hidden md:block">{tel}</span>}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${sit === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {sit}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
