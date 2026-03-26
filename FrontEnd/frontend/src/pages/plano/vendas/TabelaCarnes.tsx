import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormSection, FormRow } from '../../../components/common/FormField'
import { formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type TcarnesRec = DbfRecord & {
  tip: string; tipcob: string; formapgto: string; pari: number
  vali: number; parf: number; parm: number
}

function emptyRec(): TcarnesRec {
  return { tip: '', tipcob: '', formapgto: '', pari: 0, vali: 0, parf: 0, parm: 0 }
}

const TIPCOB_OPTS = [
  { value: '', label: '-- Selecione --' },
  { value: 'M', label: 'M - Mensal' },
  { value: 'B', label: 'B - Bimestral' },
  { value: 'T', label: 'T - Trimestral' },
  { value: 'S', label: 'S - Semestral' },
  { value: 'A', label: 'A - Anual' },
]

const FORMAPGTO_OPTS = [
  { value: '', label: '-- Selecione --' },
  { value: '01', label: '01 - Mensalidade' },
  { value: '02', label: '02 - Carnê' },
  { value: '03', label: '03 - Débito Automático' },
  { value: '04', label: '04 - Boleto' },
  { value: '05', label: '05 - Cartão' },
]

const TIPCOB_MAP: Record<string, string> = { M: 'M - Mensal', B: 'B - Bimestral', T: 'T - Trimestral', S: 'S - Semestral', A: 'A - Anual' }
const FORMAPGTO_MAP: Record<string, string> = { '01': '01 - Mensalidade', '02': '02 - Carnê', '03': '03 - Débito Automático', '04': '04 - Boleto', '05': '05 - Cartão' }

const COLUMNS: Column[] = [
  { key: 'tip', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'tipcob', label: 'Tp. Cobrança', width: '120px', render: (v) => TIPCOB_MAP[String(v)] ?? String(v) },
  { key: 'formapgto', label: 'Forma Pgto.', width: '150px', render: (v) => FORMAPGTO_MAP[String(v)] ?? String(v) },
  { key: 'pari', label: 'Par. Inicial', width: '90px', align: 'right' },
  { key: 'vali', label: 'Valor Total', width: '110px', align: 'right', render: (v) => formatCurrency(Number(v)) },
  { key: 'parf', label: 'Nº Parcelas', width: '90px', align: 'right' },
  { key: 'parm', label: 'Par. Máx.', width: '90px', align: 'right' },
]

export function TabelaCarnes() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TcarnesRec | null>(null)
  const [form, setForm] = useState<TcarnesRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<TcarnesRec | null>(null)
  const [saving, setSaving] = useState(false)

  const table = getTable('tcarnes')

  const records = useMemo(() => {
    return searchRecords(table, search, ['tip', 'tipcob', 'formapgto']) as TcarnesRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as TcarnesRec)
    setForm({ ...(record as TcarnesRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('tcarnes', newTable)
    await writeDbfFile(dirHandle, 'TCARNES.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('tcarnes')
      const newRec: TcarnesRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('tcarnes', newTable)
      await writeDbfFile(dirHandle, 'TCARNES.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof TcarnesRec, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Tabela de Carnês"
        subtitle="TCARNES.DBF — Configuração de tipos de carnê"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar..." />
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
        title={editing ? 'Editar Tipo de Carnê' : 'Novo Tipo de Carnê'}
        size="md"
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
        <FormSection title="Configuração do Tipo">
          <FormRow cols={2}>
            <FormInput label="Tipo" value={form.tip} onChange={(e) => set('tip', e.target.value)} maxLength={2} required />
            <FormSelect
              label="Tipo de Cobrança"
              value={form.tipcob}
              onChange={(e) => set('tipcob', e.target.value)}
              options={TIPCOB_OPTS}
            />
          </FormRow>
          <FormSelect
            label="Forma de Pagamento"
            value={form.formapgto}
            onChange={(e) => set('formapgto', e.target.value)}
            options={FORMAPGTO_OPTS}
          />
        </FormSection>
        <FormSection title="Parcelas e Valores">
          <FormRow cols={2}>
            <FormInput label="Parcela Inicial" type="number" value={String(form.pari)} onChange={(e) => set('pari', parseInt(e.target.value) || 0)} />
            <FormInput label="Valor Inicial" type="number" step="0.01" value={String(form.vali)} onChange={(e) => set('vali', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="Parcela Final" type="number" value={String(form.parf)} onChange={(e) => set('parf', parseInt(e.target.value) || 0)} />
            <FormInput label="Parcela Máxima" type="number" value={String(form.parm)} onChange={(e) => set('parm', parseInt(e.target.value) || 0)} />
          </FormRow>
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o tipo de carnê "${confirmDelete?.tip}"?`}
      />
    </div>
  )
}
