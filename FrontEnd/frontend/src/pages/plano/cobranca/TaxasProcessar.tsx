import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type TxprocRec = DbfRecord & {
  codigo: string; tipo: string; circ: string; emissao_: Date | null
  valor: number; pgto_: Date | null; valorpg: number; cobrador: string
  forma: string; baixa_: Date | null; por: string; stat: string
  filial: string; atp: string; atc: string; atr: string
}

function emptyRec(): TxprocRec {
  return {
    codigo: '', tipo: '', circ: '', emissao_: null, valor: 0,
    pgto_: null, valorpg: 0, cobrador: '', forma: '', baixa_: null,
    por: '', stat: '', filial: '', atp: '', atc: '', atr: '',
  }
}

const STAT_OPTS = [
  { value: '', label: '-- Situação --' },
  { value: '1', label: '1 - Pago' },
  { value: '2', label: '2 - Pendente' },
  { value: '3', label: '3 - Vencido' },
  { value: '0', label: '0 - Cancelado' },
]

const FORMA_OPTS = [
  { value: '', label: '-- Forma --' },
  { value: 'D', label: 'D - Dinheiro' },
  { value: 'C', label: 'C - Cheque' },
  { value: 'B', label: 'B - Boleto' },
  { value: 'T', label: 'T - Transferência' },
]

const STAT_COLORS: Record<string, string> = {
  '1': 'bg-green-100 text-green-800',
  '2': 'bg-yellow-100 text-yellow-800',
  '3': 'bg-red-100 text-red-800',
  '0': 'bg-gray-100 text-gray-700',
}

const STAT_LABELS: Record<string, string> = {
  '1': 'Pago', '2': 'Pendente', '3': 'Vencido', '0': 'Cancelado',
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  { key: 'emissao_', label: 'Emissão', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'valor', label: 'Valor', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'pgto_', label: 'Dt. Pagto.', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'valorpg', label: 'Vl. Pago', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  {
    key: 'stat', label: 'Sit.', width: '100px',
    render: (v) => {
      const s = String(v ?? '').trim()
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAT_COLORS[s] ?? 'bg-gray-100 text-gray-700'}`}>{STAT_LABELS[s] ?? s}</span>
    },
  },
]

export function TaxasProcessar() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TxprocRec | null>(null)
  const [form, setForm] = useState<TxprocRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<TxprocRec | null>(null)
  const [saving, setSaving] = useState(false)

  const table = getTable('txproc')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'tipo', 'circ', 'cobrador', 'stat']) as TxprocRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.emissao_ = new Date()
    rec.por = usuario
    rec.stat = '2'
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as TxprocRec)
    setForm({ ...(record as TxprocRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('txproc', newTable)
    await writeDbfFile(dirHandle, 'TXPROC.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('txproc')
      const newRec: TxprocRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('txproc', newTable)
      await writeDbfFile(dirHandle, 'TXPROC.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof TxprocRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Taxas a Processar"
        subtitle="TXPROC.DBF — Controle de taxas em processamento"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, tipo, circular..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Taxa a Processar' : 'Nova Taxa a Processar'}
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
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
            <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Cobrador" value={form.cobrador} onChange={(e) => set('cobrador', e.target.value)} maxLength={3} />
            <FormInput label="Filial" value={form.filial} onChange={(e) => set('filial', e.target.value)} maxLength={2} />
            <FormSelect label="Situação" value={form.stat} onChange={(e) => set('stat', e.target.value)} options={STAT_OPTS} />
          </FormRow>
        </FormSection>
        <FormSection title="Valores e Datas">
          <FormRow cols={2}>
            <FormInput
              label="Emissão"
              type="date"
              value={form.emissao_ ? form.emissao_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('emissao_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Valor" type="number" step="0.01" value={String(form.valor)} onChange={(e) => set('valor', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Dt. Pagamento"
              type="date"
              value={form.pgto_ ? form.pgto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('pgto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Valor Pago" type="number" step="0.01" value={String(form.valorpg)} onChange={(e) => set('valorpg', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Dt. Baixa"
              type="date"
              value={form.baixa_ ? form.baixa_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('baixa_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormSelect label="Forma" value={form.forma} onChange={(e) => set('forma', e.target.value)} options={FORMA_OPTS} />
          </FormRow>
        </FormSection>
        <FormSection title="Controle">
          <FormRow cols={4}>
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
            <FormInput label="ATP" value={form.atp} onChange={(e) => set('atp', e.target.value)} maxLength={1} />
            <FormInput label="ATC" value={form.atc} onChange={(e) => set('atc', e.target.value)} maxLength={1} />
            <FormInput label="ATR" value={form.atr} onChange={(e) => set('atr', e.target.value)} maxLength={1} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a taxa do código ${confirmDelete?.codigo}?`}
      />
    </div>
  )
}
