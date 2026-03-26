import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormTextarea, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate } from '../../../utils/formatters'
import { searchRecords, nextCode } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type MensagemRec = DbfRecord & {
  seq: string; filtro: string; mens1: string; lancto_: Date | null; por: string
}

function emptyRec(): MensagemRec {
  return { seq: '', filtro: '', mens1: '', lancto_: null, por: '' }
}

const COLUMNS: Column[] = [
  { key: 'seq', label: 'Seq.', width: '80px' },
  {
    key: 'filtro', label: 'Filtro', width: '280px',
    render: (v) => {
      const s = String(v ?? '')
      return s.length > 50 ? s.substring(0, 50) + '...' : s
    },
  },
  { key: 'lancto_', label: 'Lançamento', width: '110px', render: (v) => formatDate(v as Date) },
  { key: 'por', label: 'Por', width: '90px' },
]

export function Mensagens() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MensagemRec | null>(null)
  const [form, setForm] = useState<MensagemRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<MensagemRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('mensag')

  const records = useMemo(() => {
    return searchRecords(table, search, ['seq', 'filtro', 'por']) as MensagemRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.seq = nextCode(table, 'seq', 6)
    rec.lancto_ = new Date()
    rec.por = usuario
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as MensagemRec)
    setForm({ ...(record as MensagemRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('mensag', newTable)
    await writeDbfFile(dirHandle, 'MENSAG.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('mensag')
      const newRec: MensagemRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('mensag', newTable)
      await writeDbfFile(dirHandle, 'MENSAG.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof MensagemRec, value: string | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Mensagens"
        subtitle="MENSAG.DBF — Mensagens personalizadas para impressão"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por seq., filtro, por..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} mensagem(ns)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Mensagem' : 'Nova Mensagem'}
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Identificação">
          <FormRow cols={3}>
            <FormInput label="Seq." value={form.seq} onChange={(e) => set('seq', e.target.value)} maxLength={9} required />
            <FormInput
              label="Lançamento"
              type="date"
              value={form.lancto_ ? form.lancto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('lancto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
          </FormRow>
        </FormSection>
        <FormSection title="Conteúdo">
          <FormTextarea
            label="Filtro (210 car.)"
            value={form.filtro}
            onChange={(e) => set('filtro', e.target.value)}
            rows={4}
          />
          <FormTextarea
            label="Mensagem"
            value={form.mens1}
            onChange={(e) => set('mens1', e.target.value)}
            rows={6}
            placeholder="Texto da mensagem..."
          />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a mensagem seq. ${confirmDelete?.seq}?`}
      />
    </div>
  )
}
