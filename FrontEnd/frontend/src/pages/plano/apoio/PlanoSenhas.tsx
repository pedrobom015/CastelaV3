import { useState, useEffect, useMemo } from 'react'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { Modal, ConfirmDialog } from '../../../components/common/Modal'
import { PageHeader, Btn, SearchBar } from '../../../components/common/PageHeader'
import { FormInput, FormSelect, FormSection, FormRow } from '../../../components/common/FormField'
import type { DbfRecord } from '../../../types/models'

interface AppUser {
  username: string
  level: number
  createdAt?: string
}

const LEVEL_OPTS = [
  { value: '', label: '-- Nível --' },
  { value: '1', label: '1 - Consulta' },
  { value: '2', label: '2 - Operador' },
  { value: '3', label: '3 - Administrador' },
]

const LEVEL_LABELS: Record<number, string> = {
  1: 'Consulta', 2: 'Operador', 3: 'Administrador',
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-red-100 text-red-800',
}

const STORAGE_KEY = 'adp-users'

function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AppUser[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

const COLUMNS: Column[] = [
  { key: 'username', label: 'Usuário', width: '180px' },
  {
    key: 'level', label: 'Nível', width: '150px',
    render: (v) => {
      const lv = Number(v)
      const label = LEVEL_LABELS[lv] ?? String(v)
      const color = LEVEL_COLORS[lv] ?? 'bg-gray-100 text-gray-700'
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
    },
  },
  { key: 'createdAt', label: 'Criado em', width: '150px' },
]

export function PlanoSenhas() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', level: '1' })
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [error, setError] = useState('')
  const isDirty = editingUser ? form.username !== editingUser.username || form.level !== String(editingUser.level) : true

  useEffect(() => {
    setUsers(loadUsers())
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const t = search.toLowerCase()
    return users.filter((u) => u.username.toLowerCase().includes(t))
  }, [users, search])

  // Convert to DbfRecord-compatible format
  const tableData: DbfRecord[] = filtered.map((u) => ({
    username: u.username,
    level: u.level,
    createdAt: u.createdAt ?? '',
  }))

  function handleNew() {
    setEditingUser(null)
    setForm({ username: '', password: '', level: '1' })
    setError('')
    setModalOpen(true)
  }

  function handleRowClick(record: DbfRecord) {
    const user = users.find((u) => u.username === String(record['username']))
    if (user) {
      setEditingUser(user)
      setForm({ username: user.username, password: '', level: String(user.level) })
      setError('')
      setModalOpen(true)
    }
  }

  function handleSave() {
    setError('')
    if (!form.username.trim()) {
      setError('Nome de usuário é obrigatório.')
      return
    }
    if (!form.level) {
      setError('Selecione um nível.')
      return
    }
    if (!editingUser && !form.password.trim()) {
      setError('Senha é obrigatória para novo usuário.')
      return
    }

    const newUsers = editingUser
      ? users.map((u) =>
          u.username === editingUser.username
            ? { ...u, level: parseInt(form.level), username: form.username.trim() }
            : u
        )
      : (() => {
          const exists = users.some((u) => u.username.toLowerCase() === form.username.trim().toLowerCase())
          if (exists) {
            setError(`Usuário "${form.username}" já existe.`)
            return null
          }
          return [
            ...users,
            {
              username: form.username.trim(),
              level: parseInt(form.level),
              createdAt: new Date().toLocaleDateString('pt-BR'),
            },
          ]
        })()

    if (!newUsers) return
    setUsers(newUsers)
    saveUsers(newUsers)
    setModalOpen(false)
  }

  function handleDelete() {
    if (!confirmDelete) return
    const newUsers = users.filter((u) => u.username !== confirmDelete.username)
    setUsers(newUsers)
    saveUsers(newUsers)
    setConfirmDelete(null)
  }

  return (
    <div className="p-4 max-w-3xl">
      <PageHeader
        title="Plano de Senhas"
        subtitle="Gerenciamento de usuários e níveis de acesso (localStorage)"
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar usuário..." />
            <Btn icon="+" onClick={handleNew}>Incluir</Btn>
          </>
        }
      />

      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
        Os usuários são armazenados localmente no navegador (localStorage). Esta funcionalidade é para controle de acesso básico na estação de trabalho.
      </div>

      <div className="mb-2 text-sm text-gray-500">{filtered.length} usuário(s)</div>

      <DataTable
        columns={[
          ...COLUMNS,
          // { key: '_del' (Excluir) — desabilitado }
        ]}
        data={tableData}
        onRowClick={handleRowClick}
        pageSize={30}
        emptyMessage="Nenhum usuário cadastrado"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={!isDirty}>Salvar</Btn>
          </>
        }
      >
        <FormSection title="Dados do Usuário">
          <FormInput
            label="Usuário"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            maxLength={20}
            required
            placeholder="Nome de login"
          />
          {!editingUser && (
            <FormInput
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              placeholder="Senha inicial"
            />
          )}
          <FormSelect
            label="Nível de Acesso"
            value={form.level}
            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
            options={LEVEL_OPTS}
            required
          />
        </FormSection>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Níveis:</strong><br />
          1 - Consulta: somente visualização<br />
          2 - Operador: incluir e editar<br />
          3 - Administrador: acesso total
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        title="Confirmar Exclusão"
        message={`Deseja excluir o usuário "${confirmDelete?.username}"?`}
      />
    </div>
  )
}
