import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type JurosRec = DbfRecord & {
  tipo: string; multa: number; mltcaren: number; juros: number; jrscaren: number
}

function emptyRec(): JurosRec {
  return { tipo: '', multa: 0, mltcaren: 0, juros: 0, jrscaren: 0 }
}

const COLUMNS: Column[] = [
  { key: 'tipo', label: 'Tipo', width: '70px', align: 'center' },
  { key: 'multa', label: 'Multa (%)', width: '100px', align: 'right', render: (v) => `${Number(v).toFixed(2)}%` },
  { key: 'mltcaren', label: 'Carência Multa (d)', width: '150px', align: 'right' },
  { key: 'juros', label: 'Juros (%)', width: '100px', align: 'right', render: (v) => `${Number(v).toFixed(3)}%` },
  { key: 'jrscaren', label: 'Carência Juros (d)', width: '150px', align: 'right' },
]

export function ParametroJuros() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<JurosRec | null>(null)
  const [form, setForm] = useState<JurosRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<JurosRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('juros')

  const records = useMemo(() => {
    return searchRecords(table, search, ['tipo']) as JurosRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as JurosRec)
    setForm({ ...(record as JurosRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('juros', newTable)
    await writeDbfFile(dirHandle, 'JUROS.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('juros')
      const newRec: JurosRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('juros', newTable)
      await writeDbfFile(dirHandle, 'JUROS.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof JurosRec, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 max-w-3xl">
      <PageHeader
        title="Parâmetros de Juros"
        subtitle="JUROS.DBF — Configuração de multas e juros por tipo"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por tipo..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} tipo(s) configurado(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <strong>Informações:</strong> Multa e Juros são percentuais. Carências são em dias corridos após o vencimento.
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Parâmetro de Juros' : 'Novo Parâmetro de Juros'}
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Tipo">
          <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} required placeholder="Ex: M, C, B..." />
        </FormSection>
        <FormSection title="Multa">
          <FormRow cols={2}>
            <FormInput label="Multa (%)" type="number" step="0.01" value={String(form.multa)} onChange={(e) => set('multa', parseFloat(e.target.value) || 0)} />
            <FormInput label="Carência (dias)" type="number" value={String(form.mltcaren)} onChange={(e) => set('mltcaren', parseInt(e.target.value) || 0)} />
          </FormRow>
        </FormSection>
        <FormSection title="Juros">
          <FormRow cols={2}>
            <FormInput label="Juros (% a.m.)" type="number" step="0.001" value={String(form.juros)} onChange={(e) => set('juros', parseFloat(e.target.value) || 0)} />
            <FormInput label="Carência (dias)" type="number" value={String(form.jrscaren)} onChange={(e) => set('jrscaren', parseInt(e.target.value) || 0)} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o parâmetro de juros tipo "${confirmDelete?.tipo}"?`}
      />
    </div>
  )
}
