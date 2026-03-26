import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type FilialRec = DbfRecord & {
  codigo: string; abrev: string; nome: string
  endereco: string; cidade: string; contato: string
}

function emptyRec(): FilialRec {
  return { codigo: '', abrev: '', nome: '', endereco: '', cidade: '', contato: '' }
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '70px', align: 'center' },
  { key: 'abrev', label: 'Abreviação', width: '150px' },
  { key: 'nome', label: 'Nome', width: '280px' },
  { key: 'cidade', label: 'Cidade', width: '180px' },
]

export function Filiais() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FilialRec | null>(null)
  const [form, setForm] = useState<FilialRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<FilialRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('tfiliais')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'abrev', 'nome', 'cidade']) as FilialRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as FilialRec)
    setForm({ ...(record as FilialRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('tfiliais', newTable)
    await writeDbfFile(dirHandle, 'TFILIAIS.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('tfiliais')
      const newRec: FilialRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        const exists = (currentTable?.records ?? []).some(
          (r) => String(r['codigo'] ?? '').trim() === form.codigo.trim()
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
      setTable('tfiliais', newTable)
      await writeDbfFile(dirHandle, 'TFILIAIS.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof FilialRec, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Filiais"
        subtitle="TFILIAIS.DBF — Cadastro de filiais e unidades"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, nome, cidade..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} filial(is)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Filial' : 'Nova Filial'}
        size="md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Dados da Filial">
          <FormRow cols={2}>
            <FormInput label="Código (2 car.)" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={2} required />
            <FormInput label="Abreviação" value={form.abrev} onChange={(e) => set('abrev', e.target.value)} maxLength={25} />
          </FormRow>
          <FormInput label="Nome Completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} maxLength={50} required />
          <FormInput label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} maxLength={50} />
          <FormRow cols={2}>
            <FormInput label="Cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} maxLength={50} />
            <FormInput label="Contato" value={form.contato} onChange={(e) => set('contato', e.target.value)} maxLength={20} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a filial "${confirmDelete?.nome}"?`}
      />
    </div>
  )
}
