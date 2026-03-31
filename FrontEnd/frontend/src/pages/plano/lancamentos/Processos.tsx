import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate } from '../../../utils/formatters'
import { getRecords, searchRecords, nextCode } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type ProcessoRec = DbfRecord & {
  processo: string; categ: string; saiu: string; grup: string; num: string
  grau: string; seq: number; seg: string; ends: string; bais: string
  cids: string; fal: string; sep: string; dfal: Date | null; codlan: string
}

function emptyRec(): ProcessoRec {
  return {
    processo: '', categ: '', saiu: '', grup: '', num: '', grau: '', seq: 0,
    seg: '', ends: '', bais: '', cids: '', fal: '', sep: '', dfal: null, codlan: '',
  }
}

const COLUMNS: Column[] = [
  { key: 'processo', label: 'Processo', width: '100px' },
  { key: 'categ', label: 'Categ.', width: '60px', align: 'center' },
  { key: 'num', label: 'Contrato', width: '100px' },
  { key: 'seg', label: 'Segurado', width: '200px' },
  { key: 'fal', label: 'Falecido', width: '200px' },
  { key: 'dfal', label: 'Dt. Falec.', width: '100px', render: (v) => formatDate(v as Date) },
]

export function Processos() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProcessoRec | null>(null)
  const [form, setForm] = useState<ProcessoRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<ProcessoRec | null>(null)
  const [saving, setSaving] = useState(false)

  const table = getTable('prcessos')

  const records = useMemo(() => {
    return searchRecords(table, search, ['processo', 'categ', 'num', 'seg', 'fal']) as ProcessoRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.processo = nextCode(table, 'processo', 9)
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as ProcessoRec)
    setForm({ ...(record as ProcessoRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('prcessos', newTable)
    await writeDbfFile(dirHandle, 'PRCESSOS.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('prcessos')
      const newRec: ProcessoRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('prcessos', newTable)
      await writeDbfFile(dirHandle, 'PRCESSOS.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof ProcessoRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Processos"
        subtitle="PRCESSOS.DBF — Registro de processos funerários"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por processo, número, segurado, falecido..." />
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
        title={editing ? 'Editar Processo' : 'Novo Processo'}
        size="xl"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {editing && (
              <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>
            )}
          </>
        }
      >
        <FormSection title="Identificação do Processo">
          <FormRow cols={4}>
            <FormInput label="Processo" value={form.processo} onChange={(e) => set('processo', e.target.value)} maxLength={9} required />
            <FormInput label="Categoria" value={form.categ} onChange={(e) => set('categ', e.target.value)} maxLength={2} />
            <FormInput label="Saiu" value={form.saiu} onChange={(e) => set('saiu', e.target.value)} maxLength={3} />
            <FormInput label="Grupo" value={form.grup} onChange={(e) => set('grup', e.target.value)} maxLength={2} />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Número" value={form.num} onChange={(e) => set('num', e.target.value)} maxLength={9} />
            <FormInput label="Grau" value={form.grau} onChange={(e) => set('grau', e.target.value)} maxLength={1} />
            <FormInput label="Seq." type="number" value={String(form.seq)} onChange={(e) => set('seq', parseInt(e.target.value) || 0)} />
          </FormRow>
        </FormSection>

        <FormSection title="Segurado">
          <FormInput label="Nome Segurado" value={form.seg} onChange={(e) => set('seg', e.target.value)} maxLength={35} />
          <FormInput label="Endereço" value={form.ends} onChange={(e) => set('ends', e.target.value)} maxLength={40} />
          <FormRow cols={2}>
            <FormInput label="Bairro" value={form.bais} onChange={(e) => set('bais', e.target.value)} maxLength={25} />
            <FormInput label="Cidade" value={form.cids} onChange={(e) => set('cids', e.target.value)} maxLength={25} />
          </FormRow>
        </FormSection>

        <FormSection title="Falecimento">
          <FormInput label="Nome Falecido" value={form.fal} onChange={(e) => set('fal', e.target.value)} maxLength={35} />
          <FormRow cols={2}>
            <FormInput label="Sepultador" value={form.sep} onChange={(e) => set('sep', e.target.value)} maxLength={35} />
            <FormInput
              label="Data Falecimento"
              type="date"
              value={form.dfal ? form.dfal.toISOString().split('T')[0] : ''}
              onChange={(e) => set('dfal', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
          <FormInput label="Cód. Lançamento" value={form.codlan} onChange={(e) => set('codlan', e.target.value)} maxLength={20} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o processo ${confirmDelete?.processo}?`}
      />
    </div>
  )
}
