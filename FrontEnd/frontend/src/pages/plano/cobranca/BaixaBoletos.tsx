import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { PageHeader, SearchBar } from '../../../components/common/PageHeader'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, filterRecords, searchRecords, sumField } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

type LbxBoletRec = DbfRecord & {
  nrlote: string; emissao_: Date | null; nfcc: string
  totdesp: number; totcred: number; totliq: number; por: string; em_: Date | null
}

type BxBoletRec = DbfRecord & {
  nrlote: string; nnumero: string; valor: number; vldesp: number
}

const LOTE_COLUMNS: Column[] = [
  { key: 'nrlote', label: 'Nº Lote', width: '90px' },
  { key: 'emissao_', label: 'Emissão', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'nfcc', label: 'NF CC', width: '90px' },
  { key: 'totdesp', label: 'Total Despesas', width: '130px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'totcred', label: 'Total Crédito', width: '130px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'totliq', label: 'Total Líquido', width: '130px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'por', label: 'Por', width: '90px' },
  { key: 'em_', label: 'Data', width: '100px', render: (v) => formatDate(v as Date) },
]

const DETALHE_COLUMNS: Column[] = [
  { key: 'nrlote', label: 'Nº Lote', width: '90px' },
  { key: 'nnumero', label: 'Nosso Número', width: '130px' },
  { key: 'valor', label: 'Valor', width: '120px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'vldesp', label: 'Vl. Despesa', width: '120px', align: 'right', render: (v) => formatCurrency(Number(v)) },
]

export function BaixaBoletos() {
  const { getTable } = useAppStore()
  const [search, setSearch] = useState('')
  const [selectedLote, setSelectedLote] = useState<LbxBoletRec | null>(null)

  const lbxTable = getTable('lbxbolet')
  const bxTable = getTable('bxbolet')

  const loteRecords = useMemo(() => {
    return searchRecords(lbxTable, search, ['nrlote', 'nfcc', 'por']) as LbxBoletRec[]
  }, [lbxTable, search])

  const detalheRecords = useMemo(() => {
    if (!selectedLote) return []
    return filterRecords(bxTable, 'nrlote', String(selectedLote.nrlote ?? '').trim()) as BxBoletRec[]
  }, [bxTable, selectedLote])

  const totalValor = useMemo(() => sumField(detalheRecords, 'valor'), [detalheRecords])
  const totalDesp = useMemo(() => sumField(detalheRecords, 'vldesp'), [detalheRecords])

  return (
    <div className="p-4">
      <PageHeader
        title="Baixa de Boletos"
        subtitle="LBXBOLET.DBF + BXBOLET.DBF — Consulta de lotes de baixa (somente leitura)"
        actions={
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por lote, NF CC..." />
        }
      />

      <div className="mb-2 text-sm text-gray-500">{loteRecords.length} lote(s) — Clique em um lote para ver os detalhes</div>

      <div className="grid grid-cols-1 gap-4">
        {/* Tabela de Lotes */}
        <div>
          <h2 className="text-sm font-semibold text-blue-900 uppercase mb-2 border-b border-blue-200 pb-1">
            Lotes de Baixa
          </h2>
          <DataTable
            columns={LOTE_COLUMNS}
            data={loteRecords as DbfRecord[]}
            onRowClick={(r) => setSelectedLote(r as LbxBoletRec)}
            selectedRow={selectedLote as DbfRecord | null}
            pageSize={20}
            compact
          />
        </div>

        {/* Detalhe do Lote */}
        {selectedLote && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-blue-900 uppercase border-b border-blue-200 pb-1">
                Detalhes do Lote {String(selectedLote.nrlote ?? '').trim()}
              </h2>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedLote(null)}
              >
                ✕ Fechar
              </button>
            </div>

            <DataTable
              columns={DETALHE_COLUMNS}
              data={detalheRecords as DbfRecord[]}
              pageSize={20}
              compact
              emptyMessage="Nenhum detalhe encontrado para este lote"
            />

            {detalheRecords.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                  <div className="text-xs text-blue-900 font-semibold mb-1">Total Valor</div>
                  <div className="font-bold text-blue-900">{formatCurrency(totalValor)}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                  <div className="text-xs text-red-700 font-semibold mb-1">Total Despesas</div>
                  <div className="font-bold text-red-900">{formatCurrency(totalDesp)}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                  <div className="text-xs text-green-700 font-semibold mb-1">Líquido</div>
                  <div className="font-bold text-green-900">{formatCurrency(totalValor - totalDesp)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
