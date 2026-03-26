import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency, formatMesRef } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type CircularRec = DbfRecord & {
  grupo: string; circ: string; procpend: number; emissao_: Date | null
  mesref: string; valor: number; menscirc: string; menscirc1: string
  menscirc2: string; emitidos: number; pagos: number; cancelados: number
  lancto_: Date | null; funcionar: string; impress_: Date | null
}

function emptyRec(): CircularRec {
  return {
    grupo: '', circ: '', procpend: 0, emissao_: null, mesref: '', valor: 0,
    menscirc: '', menscirc1: '', menscirc2: '', emitidos: 0, pagos: 0,
    cancelados: 0, lancto_: null, funcionar: '', impress_: null,
  }
}

const COLUMNS: Column[] = [
  { key: 'grupo', label: 'Grupo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  { key: 'mesref', label: 'Mês Ref.', width: '80px', render: (v) => formatMesRef(String(v ?? '')) },
  { key: 'valor', label: 'Valor', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'emitidos', label: 'Emitidos', width: '80px', align: 'right' },
  { key: 'pagos', label: 'Pagos', width: '70px', align: 'right' },
  { key: 'cancelados', label: 'Cancelados', width: '90px', align: 'right' },
]

export function Circulares() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CircularRec | null>(null)
  const [form, setForm] = useState<CircularRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<CircularRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('circular')

  const records = useMemo(() => {
    return searchRecords(table, search, ['grupo', 'circ', 'mesref', 'funcionar']) as CircularRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.emissao_ = new Date()
    rec.lancto_ = new Date()
    rec.funcionar = usuario
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as CircularRec)
    setForm({ ...(record as CircularRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('circular', newTable)
    await writeDbfFile(dirHandle, 'CIRCULAR.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('circular')
      const newRec: CircularRec = { ...form, funcionar: usuario || form.funcionar }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('circular', newTable)
      await writeDbfFile(dirHandle, 'CIRCULAR.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof CircularRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Circulares"
        subtitle="CIRCULAR.DBF — Controle de circulares de cobrança"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por grupo, circular, mês ref..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} circular(es)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Circular' : 'Nova Circular'}
        size="xl"
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
            <FormInput label="Grupo" value={form.grupo} onChange={(e) => set('grupo', e.target.value)} maxLength={2} required />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} required />
            <FormInput label="Mês Ref. (MMAA)" value={form.mesref} onChange={(e) => set('mesref', e.target.value)} maxLength={4} placeholder="MMAA" />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="Valor" type="number" step="0.01" value={String(form.valor)} onChange={(e) => set('valor', parseFloat(e.target.value) || 0)} />
            <FormInput label="Proc. Pendentes" type="number" value={String(form.procpend)} onChange={(e) => set('procpend', parseInt(e.target.value) || 0)} />
          </FormRow>
        </FormSection>
        <FormSection title="Mensagens">
          <FormInput label="Mensagem Principal (60 car.)" value={form.menscirc} onChange={(e) => set('menscirc', e.target.value)} maxLength={60} />
          <FormInput label="Mensagem 1 (35 car.)" value={form.menscirc1} onChange={(e) => set('menscirc1', e.target.value)} maxLength={35} />
          <FormInput label="Mensagem 2 (35 car.)" value={form.menscirc2} onChange={(e) => set('menscirc2', e.target.value)} maxLength={35} />
        </FormSection>
        <FormSection title="Controle">
          <FormRow cols={3}>
            <FormInput label="Emitidos" type="number" value={String(form.emitidos)} onChange={(e) => set('emitidos', parseInt(e.target.value) || 0)} />
            <FormInput label="Pagos" type="number" value={String(form.pagos)} onChange={(e) => set('pagos', parseInt(e.target.value) || 0)} />
            <FormInput label="Cancelados" type="number" value={String(form.cancelados)} onChange={(e) => set('cancelados', parseInt(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Dt. Emissão"
              type="date"
              value={form.emissao_ ? new Date(form.emissao_).toISOString().split('T')[0] : ''}
              onChange={(e) => set('emissao_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput
              label="Dt. Impressão"
              type="date"
              value={form.impress_ ? new Date(form.impress_).toISOString().split('T')[0] : ''}
              onChange={(e) => set('impress_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
          <FormInput label="Funcionário" value={form.funcionar} onChange={(e) => set('funcionar', e.target.value)} maxLength={10} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a circular ${confirmDelete?.circ} do grupo ${confirmDelete?.grupo}?`}
      />
    </div>
  )
}
