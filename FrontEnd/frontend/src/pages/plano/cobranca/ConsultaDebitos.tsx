import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { PageHeader, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords, sumField } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

type TaxaRec = DbfRecord & {
  codigo: string; tipo: string; circ: string; emissao_: Date | null
  valor: number; pgto_: Date | null; valorpg: number; cobrador: string; stat: string
}

const STAT_LABEL: Record<string, string> = {
  '1': 'Pago', '2': 'Pendente', '3': 'Vencido', '0': 'Cancelado',
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  {
    key: 'emissao_', label: 'Emissão', width: '100px',
    render: (v) => formatDate(v as Date),
  },
  { key: 'valor', label: 'Valor', width: '100px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'pgto_', label: 'Dt. Pagto.', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'valorpg', label: 'Vl. Pago', width: '100px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'cobrador', label: 'Cobrador', width: '80px', align: 'center' },
  {
    key: 'stat', label: 'Situação', width: '100px',
    render: (v) => {
      const s = String(v ?? '').trim()
      const label = STAT_LABEL[s] ?? s
      const color = s === '1' ? 'bg-green-100 text-green-800' : s === '0' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-800'
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
    },
  },
]

export function ConsultaDebitos() {
  const { getTable } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterCodigo, setFilterCodigo] = useState('')
  const [filterCobrador, setFilterCobrador] = useState('')
  const [filterCirc, setFilterCirc] = useState('')

  const table = getTable('taxas')

  const records = useMemo(() => {
    let recs = getRecords(table) as TaxaRec[]
    if (filterCodigo.trim()) recs = recs.filter((r) => String(r.codigo ?? '').trim().toLowerCase().includes(filterCodigo.toLowerCase()))
    if (filterCobrador.trim()) recs = recs.filter((r) => String(r.cobrador ?? '').trim().toLowerCase().includes(filterCobrador.toLowerCase()))
    if (filterCirc.trim()) recs = recs.filter((r) => String(r.circ ?? '').trim().toLowerCase().includes(filterCirc.toLowerCase()))
    if (search.trim()) recs = searchRecords({ ...table!, records: recs }, search, ['codigo', 'tipo', 'circ', 'cobrador']) as TaxaRec[]
    return recs
  }, [table, search, filterCodigo, filterCobrador, filterCirc])

  const totalEmitido = useMemo(() => sumField(records, 'valor'), [records])
  const totalPago = useMemo(() => sumField(records, 'valorpg'), [records])
  const pendente = totalEmitido - totalPago

  return (
    <div className="p-4">
      <PageHeader
        title="Consulta de Débitos"
        subtitle="TAXAS.DBF — Consulta e análise de débitos (somente leitura)"
        actions={
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar..." />
        }
      />

      {/* Filtros rápidos */}
      <div className="bg-white border border-gray-200 rounded p-3 mb-4">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Filtros</div>
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Código"
            value={filterCodigo}
            onChange={(e) => setFilterCodigo(e.target.value)}
            placeholder="Filtrar por código..."
          />
          <FormInput
            label="Cobrador"
            value={filterCobrador}
            onChange={(e) => setFilterCobrador(e.target.value)}
            placeholder="Filtrar por cobrador..."
          />
          <FormInput
            label="Circular"
            value={filterCirc}
            onChange={(e) => setFilterCirc(e.target.value)}
            placeholder="Filtrar por circular..."
          />
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable
        columns={COLUMNS}
        data={records as DbfRecord[]}
        pageSize={10}
      />

      {/* Totalizadores */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-900" />
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Emitido</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(totalEmitido)}</p>
            <p className="text-xs text-gray-400 mt-1">{records.length} registro(s)</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500" />
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Pago</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalPago)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {totalEmitido > 0 ? Math.round((totalPago / totalEmitido) * 100) : 0}% quitado
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-red-400" />
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pendente</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(pendente)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {totalEmitido > 0 ? Math.round((pendente / totalEmitido) * 100) : 0}% em aberto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
