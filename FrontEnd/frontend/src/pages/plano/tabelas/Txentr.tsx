import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency, formatMesRef } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type TxentrRec = DbfRecord & {
  seq: number; codigo: string; tipo: string; circ: string; valor: number
  cob: string; mesref: string; pgto_: Date | null; valorpg: number
  forma: string; baixa_: Date | null; por: string
}

function emptyRec(): TxentrRec {
  return {
    seq: 0, codigo: '', tipo: '', circ: '', valor: 0,
    cob: '', mesref: '', pgto_: null, valorpg: 0, forma: '', baixa_: null, por: '',
  }
}

const FORMA_OPTS = [
  { value: '', label: '-- Forma --' },
  { value: 'D', label: 'D - Dinheiro' },
  { value: 'C', label: 'C - Cheque' },
  { value: 'B', label: 'B - Boleto' },
  { value: 'T', label: 'T - Transferência' },
]

const COLUMNS: Column[] = [
  { key: 'seq', label: 'Seq.', width: '70px', align: 'right' },
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  { key: 'valor', label: 'Valor', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'cob', label: 'Cobrador', width: '80px', align: 'center' },
  { key: 'mesref', label: 'Mês Ref.', width: '80px', render: (v) => formatMesRef(String(v ?? '')) },
  { key: 'pgto_', label: 'Dt. Pagto.', width: '100px', render: (v) => formatDate(v as Date) },
]

export function Txentr() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TxentrRec | null>(null)
  const [form, setForm] = useState<TxentrRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<TxentrRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('txentr')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'tipo', 'circ', 'cob', 'mesref']) as TxentrRec[]
  }, [table, search])

  function handleNew() {
    const allRecs = records
    const maxSeq = allRecs.reduce((acc, r) => (Number(r.seq) > acc ? Number(r.seq) : acc), 0)
    const rec = emptyRec()
    rec.seq = maxSeq + 1
    rec.por = usuario
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as TxentrRec)
    setForm({ ...(record as TxentrRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('txentr', newTable)
    await writeDbfFile(dirHandle, 'TXENTR.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('txentr')
      const newRec: TxentrRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('txentr', newTable)
      await writeDbfFile(dirHandle, 'TXENTR.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof TxentrRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Taxas de Entrada"
        subtitle="TXENTR.DBF — Registro de taxas e entradas de cobrança"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, tipo, circular..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Taxa de Entrada' : 'Nova Taxa de Entrada'}
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
            <FormInput label="Seq." type="number" value={String(form.seq)} onChange={(e) => set('seq', parseInt(e.target.value) || 0)} required />
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
            <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="Cobrador" value={form.cob} onChange={(e) => set('cob', e.target.value)} maxLength={3} />
            <FormInput label="Mês Ref. (MMAA)" value={form.mesref} onChange={(e) => set('mesref', e.target.value)} maxLength={4} placeholder="MMAA" />
          </FormRow>
        </FormSection>
        <FormSection title="Valores">
          <FormRow cols={2}>
            <FormInput label="Valor" type="number" step="0.01" value={String(form.valor)} onChange={(e) => set('valor', parseFloat(e.target.value) || 0)} />
            <FormInput label="Valor Pago" type="number" step="0.01" value={String(form.valorpg)} onChange={(e) => set('valorpg', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Dt. Pagamento"
              type="date"
              value={form.pgto_ ? form.pgto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('pgto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormSelect label="Forma" value={form.forma} onChange={(e) => set('forma', e.target.value)} options={FORMA_OPTS} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Dt. Baixa"
              type="date"
              value={form.baixa_ ? form.baixa_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('baixa_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
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
        message={`Deseja excluir a taxa seq. ${confirmDelete?.seq}?`}
      />
    </div>
  )
}
