import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCpf } from '../../../utils/formatters'
import type { DbfRecord } from '../../../types/models'

type CanceladoRec = DbfRecord & {
  codigo: string; grupo: string; nome: string; situacao: string
  admissao: Date | null; cobrador: string; cpf: string
  // campos vindos do join com cancels
  cmotivo: string; lancto_: Date | null; cancpor: string
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'grupo', label: 'Grupo', width: '60px', align: 'center' },
  { key: 'nome', label: 'Nome', width: '220px' },
  { key: 'cmotivo', label: 'Motivo', width: '180px' },
  { key: 'lancto_', label: 'Dt. Cancelamento', width: '130px', render: (v) => formatDate(v as Date | null) },
  { key: 'cancpor', label: 'Por', width: '90px' },
  { key: 'cobrador', label: 'Cobrador', width: '80px', align: 'center' },
]

export function ContratosCancelados() {
  const { getTable } = useAppStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CanceladoRec | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const gruposTable = getTable('grupos')
  const cancelsTable = getTable('cancels')

  const records = useMemo(() => {
    if (!gruposTable) return []

    // Mapa de código → último cancelamento em cancels
    const cancelMap = new Map<string, DbfRecord>()
    if (cancelsTable) {
      for (const c of cancelsTable.records) {
        const key = String(c.ccodigo ?? '').trim()
        // Mantém o mais recente por data
        const existing = cancelMap.get(key)
        if (!existing || (c.lancto_ as Date) > (existing.lancto_ as Date)) {
          cancelMap.set(key, c)
        }
      }
    }

    // Filtra grupos cancelados (situacao === '2') e enriquece com dados de cancels
    const cancelados = gruposTable.records
      .filter(r => String(r.situacao ?? '').trim() === '2')
      .map(r => {
        const codigo = String(r.codigo ?? '').trim()
        const cancel = cancelMap.get(codigo)
        return {
          ...r,
          cmotivo: cancel ? String(cancel.cmotivo ?? '') : '',
          lancto_: cancel ? cancel.lancto_ : null,
          cancpor: cancel ? String(cancel.por ?? '') : '',
        } as CanceladoRec
      })

    if (!search.trim()) return cancelados

    const q = search.trim().toLowerCase()
    return cancelados.filter(r =>
      [r.codigo, r.grupo, r.nome, r.cmotivo, r.cancpor, r.cobrador]
        .some(v => String(v ?? '').toLowerCase().includes(q))
    )
  }, [gruposTable, cancelsTable, search])

  function handleRowClick(record: DbfRecord) {
    setSelected(record as CanceladoRec)
    setDetailOpen(true)
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Contratos Cancelados"
        subtitle="GRUPOS.DBF — situação = Cancelado (somente leitura)"
        actions={
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, nome, motivo..." />
        }
      />

      <div className="mb-2 flex items-center gap-3">
        <span className="text-sm text-gray-500">{records.length} contrato(s) cancelado(s)</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Somente Leitura
        </span>
      </div>

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
        title="Detalhes do Contrato Cancelado"
        size="lg"
        footer={
          <Btn variant="secondary" onClick={() => setDetailOpen(false)}>Fechar</Btn>
        }
      >
        {selected && (
          <div className="space-y-4">
            <FormSection title="Dados do Contrato">
              <FormRow cols={3}>
                <FormInput label="Código" value={String(selected.codigo ?? '')} readOnly />
                <FormInput label="Grupo" value={String(selected.grupo ?? '')} readOnly />
                <FormInput label="Cobrador" value={String(selected.cobrador ?? '')} readOnly />
              </FormRow>
              <FormRow cols={2}>
                <FormInput label="Nome do Titular" value={String(selected.nome ?? '')} readOnly />
                <FormInput label="CPF" value={formatCpf(String(selected.cpf ?? ''))} readOnly />
              </FormRow>
              <FormInput label="Admissão" value={formatDate(selected.admissao as Date | null)} readOnly />
            </FormSection>

            <FormSection title="Cancelamento">
              <FormInput label="Motivo" value={String(selected.cmotivo ?? '')} readOnly />
              <FormRow cols={2}>
                <FormInput label="Data Cancelamento" value={formatDate(selected.lancto_ as Date | null)} readOnly />
                <FormInput label="Cancelado Por" value={String(selected.cancpor ?? '')} readOnly />
              </FormRow>
            </FormSection>
          </div>
        )}
      </Modal>
    </div>
  )
}
