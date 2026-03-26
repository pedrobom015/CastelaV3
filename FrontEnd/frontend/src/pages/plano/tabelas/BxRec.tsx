import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type BxRecRec = DbfRecord & {
  ano: string; numero: string; codigo: string; tipo: string; circ: string
  valorpg: number; valoraux: number; emitido_: Date | null; por: string
  numop: string; grupo: string; filial: string
}

function emptyRec(): BxRecRec {
  return {
    ano: '', numero: '', codigo: '', tipo: '', circ: '',
    valorpg: 0, valoraux: 0, emitido_: null, por: '',
    numop: '', grupo: '', filial: '',
  }
}

const COLUMNS: Column[] = [
  { key: 'ano', label: 'Ano', width: '60px', align: 'center' },
  { key: 'numero', label: 'Número', width: '90px' },
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  { key: 'valorpg', label: 'Valor Pago', width: '120px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'emitido_', label: 'Emitido em', width: '110px', render: (v) => formatDate(v as Date) },
]

export function BxRec() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BxRecRec | null>(null)
  const [form, setForm] = useState<BxRecRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<BxRecRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('bxrec')

  const records = useMemo(() => {
    return searchRecords(table, search, ['ano', 'numero', 'codigo', 'tipo', 'circ', 'grupo']) as BxRecRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.emitido_ = new Date()
    rec.por = usuario
    const now = new Date()
    rec.ano = String(now.getFullYear()).substring(2)
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as BxRecRec)
    setForm({ ...(record as BxRecRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('bxrec', newTable)
    await writeDbfFile(dirHandle, 'BXREC.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('bxrec')
      const newRec: BxRecRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('bxrec', newTable)
      await writeDbfFile(dirHandle, 'BXREC.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof BxRecRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Baixa de Recebimentos"
        subtitle="BXREC.DBF — Registro de baixas de recebimentos"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por número, código, tipo, circular..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Baixa de Recebimento' : 'Nova Baixa de Recebimento'}
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
          <FormRow cols={4}>
            <FormInput label="Ano" value={form.ano} onChange={(e) => set('ano', e.target.value)} maxLength={2} required />
            <FormInput label="Número" value={form.numero} onChange={(e) => set('numero', e.target.value)} maxLength={9} />
            <FormInput label="Grupo" value={form.grupo} onChange={(e) => set('grupo', e.target.value)} maxLength={2} />
            <FormInput label="Filial" value={form.filial} onChange={(e) => set('filial', e.target.value)} maxLength={2} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
            <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
          </FormRow>
        </FormSection>
        <FormSection title="Valores e Controle">
          <FormRow cols={2}>
            <FormInput label="Valor Pago" type="number" step="0.01" value={String(form.valorpg)} onChange={(e) => set('valorpg', parseFloat(e.target.value) || 0)} />
            <FormInput label="Valor Aux." type="number" step="0.01" value={String(form.valoraux)} onChange={(e) => set('valoraux', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput
              label="Emitido Em"
              type="date"
              value={form.emitido_ ? form.emitido_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('emitido_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
            <FormInput label="Num. Op." value={form.numop} onChange={(e) => set('numop', e.target.value)} maxLength={9} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a baixa número ${confirmDelete?.numero}?`}
      />
    </div>
  )
}
