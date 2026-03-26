import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatCurrency } from '../../../utils/formatters'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type ProdRec = DbfRecord & {
  codigo: string; produto: string; unid: string; grupo: string
  depto: string; qd_est: number; preco_cus: number; preco_ven: number
}

function emptyRec(): ProdRec {
  return {
    codigo: '', produto: '', unid: '', grupo: '',
    depto: '', qd_est: 0, preco_cus: 0, preco_ven: 0,
  }
}

const COLUMNS: Column[] = [
  { key: 'codigo', label: 'Código', width: '70px', align: 'center' },
  { key: 'produto', label: 'Produto', width: '220px' },
  { key: 'unid', label: 'Unid.', width: '60px', align: 'center' },
  { key: 'grupo', label: 'Grupo', width: '100px' },
  { key: 'qd_est', label: 'Estoque', width: '80px', align: 'right' },
  { key: 'preco_ven', label: 'Preço Venda', width: '120px', align: 'right', render: (v) => formatCurrency(Number(v)) },
]

export function Produtos() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProdRec | null>(null)
  const [form, setForm] = useState<ProdRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<ProdRec | null>(null)
  const [saving, setSaving] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(null)

  const table = getTable('pradendo')

  const records = useMemo(() => {
    return searchRecords(table, search, ['codigo', 'produto', 'grupo', 'depto']) as ProdRec[]
  }, [table, search])

  function handleNew() {
    setEditing(null)
    setForm(emptyRec())
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as ProdRec)
    setForm({ ...(record as ProdRec) })
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('pradendo', newTable)
    await writeDbfFile(dirHandle, 'PRADENDO.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('pradendo')
      const newRec: ProdRec = { ...form }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('pradendo', newTable)
      await writeDbfFile(dirHandle, 'PRADENDO.DBF', newTable)
      setModalOpen(false)
      setHighlightedRow(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlightedRow(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof ProdRec, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Produtos"
        subtitle="PRADENDO.DBF — Cadastro de produtos e serviços"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código, produto, grupo..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} produto(s)</div>

      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={handleEdit} pageSize={50} highlightedRow={highlightedRow} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Produto' : 'Novo Produto'}
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
          <FormRow cols={2}>
            <FormInput label="Código (4 car.)" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={4} required />
            <FormInput label="Unidade" value={form.unid} onChange={(e) => set('unid', e.target.value)} maxLength={2} placeholder="UN, KG, CX..." />
          </FormRow>
          <FormInput label="Nome do Produto" value={form.produto} onChange={(e) => set('produto', e.target.value)} maxLength={30} required />
          <FormRow cols={2}>
            <FormInput label="Grupo" value={form.grupo} onChange={(e) => set('grupo', e.target.value)} maxLength={10} />
            <FormInput label="Departamento" value={form.depto} onChange={(e) => set('depto', e.target.value)} maxLength={10} />
          </FormRow>
        </FormSection>
        <FormSection title="Estoque e Preços">
          <FormRow cols={3}>
            <FormInput label="Qtd. Estoque" type="number" value={String(form.qd_est)} onChange={(e) => set('qd_est', parseInt(e.target.value) || 0)} />
            <FormInput label="Preço Custo" type="number" step="0.01" value={String(form.preco_cus)} onChange={(e) => set('preco_cus', parseFloat(e.target.value) || 0)} />
            <FormInput label="Preço Venda" type="number" step="0.01" value={String(form.preco_ven)} onChange={(e) => set('preco_ven', parseFloat(e.target.value) || 0)} />
          </FormRow>
          {form.preco_cus > 0 && form.preco_ven > 0 && (
            <div className="text-sm text-green-700 bg-green-50 rounded p-2">
              Margem: {(((form.preco_ven - form.preco_cus) / form.preco_cus) * 100).toFixed(2)}%
            </div>
          )}
        </FormSection>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o produto "${confirmDelete?.produto}"?`}
      />
    </div>
  )
}
