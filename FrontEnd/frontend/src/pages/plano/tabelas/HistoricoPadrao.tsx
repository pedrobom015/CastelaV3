import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormSection, FormRow } from '../../../components/common/FormField'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type HistRec = DbfRecord & {
  historico: string; descricao: string; tipo: string; origem: string
  recdesp: string; codigo: string; intlan: string; codlan: string
}

function emptyRec(): HistRec {
  return {
    historico: '', descricao: '', tipo: '', origem: '',
    recdesp: '', codigo: '', intlan: '', codlan: '',
  }
}

const TIPO_OPTS = [
  { value: '', label: '-- Tipo --' },
  { value: 'T', label: 'T - Taxa' },
  { value: 'M', label: 'M - Mensalidade' },
  { value: 'E', label: 'E - Estorno' },
  { value: 'A', label: 'A - Ajuste' },
  { value: 'O', label: 'O - Outros' },
]

const RECDESP_OPTS = [
  { value: '', label: '-- --' },
  { value: 'R', label: 'R - Receita' },
  { value: 'D', label: 'D - Despesa' },
]

const COLUMNS: Column[] = [
  { key: 'historico', label: 'Código', width: '70px', align: 'center' },
  { key: 'descricao', label: 'Descrição', width: '250px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'origem', label: 'Origem', width: '70px', align: 'center' },
  { key: 'recdesp', label: 'R/D', width: '60px', align: 'center' },
]

export function HistoricoPadrao() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HistRec | null>(null)
  const [form, setForm] = useState<HistRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<HistRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('historic')

  const records = useMemo(() => {
    return searchRecords(table, search, ['historico', 'descricao', 'tipo', 'origem']) as HistRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as HistRec)
    setForm({ ...(record as HistRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('historic', newTable)
    await writeDbfFile(dirHandle, 'HISTORIC.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('historic')
      const newRec: HistRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('historic', newTable)
      await writeDbfFile(dirHandle, 'HISTORIC.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof HistRec, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Histórico Padrão"
        subtitle="HISTORIC.DBF — Tabela de históricos contábeis"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, descrição, tipo..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} histórico(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Histórico' : 'Novo Histórico'}
        size="md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Identificação">
          <FormRow cols={2}>
            <FormInput label="Código (3 car.)" value={form.historico} onChange={(e) => set('historico', e.target.value)} maxLength={3} required />
            <FormInput label="Origem" value={form.origem} onChange={(e) => set('origem', e.target.value)} maxLength={3} />
          </FormRow>
          <FormInput label="Descrição" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} maxLength={40} required />
        </FormSection>
        <FormSection title="Classificação">
          <FormRow cols={2}>
            <FormSelect label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} options={TIPO_OPTS} />
            <FormSelect label="Rec./Desp." value={form.recdesp} onChange={(e) => set('recdesp', e.target.value)} options={RECDESP_OPTS} />
          </FormRow>
        </FormSection>
        <FormSection title="Integração">
          <FormRow cols={2}>
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} />
            <FormInput label="Int. Lan." value={form.intlan} onChange={(e) => set('intlan', e.target.value)} maxLength={8} />
          </FormRow>
          <FormInput label="Cód. Lan." value={form.codlan} onChange={(e) => set('codlan', e.target.value)} maxLength={20} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o histórico "${confirmDelete?.descricao}"?`}
      />
    </div>
  )
}
