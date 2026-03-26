import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { searchRecords, nextCode } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type BxFccRec = DbfRecord & {
  idfilial: string; numero: string; lancto_: Date | null; por: string
  cobrador: string; nomecobr: string; despesas: number; vltaxas: number; vlrbaix: number
}

function emptyRec(): BxFccRec {
  return {
    idfilial: '', numero: '', lancto_: null, por: '',
    cobrador: '', nomecobr: '', despesas: 0, vltaxas: 0, vlrbaix: 0,
  }
}

const COLUMNS: Column[] = [
  { key: 'idfilial', label: 'Filial', width: '70px', align: 'center' },
  { key: 'numero', label: 'Número', width: '90px' },
  { key: 'lancto_', label: 'Lançamento', width: '110px', render: (v) => formatDate(v as Date) },
  { key: 'cobrador', label: 'Cobrador', width: '80px', align: 'center' },
  { key: 'nomecobr', label: 'Nome Cobrador', width: '180px' },
  { key: 'vltaxas', label: 'Vl. Taxas', width: '120px', align: 'right', render: (v) => formatCurrency(Number(v)) },
]

export function BxFcc() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BxFccRec | null>(null)
  const [form, setForm] = useState<BxFccRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<BxFccRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('bxfcc')

  const records = useMemo(() => {
    return searchRecords(table, search, ['idfilial', 'numero', 'cobrador', 'nomecobr']) as BxFccRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.numero = nextCode(table, 'numero', 6)
    rec.lancto_ = new Date()
    rec.por = usuario
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as BxFccRec)
    setForm({ ...(record as BxFccRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('bxfcc', newTable)
    await writeDbfFile(dirHandle, 'BXFCC.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('bxfcc')
      const newRec: BxFccRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('bxfcc', newTable)
      await writeDbfFile(dirHandle, 'BXFCC.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof BxFccRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Baixa FCC"
        subtitle="BXFCC.DBF — Registro de fechamentos de cobrador"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por filial, número, cobrador..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Baixa FCC' : 'Nova Baixa FCC'}
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
            <FormInput label="Filial" value={form.idfilial} onChange={(e) => set('idfilial', e.target.value)} maxLength={2} required />
            <FormInput label="Número" value={form.numero} onChange={(e) => set('numero', e.target.value)} maxLength={9} />
            <FormInput
              label="Lançamento"
              type="date"
              value={form.lancto_ ? form.lancto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('lancto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="Cobrador" value={form.cobrador} onChange={(e) => set('cobrador', e.target.value)} maxLength={3} required />
            <FormInput label="Nome Cobrador" value={form.nomecobr} onChange={(e) => set('nomecobr', e.target.value)} maxLength={30} />
          </FormRow>
          <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
        </FormSection>
        <FormSection title="Valores">
          <FormRow cols={3}>
            <FormInput label="Despesas" type="number" step="0.01" value={String(form.despesas)} onChange={(e) => set('despesas', parseFloat(e.target.value) || 0)} />
            <FormInput label="Vl. Taxas" type="number" step="0.01" value={String(form.vltaxas)} onChange={(e) => set('vltaxas', parseFloat(e.target.value) || 0)} />
            <FormInput label="Vl. Baixado" type="number" step="0.01" value={String(form.vlrbaix)} onChange={(e) => set('vlrbaix', parseFloat(e.target.value) || 0)} />
          </FormRow>
          {(form.vltaxas > 0 || form.despesas > 0) && (
            <div className="text-sm bg-blue-50 border border-blue-200 rounded p-2">
              Líquido: {formatCurrency(form.vltaxas - form.despesas)}
            </div>
          )}
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a baixa FCC número ${confirmDelete?.numero}?`}
      />
    </div>
  )
}
