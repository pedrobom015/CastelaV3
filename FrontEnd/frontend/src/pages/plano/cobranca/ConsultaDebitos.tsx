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
  '1': 'Pago', '2': 'Pendente', '3': 'Vencido', '0': 'Cancelado', 'B': 'Baixado',
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
  {
    key: 'stat', label: 'Situação', width: '100px',
    render: (v) => {
      const s = String(v ?? '').trim()
      const label = STAT_LABEL[s] ?? s
      const color = s === 'B' || s === '1' ? 'bg-green-100 text-green-800' : s === '0' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-800'
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
  const [emissaoDe, setEmissaoDe] = useState('')
  const [emissaoAte, setEmissaoAte] = useState('')
  const [pagtoDe, setPagtoDe] = useState('')
  const [pagtoAte, setPagtoAte] = useState('')
  const [filtrosOpen, setFiltrosOpen] = useState(false)

  const table = getTable('taxas')

  const records = useMemo(() => {
    let recs = getRecords(table) as TaxaRec[]
    if (filterCodigo.trim()) recs = recs.filter((r) => String(r.codigo ?? '').trim().toLowerCase().includes(filterCodigo.toLowerCase()))
    if (filterCobrador.trim()) recs = recs.filter((r) => String(r.cobrador ?? '').trim().toLowerCase().includes(filterCobrador.toLowerCase()))
    if (filterCirc.trim()) recs = recs.filter((r) => String(r.circ ?? '').trim().toLowerCase().includes(filterCirc.toLowerCase()))
    if (emissaoDe) recs = recs.filter((r) => r.emissao_ instanceof Date && r.emissao_ >= new Date(emissaoDe + 'T00:00:00'))
    if (emissaoAte) recs = recs.filter((r) => r.emissao_ instanceof Date && r.emissao_ <= new Date(emissaoAte + 'T23:59:59'))
    if (pagtoDe) recs = recs.filter((r) => r.pgto_ instanceof Date && r.pgto_ >= new Date(pagtoDe + 'T00:00:00'))
    if (pagtoAte) recs = recs.filter((r) => r.pgto_ instanceof Date && r.pgto_ <= new Date(pagtoAte + 'T23:59:59'))
    if (search.trim()) recs = searchRecords({ ...table!, records: recs }, search, ['codigo', 'tipo', 'circ', 'cobrador']) as TaxaRec[]
    return recs
  }, [table, search, filterCodigo, filterCobrador, filterCirc, emissaoDe, emissaoAte, pagtoDe, pagtoAte])

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
      <div className="bg-white border border-gray-200 rounded mb-4">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:bg-gray-50 transition-colors"
          onClick={() => setFiltrosOpen((o) => !o)}
        >
          <span className="text-xs text-gray-500">{filtrosOpen ? '▲' : '▼'}</span>
          <span>Filtros</span>
        </button>
        {filtrosOpen && (
          <div className="px-3 pb-3">
            <FormRow cols={7}>
              <FormInput
                label="Código"
                value={filterCodigo}
                onChange={(e) => setFilterCodigo(e.target.value)}
                placeholder="Código..."
              />
              <FormInput
                label="Cobrador"
                value={filterCobrador}
                onChange={(e) => setFilterCobrador(e.target.value)}
                placeholder="Cobrador..."
              />
              <FormInput
                label="Circular"
                value={filterCirc}
                onChange={(e) => setFilterCirc(e.target.value)}
                placeholder="Circular..."
              />
              <FormInput
                label="Emissão de"
                type="date"
                value={emissaoDe}
                onChange={(e) => setEmissaoDe(e.target.value)}
              />
              <FormInput
                label="Emissão até"
                type="date"
                value={emissaoAte}
                onChange={(e) => setEmissaoAte(e.target.value)}
              />
              <FormInput
                label="Pagamento de"
                type="date"
                value={pagtoDe}
                onChange={(e) => setPagtoDe(e.target.value)}
              />
              <FormInput
                label="Pagamento até"
                type="date"
                value={pagtoAte}
                onChange={(e) => setPagtoAte(e.target.value)}
              />
            </FormRow>
          </div>
        )}
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
