import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

type CgruposRec = DbfRecord & {
  numero: string; codigo: string; grupo: string; nome: string
  canclto_: Date | null; motreint: string; reintem_: Date | null
  motivo: string; cancpor: string; reintnum: string
  reintpor: string; codreint: string; situacao: string
}

const COLUMNS: Column[] = [
  { key: 'numero', label: 'Número', width: '80px' },
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'grupo', label: 'Grupo', width: '60px', align: 'center' },
  { key: 'nome', label: 'Nome', width: '200px' },
  { key: 'canclto_', label: 'Dt. Cancelamento', width: '130px', render: (v) => formatDate(v as Date) },
  { key: 'motreint', label: 'Motivo Reint.', width: '150px' },
  { key: 'reintem_', label: 'Dt. Reintegração', width: '130px', render: (v) => formatDate(v as Date) },
]

export function Reintegracao() {
  const { getTable } = useAppStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CgruposRec | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const table = getTable('cgrupos')

  const records = useMemo(() => {
    return searchRecords(table, search, ['numero', 'codigo', 'grupo', 'nome', 'motreint']) as CgruposRec[]
  }, [table, search])

  function handleRowClick(record: DbfRecord) {
    setSelected(record as CgruposRec)
    setDetailOpen(true)
  }

  function situacaoLabel(sit: string) {
    const map: Record<string, string> = {
      '1': 'Ativo', '2': 'Cancelado', '3': 'Suspenso', '4': 'Inadimplente',
      'R': 'Reintegrado', '0': 'Inativo',
    }
    return map[sit?.trim()] ?? sit ?? '-'
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Reintegração de Contratos"
        subtitle="CGRUPOS.DBF — Visualização de reintegrações"
        actions={
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por número, código, nome..." />
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s) — Somente leitura</div>

      <DataTable
        columns={COLUMNS}
        data={records as DbfRecord[]}
        onRowClick={handleRowClick}
        selectedRow={selected as DbfRecord | null}
        pageSize={50}
      />

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detalhes de Reintegração"
        size="xl"
        footer={
          <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
        }
      >
        {selected && (
          <div className="space-y-4">
            <FormSection title="Identificação do Contrato">
              <FormRow cols={3}>
                <FormInput label="Número" value={String(selected.numero ?? '')} readOnly />
                <FormInput label="Código" value={String(selected.codigo ?? '')} readOnly />
                <FormInput label="Grupo" value={String(selected.grupo ?? '')} readOnly />
              </FormRow>
              <FormInput label="Nome" value={String(selected.nome ?? '')} readOnly />
            </FormSection>

            <FormSection title="Dados do Cancelamento">
              <FormRow cols={2}>
                <FormInput label="Motivo Cancelamento" value={String(selected.motivo ?? '')} readOnly />
                <FormInput label="Cancelado Por" value={String(selected.cancpor ?? '')} readOnly />
              </FormRow>
              <FormInput
                label="Data Cancelamento"
                value={formatDate(selected.canclto_)}
                readOnly
              />
            </FormSection>

            <FormSection title="Dados da Reintegração">
              <FormRow cols={2}>
                <FormInput label="Nº Reintegração" value={String(selected.reintnum ?? '')} readOnly />
                <FormInput label="Cód. Reintegração" value={String(selected.codreint ?? '')} readOnly />
              </FormRow>
              <FormRow cols={2}>
                <FormInput label="Motivo Reintegração" value={String(selected.motreint ?? '')} readOnly />
                <FormInput label="Reintegrado Por" value={String(selected.reintpor ?? '')} readOnly />
              </FormRow>
              <FormInput
                label="Data Reintegração"
                value={formatDate(selected.reintem_)}
                readOnly
              />
            </FormSection>

            <FormSection title="Situação">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Situação Atual:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selected.situacao?.trim() === 'R' ? 'bg-green-100 text-green-800' :
                  selected.situacao?.trim() === '2' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {situacaoLabel(String(selected.situacao ?? ''))}
                </span>
              </div>
            </FormSection>
          </div>
        )}
      </Modal>
    </div>
  )
}
