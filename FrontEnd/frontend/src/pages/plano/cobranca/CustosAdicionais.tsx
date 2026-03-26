import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type CstsegRec = DbfRecord & {
  emissao_: Date | null; hora: string; quem: string; historic: string
  contrato: string; complement: string; qtdade: number; valor: number
  tipo: string; circ: string
}

function emptyRec(): CstsegRec {
  return {
    emissao_: null, hora: '', quem: '', historic: '',
    contrato: '', complement: '', qtdade: 0, valor: 0, tipo: '', circ: '',
  }
}

const TIPO_OPTS = [
  { value: '', label: '-- Tipo --' },
  { value: 'R', label: 'R - Receita' },
  { value: 'D', label: 'D - Despesa' },
  { value: 'E', label: 'E - Estorno' },
]

const COLUMNS: Column[] = [
  { key: 'emissao_', label: 'Emissão', width: '100px', render: (v) => formatDate(v as Date) },
  { key: 'contrato', label: 'Contrato', width: '80px' },
  { key: 'historic', label: 'Histórico', width: '80px', align: 'center' },
  { key: 'complement', label: 'Complemento', width: '220px' },
  { key: 'valor', label: 'Valor', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
]

export function CustosAdicionais() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CstsegRec | null>(null)
  const [form, setForm] = useState<CstsegRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<CstsegRec | null>(null)
  const [saving, setSaving] = useState(false)

  const table = getTable('cstseg')

  const records = useMemo(() => {
    return searchRecords(table, search, ['contrato', 'historic', 'complement', 'circ']) as CstsegRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.emissao_ = new Date()
    rec.quem = usuario
    const now = new Date()
    rec.hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as CstsegRec)
    setForm({ ...(record as CstsegRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('cstseg', newTable)
    await writeDbfFile(dirHandle, 'CSTSEG.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('cstseg')
      const newRec: CstsegRec = { ...form, quem: usuario || form.quem }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('cstseg', newTable)
      await writeDbfFile(dirHandle, 'CSTSEG.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof CstsegRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Custos Adicionais"
        subtitle="CSTSEG.DBF — Registro de custos e despesas adicionais"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por contrato, histórico, complemento..." />
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
        title={editing ? 'Editar Custo Adicional' : 'Novo Custo Adicional'}
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
            <FormInput
              label="Emissão"
              type="date"
              value={form.emissao_ ? form.emissao_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('emissao_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="Hora" value={form.hora} onChange={(e) => set('hora', e.target.value)} maxLength={5} placeholder="HH:MM" />
            <FormInput label="Quem" value={form.quem} onChange={(e) => set('quem', e.target.value)} maxLength={10} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Contrato" value={form.contrato} onChange={(e) => set('contrato', e.target.value)} maxLength={9} required />
            <FormInput label="Histórico" value={form.historic} onChange={(e) => set('historic', e.target.value)} maxLength={3} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
          </FormRow>
        </FormSection>
        <FormSection title="Valores">
          <FormInput label="Complemento" value={form.complement} onChange={(e) => set('complement', e.target.value)} maxLength={35} />
          <FormRow cols={3}>
            <FormInput label="Quantidade" type="number" value={String(form.qtdade)} onChange={(e) => set('qtdade', parseInt(e.target.value) || 0)} />
            <FormInput label="Valor" type="number" step="0.01" value={String(form.valor)} onChange={(e) => set('valor', parseFloat(e.target.value) || 0)} />
            <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} placeholder="R/D/E" />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir este custo adicional do contrato ${confirmDelete?.contrato}?`}
      />
    </div>
  )
}
