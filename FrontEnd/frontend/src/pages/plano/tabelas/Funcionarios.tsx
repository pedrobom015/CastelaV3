import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormTextarea, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCpf } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type FuncRec = DbfRecord & {
  codigo: string; nome: string; profiss: string; nacional: string
  estciv: string; nascto_: Date | null; endereco: string; bairro: string
  cidade: string; cpf: string; telefone: string; percent: number; obs: string
}

function emptyRec(): FuncRec {
  return {
    codigo: '', nome: '', profiss: '', nacional: '', estciv: '',
    nascto_: null, endereco: '', bairro: '', cidade: '', cpf: '',
    telefone: '', percent: 0, obs: '',
  }
}

const ESTCIV_OPTS = [
  { value: '', label: '-- Estado Civil --' },
  { value: 'SO', label: 'Solteiro(a)' },
  { value: 'CA', label: 'Casado(a)' },
  { value: 'DI', label: 'Divorciado(a)' },
  { value: 'VI', label: 'Viúvo(a)' },
  { value: 'SE', label: 'Separado(a)' },
  { value: 'UN', label: 'União Estável' },
]

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '70px', align: 'center' },
  { key: 'nome', label: 'Nome', width: '220px' },
  { key: 'profiss', label: 'Profissão', width: '140px' },
  { key: 'telefone', label: 'Telefone', width: '130px' },
  { key: 'percent', label: '% Comissão', width: '100px', align: 'right', render: (v) => `${Number(v).toFixed(1)}%` },
]

export function Funcionarios() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FuncRec | null>(null)
  const [form, setForm] = useState<FuncRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<FuncRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('fncs')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'nome', 'profiss', 'cpf', 'telefone']) as FuncRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as FuncRec)
    setForm({ ...(record as FuncRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('fncs', newTable)
    await writeDbfFile(dirHandle, 'FNCS.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('fncs')
      const newRec: FuncRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('fncs', newTable)
      await writeDbfFile(dirHandle, 'FNCS.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof FuncRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Funcionários"
        subtitle="FNCS.DBF — Cadastro de funcionários"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, nome, CPF..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} funcionário(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Funcionário' : 'Novo Funcionário'}
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
          <FormRow cols={2}>
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={3} required />
            <FormInput label="% Comissão" type="number" step="0.1" value={String(form.percent)} onChange={(e) => set('percent', parseFloat(e.target.value) || 0)} />
          </FormRow>
          <FormInput label="Nome Completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} maxLength={35} required />
          <FormRow cols={2}>
            <FormInput label="Profissão" value={form.profiss} onChange={(e) => set('profiss', e.target.value)} maxLength={15} />
            <FormInput label="Nacionalidade" value={form.nacional} onChange={(e) => set('nacional', e.target.value)} maxLength={15} />
          </FormRow>
        </FormSection>
        <FormSection title="Dados Pessoais">
          <FormRow cols={3}>
            <FormSelect label="Estado Civil" value={form.estciv} onChange={(e) => set('estciv', e.target.value)} options={ESTCIV_OPTS} />
            <FormInput
              label="Nascimento"
              type="date"
              value={form.nascto_ ? form.nascto_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('nascto_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
            <FormInput label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} maxLength={11} placeholder="00000000000" />
          </FormRow>
          <FormInput label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} maxLength={14} />
        </FormSection>
        <FormSection title="Endereço">
          <FormInput label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} maxLength={30} />
          <FormRow cols={2}>
            <FormInput label="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} maxLength={25} />
            <FormInput label="Cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} maxLength={25} />
          </FormRow>
        </FormSection>
        <FormSection title="Observações">
          <FormTextarea label="Obs." value={form.obs} onChange={(e) => set('obs', e.target.value)} rows={3} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o funcionário "${confirmDelete?.nome}"?`}
      />
    </div>
  )
}
