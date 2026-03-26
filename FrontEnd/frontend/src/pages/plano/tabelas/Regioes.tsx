import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type RegiaoRec = DbfRecord & {
  codigo: string; regiao: string; cobrador: string
}

function emptyRec(): RegiaoRec {
  return { codigo: '', regiao: '', cobrador: '' }
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '80px', align: 'center' },
  { key: 'regiao', label: 'Região', width: '250px' },
  { key: 'cobrador', label: 'Cobrador', width: '90px', align: 'center' },
]

export function Regioes() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RegiaoRec | null>(null)
  const [form, setForm] = useState<RegiaoRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<RegiaoRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('regiao')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'regiao', 'cobrador']) as RegiaoRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as RegiaoRec)
    setForm({ ...(record as RegiaoRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('regiao', newTable)
    await writeDbfFile(dirHandle, 'REGIAO.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('regiao')
      const newRec: RegiaoRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        // Verifica duplicidade
        const exists = (currentTable?.records ?? []).some(
          (r) => String(r['codigo'] ?? '').trim().toUpperCase() === form.codigo.trim().toUpperCase()
        )
        if (exists) {
          alert(`Código "${form.codigo}" já existe.`)
          setSaving(false)
          return
        }
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('regiao', newTable)
      await writeDbfFile(dirHandle, 'REGIAO.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof RegiaoRec, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Regiões"
        subtitle="REGIAO.DBF — Regiões de cobrança"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, região, cobrador..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} região(ões)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Região' : 'Nova Região'}
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Dados da Região">
          <FormRow cols={2}>
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={3} required />
            <FormInput label="Cobrador" value={form.cobrador} onChange={(e) => set('cobrador', e.target.value)} maxLength={3} />
          </FormRow>
          <FormInput label="Descrição da Região" value={form.regiao} onChange={(e) => set('regiao', e.target.value)} maxLength={30} required />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a região "${confirmDelete?.regiao}"?`}
      />
    </div>
  )
}
