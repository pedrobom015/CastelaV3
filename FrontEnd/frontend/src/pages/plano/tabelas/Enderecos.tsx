import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type EnderRec = DbfRecord & {
  codigo: string; endereco: string; bairro: string
  cidade: string; cep: string; cobrador: string; data_: Date | null; por: string
}

function emptyRec(): EnderRec {
  return { codigo: '', endereco: '', bairro: '', cidade: '', cep: '', cobrador: '', data_: null, por: '' }
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'endereco', label: 'Endereço', width: '220px' },
  { key: 'bairro', label: 'Bairro', width: '150px' },
  { key: 'cidade', label: 'Cidade', width: '150px' },
  { key: 'cobrador', label: 'Cobrador', width: '80px', align: 'center' },
]

export function Enderecos() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EnderRec | null>(null)
  const [form, setForm] = useState<EnderRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<EnderRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('alender')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'endereco', 'bairro', 'cidade', 'cobrador']) as EnderRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.data_ = new Date()
    rec.por = usuario
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as EnderRec)
    setForm({ ...(record as EnderRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('alender', newTable)
    await writeDbfFile(dirHandle, 'ALENDER.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('alender')
      const newRec: EnderRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('alender', newTable)
      await writeDbfFile(dirHandle, 'ALENDER.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof EnderRec, value: string | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Alterações de Endereço"
        subtitle="ALENDER.DBF — Registro histórico de endereços alterados"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, endereço, cidade..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Endereço' : 'Novo Endereço'}
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Dados do Endereço">
          <FormInput label="Código do Contrato" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
          <FormInput label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} maxLength={35} required />
          <FormRow cols={2}>
            <FormInput label="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} maxLength={25} />
            <FormInput label="Cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} maxLength={25} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="CEP" value={form.cep} onChange={(e) => set('cep', e.target.value)} maxLength={8} placeholder="00000000" />
            <FormInput label="Cobrador" value={form.cobrador} onChange={(e) => set('cobrador', e.target.value)} maxLength={3} />
          </FormRow>
        </FormSection>
        <FormSection title="Controle">
          <FormRow cols={2}>
            <FormInput
              label="Data Alteração"
              type="date"
              value={form.data_ ? form.data_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('data_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o registro de endereço do contrato ${confirmDelete?.codigo}?`}
      />
    </div>
  )
}
