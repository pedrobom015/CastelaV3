import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSection, FormRow } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords, searchRecords, nextCode, findRecord } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'

type BoletoRec = DbfRecord & {
  seq: string; nnumero: string; codigo: string; tipo: string; circ: string
  por: string; em_: Date | null
}

function emptyRec(): BoletoRec {
  return { seq: '', nnumero: '', codigo: '', tipo: '', circ: '', por: '', em_: null }
}

const COLUMNS: Column[] = [
  { key: 'seq', label: 'Seq.', width: '70px' },
  { key: 'nnumero', label: 'Nosso Número', width: '130px' },
  { key: 'codigo', label: 'Código', width: '80px' },
  { key: 'tipo', label: 'Tipo', width: '60px', align: 'center' },
  { key: 'circ', label: 'Circular', width: '70px', align: 'center' },
  { key: 'por', label: 'Por', width: '100px' },
  { key: 'em_', label: 'Emissão', width: '100px', render: (v) => formatDate(v as Date) },
]

export function Boletos() {
  const { getTable, setTable, dirHandle, usuario, parametros } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [editing, setEditing] = useState<BoletoRec | null>(null)
  const [selectedForPrint, setSelectedForPrint] = useState<BoletoRec | null>(null)
  const [form, setForm] = useState<BoletoRec>(emptyRec())
  const [confirmDelete, setConfirmDelete] = useState<BoletoRec | null>(null)
  const [saving, setSaving] = useState(false)
  const isDirty = editing ? JSON.stringify(form) !== JSON.stringify(editing) : true

  const table = getTable('boletos')
  const taxasTable = getTable('taxas')

  const records = useMemo(() => {
    return searchRecords(table, search, ['seq', 'nnumero', 'codigo', 'tipo', 'circ', 'por']) as BoletoRec[]
  }, [table, search])

  function handleNew() {
    const rec = emptyRec()
    rec.seq = nextCode(table, 'seq', 6)
    rec.por = usuario
    rec.em_ = new Date()
    setEditing(null)
    setForm(rec)
    setModalOpen(true)
  }

  function handleEdit(record: DbfRecord) {
    setEditing(record as BoletoRec)
    setForm({ ...(record as BoletoRec) })
    setModalOpen(true)
  }

  function handlePrint(record: BoletoRec) {
    setSelectedForPrint(record)
    setPrintOpen(true)
  }

  async function handleDelete() {
    if (!confirmDelete || !table || !dirHandle) return
    const updated = table.records.filter((r) => r !== confirmDelete)
    const newTable = { ...table, records: updated }
    setTable('boletos', newTable)
    await writeDbfFile(dirHandle, 'BOLETOS.DBF', newTable)
    setConfirmDelete(null)
  }

  async function handleSave() {
    if (!dirHandle) return
    setSaving(true)
    try {
      const currentTable = getTable('boletos')
      const newRec: BoletoRec = { ...form, por: usuario || form.por }
      let updatedRecords: DbfRecord[]
      if (editing) {
        updatedRecords = (currentTable?.records ?? []).map((r) => (r === editing ? newRec : r))
      } else {
        updatedRecords = [...(currentTable?.records ?? []), newRec]
      }
      const newTable = currentTable
        ? { ...currentTable, records: updatedRecords }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: updatedRecords.length, headerSize: 0, recordSize: 0, fields: [] }, records: updatedRecords }
      setTable('boletos', newTable)
      await writeDbfFile(dirHandle, 'BOLETOS.DBF', newTable)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof BoletoRec, value: string | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Busca valor da taxa para o boleto selecionado
  function getTaxaValor(rec: BoletoRec): number {
    const taxa = findRecord(taxasTable, 'codigo', rec.codigo)
    return Number(taxa?.['valor'] ?? 0)
  }

  const beneficiario = String(parametros?.['pgrupo'] ?? parametros?.['p_filial'] ?? 'FUNERÁRIA')

  return (
    <div className="p-4">
      <PageHeader
        title="Boletos"
        subtitle="BOLETOS.DBF — Controle de boletos emitidos"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por seq., nosso número, código..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} registro(s)</div>

      <DataTable
        columns={[
          ...COLUMNS,
          {
            key: '_actions', label: '', width: '130px', sortable: false,
            render: (_, record) => (
              <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handlePrint(record as BoletoRec) }}>
                🖨 Imprimir
              </Btn>
            ),
          },
        ]}
        data={records as DbfRecord[]}
        onRowClick={handleEdit}
        pageSize={50}
      />

      {/* Modal Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Boleto' : 'Novo Boleto'}
        size="md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving || !isDirty}>{saving ? 'Salvando...' : 'Salvar'}</Btn>
            {/* {editing && <Btn variant="danger" onClick={() => { setModalOpen(false); setConfirmDelete(editing) }}>Excluir</Btn>} */}
          </>
        }
      >
        <FormSection title="Dados do Boleto">
          <FormRow cols={2}>
            <FormInput label="Seq." value={form.seq} onChange={(e) => set('seq', e.target.value)} maxLength={9} />
            <FormInput label="Nosso Número" value={form.nnumero} onChange={(e) => set('nnumero', e.target.value)} maxLength={10} required />
          </FormRow>
          <FormRow cols={3}>
            <FormInput label="Código" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} maxLength={9} required />
            <FormInput label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} maxLength={1} />
            <FormInput label="Circular" value={form.circ} onChange={(e) => set('circ', e.target.value)} maxLength={3} />
          </FormRow>
          <FormRow cols={2}>
            <FormInput label="Por" value={form.por} onChange={(e) => set('por', e.target.value)} maxLength={10} />
            <FormInput
              label="Emissão"
              type="date"
              value={form.em_ ? form.em_.toISOString().split('T')[0] : ''}
              onChange={(e) => set('em_', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
            />
          </FormRow>
        </FormSection>
      </Modal>

      {/* Modal Impressão Boleto */}
      <Modal
        isOpen={printOpen}
        onClose={() => setPrintOpen(false)}
        title="Imprimir Boleto"
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setPrintOpen(false)}>Fechar</Btn>
            <Btn onClick={() => window.print()}>🖨 Imprimir</Btn>
          </>
        }
      >
        {selectedForPrint && (
          <div className="border-2 border-gray-800 rounded p-4 font-mono text-sm print:border-black">
            {/* Cabeçalho Boleto */}
            <div className="border-b-2 border-gray-800 pb-3 mb-3 flex justify-between items-center">
              <div>
                <div className="text-lg font-bold uppercase">{beneficiario}</div>
                <div className="text-xs text-gray-600">Beneficiário</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Nosso Número</div>
                <div className="text-xl font-bold tracking-widest">{String(selectedForPrint.nnumero ?? '').trim()}</div>
              </div>
            </div>

            {/* Linha código */}
            <div className="grid grid-cols-3 gap-4 border-b border-gray-400 pb-2 mb-2">
              <div>
                <div className="text-xs text-gray-500">Código do Contrato</div>
                <div className="font-bold">{String(selectedForPrint.codigo ?? '').trim()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Circular</div>
                <div className="font-bold">{String(selectedForPrint.circ ?? '').trim()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Tipo</div>
                <div className="font-bold">{String(selectedForPrint.tipo ?? '').trim()}</div>
              </div>
            </div>

            {/* Valor e Vencimento */}
            <div className="grid grid-cols-2 gap-4 border-b border-gray-400 pb-2 mb-2">
              <div>
                <div className="text-xs text-gray-500">Data de Emissão</div>
                <div className="font-bold">{formatDate(selectedForPrint.em_)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Valor do Documento</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(getTaxaValor(selectedForPrint))}</div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-4 pt-2 border-t border-dashed border-gray-400">
              <div className="text-xs text-gray-500 text-center">
                ADP — Sistema de Controle de Processos Funerários
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">
                Emitido por: {String(selectedForPrint.por ?? '').trim()} | Seq: {String(selectedForPrint.seq ?? '').trim()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o boleto seq. ${confirmDelete?.seq}?`}
      />
    </div>
  )
}
