import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormTextarea, FormSection, FormRow } from '../../../components/common/FormField'
import { formatCpf } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type CobRec = DbfRecord & {
  cobrador: string; funcao: string; nome: string; endereco: string
  bairro: string; cidade: string; telefone: string; cpf: string
  obs: string; percent: number; superv: string
}

function emptyRec(): CobRec {
  return {
    cobrador: '', funcao: '', nome: '', endereco: '', bairro: '', cidade: '',
    telefone: '', cpf: '', obs: '', percent: 0, superv: '',
  }
}

const FUNCAO_OPTS = [
  { value: '', label: '-- Função --' },
  { value: 'C', label: 'C - Cobrador' },
  { value: 'S', label: 'S - Supervisor' },
  { value: 'G', label: 'G - Gerente' },
  { value: 'V', label: 'V - Vendedor' },
]

const COLUMNS: Column[] = [
  { key: 'cobrador', label: 'Código', width: '70px', align: 'center' },
  { key: 'funcao', label: 'Função', width: '70px', align: 'center' },
  { key: 'nome', label: 'Nome', width: '220px' },
  { key: 'telefone', label: 'Telefone', width: '130px' },
  { key: 'percent', label: '% Comissão', width: '100px', align: 'right', render: (v) => `${Number(v).toFixed(1)}%` },
]

export function Cobradores() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CobRec | null>(null)
  const [form, setForm] = useState<CobRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<CobRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('cobrador')

  const records = useMemo(() => {
    return searchRecords(table, search, ['cobrador', 'nome', 'telefone', 'cpf']) as CobRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    const records = table?.records.filter((r) => !r._deleted) ?? []
    const maxCod = records.reduce((max, r) => {
      const n = parseInt(String(r.cobrador ?? '').trim(), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
    setForm({ ...emptyRec(), cobrador: String(maxCod + 1).padStart(3, '0') })
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as CobRec)
    setForm({ ...(record as CobRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('cobrador', newTable)
    await writeDbfFile(dirHandle, 'COBRADOR.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('cobrador')
      const newRec: CobRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('cobrador', newTable)
      await writeDbfFile(dirHandle, 'COBRADOR.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof CobRec, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Cobradores"
        subtitle="COBRADOR.DBF — Cadastro de cobradores e vendedores"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, nome, CPF..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} cobrador(es)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Cobrador' : 'Novo Cobrador'}
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
            <FormInput label="Código" value={form.cobrador} onChange={(e) => set('cobrador', e.target.value)} maxLength={3} required disabled />
            <FormSelect label="Função" value={form.funcao} onChange={(e) => set('funcao', e.target.value)} options={FUNCAO_OPTS} />
            <FormInput label="Supervisor" value={form.superv} onChange={(e) => set('superv', e.target.value)} maxLength={3} />
          </FormRow>
          <FormInput label="Nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} maxLength={30} required />
        </FormSection>
        <FormSection title="Dados Pessoais">
          <FormRow cols={2}>
            <FormInput label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} maxLength={11} placeholder="00000000000" />
            <FormInput label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} maxLength={14} />
          </FormRow>
          <FormInput label="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} maxLength={30} />
          <FormRow cols={2}>
            <FormInput label="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} maxLength={20} />
            <FormInput label="Cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} maxLength={25} />
          </FormRow>
        </FormSection>
        <FormSection title="Comissão e Observações">
          <FormInput label="% Comissão" type="number" step="0.1" value={String(form.percent)} onChange={(e) => set('percent', parseFloat(e.target.value) || 0)} />
          <FormTextarea label="Observações" value={form.obs} onChange={(e) => set('obs', e.target.value)} rows={3} />
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o cobrador "${confirmDelete?.nome}"?`}
      />
    </div>
  )
}
