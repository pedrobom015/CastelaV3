import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords, nextCode } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type EmcarneRec = DbfRecord & {
  seq: string; codigo: string; vendedor: string; tip: string; circ: string
  vencto_: Date | null; emissao_: Date | null; etiqueta_: Date | null
  filial: string; lancto_: Date | null; por: string; parok: number; intlan: string
}

function emptyRec(): EmcarneRec {
  return {
    seq: '', codigo: '', vendedor: '', tip: '', circ: '',
    vencto_: null, emissao_: null, etiqueta_: null,
    filial: '', lancto_: null, por: '', parok: 0, intlan: '',
  }
}

const COLUMNS: Column[] = [
  { key: 'seq', label: 'Seq.', width: '80px' },
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'vendedor', label: 'Vendedor', width: '80px', align: 'center' },
  { key: 'tip', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circ.', width: '60px', align: 'center' },
  { key: 'vencto_', label: 'Vencimento', width: '110px', render: (v) => formatDate(v as Date) },
  { key: 'emissao_', label: 'Emissão', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'parok', label: 'Par. OK', width: '70px', align: 'center' },
]

export function LancamentoCarne() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EmcarneRec | null>(null)
  const [form, setForm] = useState<EmcarneRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<EmcarneRec | null>(null)
  const [saving, setSaving] = useState(false)

  const table = getTable('emcarne')

  const records = useMemo(() => {
    return searchRecords(table, search, ['seq', 'codigo', 'vendedor', 'tip', 'circ']) as EmcarneRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.seq = nextCode(table, 'seq', 6)
    rec.por = usuario
    rec.lancto_ = new Date()
    rec.emissao_ = new Date()
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as EmcarneRec)
    setForm({ ...(record as EmcarneRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('emcarne', newTable)
    await writeDbfFile(dirHandle, 'EMCARNE.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('emcarne')
      const newRec: EmcarneRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('emcarne', newTable)
      await writeDbfFile(dirHandle, 'EMCARNE.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof EmcarneRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Lançamento de Carnê"
        subtitle="EMCARNE.DBF — Controle de parcelas de carnê"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por seq., código, vendedor..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable
        columns={COLUMNS}
        data={records as DbfRecord[]}
        onRowClick={handleEdit}
        pageSize={50}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Lançamento de Carnê' : 'Novo Lançamento de Carnê'}
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {editing && (
              {/* <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn> */}
            )}
          </>
        }
      >
        <FormSection title="Identificação">
          <FormRow cols={3}>
            <FormInput label="Seq." value={form.seq} onChange={(e) => set('seq', e.target.value)} maxLength={9} required />
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
            <FormInput label="Vendedor" value={form.vendedor} onChange={(e) => set('vendedor', e.target.value)} maxLength={3} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Tipo" value={form.tip} onChange={(e) => set('tip', e.target.value)} maxLength={2} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
            <FormInput label="Filial" value={form.filial} onChange={(e) => set('filial', e.target.value)} maxLength={2} />
          </FormRow>
        </FormSection>
        <FormSection title="Datas">
          <FormRow cols={2}>
            <FormInput
              label="Vencimento"
              type="date"
              value={form.vencto_ ? form.vencto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('vencto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput
              label="Emissão"
              type="date"
              value={form.emissao_ ? form.emissao_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('emissao_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
          <FormRow cols={2}>
            <FormInput
              label="Etiqueta"
              type="date"
              value={form.etiqueta_ ? form.etiqueta_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('etiqueta_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput
              label="Lançamento"
              type="date"
              value={form.lancto_ ? form.lancto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('lancto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
        </FormSection>
        <FormSection title="Controle">
          <FormRow cols={3}>
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
            <FormInput label="Par. OK" type="number" value={String(form.parok)} onChange={(e) => set('parok', parseInt(e.target.value) || 0)} />
            <FormInput label="Int. Lan." value={form.intlan} onChange={(e) => set('intlan', e.target.value)} maxLength={8} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir a parcela seq. ${confirmDelete?.seq}?`}
      />
    </div>
  )
}
