import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { useThemeStore } from '../../../store/themeStore'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { searchRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'
import { writeDbfFile } from '../../../services/dbf/DbfReader'
import { type ArqgrupRec, emptyGrupo } from './GrupoFormFields'
import { GrupoWizardModal } from './GrupoWizardModal'

const COLUMNS: Column[] = [
  { key: 'grup',    label: 'Grupo',         width: '60px',  align: 'center' },
  { key: 'classe',  label: 'Classe',        width: '60px',  align: 'center' },
  { key: 'inicio',  label: 'Início',        width: '80px' },
  { key: 'final',   label: 'Final',         width: '80px' },
  { key: 'ultcirc', label: 'Últ. Circ.',    width: '80px',  align: 'center' },
  { key: 'contrat', label: 'Contratos',     width: '90px',  align: 'right' },
  { key: 'partic',  label: 'Participantes', width: '100px', align: 'right' },
]

export function GruposPage() {
  const { getTable, setTable, dirHandle } = useAppStore()
  const _theme = useThemeStore((s) => s.theme)
  const primary = _theme === 'orange' ? '#ff914d' : _theme === 'gray' ? '#248094' : '#1e3a8a'

  const [search,      setSearch]     = useState('')
  const [modalOpen,   setModalOpen]  = useState(false)
  const [editing,     setEditing]    = useState<ArqgrupRec | null>(null)
  const [form,        setForm]       = useState<ArqgrupRec>(emptyGrupo())
  const [confirmDel,  setConfirmDel] = useState<ArqgrupRec | null>(null)
  const [saving,      setSaving]     = useState(false)
  const [saveError,   setSaveError]  = useState('')
  const [highlighted, setHighlighted] = useState<DbfRecord | null>(null)
  const [selected,    setSelected]   = useState<DbfRecord | null>(null)

  const table        = getTable('arqgrup')
  const classesTable = getTable('classes')
  const gruposTable  = getTable('grupos')

  const statsPorGrupo = useMemo(() => {
    const map = new Map<string, { contrat: number; partic: number }>()
    ;(gruposTable?.records ?? []).filter((r) => !r._deleted).forEach((r) => {
      const g = String(r.grupo ?? '').trim()
      if (!g) return
      if (!map.has(g)) map.set(g, { contrat: 0, partic: 0 })
      const e = map.get(g)!
      e.contrat++
      e.partic += 1 + (Number(r.nrdepend) || 0)
    })
    return map
  }, [gruposTable])

  const classeOpts = useMemo(() => {
    const base = [{ value: '', label: '-- Selecione --' }]
    if (!classesTable) return base
    return base.concat(
      classesTable.records.filter((r) => !r._deleted).map((r) => ({
        value: String(r.classcod ?? '').trim(),
        label: `${String(r.classcod ?? '').trim()} — ${String(r.descricao ?? '').trim()}`,
      })).sort((a, b) => a.value.localeCompare(b.value)),
    )
  }, [classesTable])

  const records = useMemo(() => {
    const base = searchRecords(table, search, ['grup', 'classe', 'inicio', 'final', 'ultcirc']) as ArqgrupRec[]
    return base.map((r) => {
      const live = statsPorGrupo.get(String(r.grup ?? '').trim())
      return live ? { ...r, ...live } : r
    })
  }, [table, search, statsPorGrupo])

  const grupCod     = String(form.grup).trim()
  const liveStats   = statsPorGrupo.get(grupCod)
  const liveContrat = liveStats?.contrat ?? form.contrat
  const livePartic  = liveStats?.partic  ?? form.partic

  const participRecords = useMemo(() =>
    (gruposTable?.records ?? []).filter(
      (r) => !r._deleted && String(r.grupo ?? '').trim() === grupCod,
    ),
  [gruposTable, grupCod])

  function openNew() {
    const max = (table?.records.filter((r) => !r._deleted) ?? []).reduce((m, r) => {
      const n = parseInt(String(r.grup ?? '').trim(), 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    setEditing(null)
    setForm({ ...emptyGrupo(), grup: String(max + 1).padStart(4, '0') })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(record: DbfRecord) {
    setEditing(record as ArqgrupRec)
    setForm({ ...emptyGrupo(), ...(record as ArqgrupRec) })
    setSaveError('')
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setSaveError('') }

  async function handleDelete() {
    if (!confirmDel || !table || !dirHandle) return
    const newTable = { ...table, records: table.records.filter((r) => r !== confirmDel) }
    setTable('arqgrup', newTable)
    await writeDbfFile(dirHandle, 'ARQGRUP.DBF', newTable)
    setConfirmDel(null)
  }

  async function handleSave() {
    if (!dirHandle) { setSaveError('Abra uma pasta de dados antes de salvar.'); return }
    setSaving(true); setSaveError('')
    try {
      const cur = getTable('arqgrup')
      const newRec: ArqgrupRec = { ...form }
      const editKey = editing ? String(editing.grup ?? "").trim() : null
      const rows = editKey
        ? (cur?.records ?? []).map((r) => (String(r.grup ?? "").trim() === editKey ? newRec : r))
        : [...(cur?.records ?? []), newRec]
      const newTable = cur
        ? { ...cur, records: rows }
        : { header: { version: 3, lastUpdate: new Date(), recordCount: rows.length, headerSize: 0, recordSize: 0, fields: [] }, records: rows }
      setTable('arqgrup', newTable)
      await writeDbfFile(dirHandle, 'ARQGRUP.DBF', newTable)
      setModalOpen(false)
      setHighlighted(newRec as unknown as DbfRecord)
      setTimeout(() => setHighlighted(null), 3000)
    } catch (err) {
      setSaveError('Erro ao salvar: ' + String(err))
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof ArqgrupRec, value: string | number | Date | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Grupos"
        subtitle="ARQGRUP.DBF — Configuração de grupos de cobrança"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por grupo, classe..." />
            <Btn variant="secondary" icon="✏️" disabled={!selected} onClick={() => selected && openEdit(selected)}>Editar</Btn>
            <Btn icon="+" onClick={openNew} style={{ backgroundColor: primary, borderColor: primary }}>Novo Grupo</Btn>
          </>
        }
      />

      <div className="mb-2 text-sm text-gray-500">{records.length} grupo(s)</div>
      <DataTable columns={COLUMNS} data={records as DbfRecord[]} onRowClick={setSelected} selectedRow={selected} onRowDoubleClick={openEdit} pageSize={50} highlightedRow={highlighted} />

      <GrupoWizardModal
        isOpen={modalOpen} onClose={closeModal} onSave={handleSave}
        editing={!!editing} form={form} set={set} classeOpts={classeOpts}
        liveContrat={liveContrat} livePartic={livePartic}
        participRecords={participRecords}
        saving={saving} saveError={saveError} primary={primary}
      />

      <ConfirmDialog
        isOpen={!!confirmDel}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o grupo "${confirmDel?.grup}"?`}
      />
    </div>
  )
}
