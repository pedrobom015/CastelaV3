interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-900">
      <div>
        <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}

const variants = {
  primary: 'bg-blue-900 text-white hover:bg-blue-800',
  secondary: 'bg-white text-gray-700 hover:bg-blue-50 shadow-sm hover:shadow border border-blue-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-1.5 text-sm',
  lg: 'px-6 py-2 text-base',
}

export function Btn({ variant = 'primary', size = 'md', icon, children, className = '', ...props }: BtnProps) {
  return (
    <button
      className={`rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-1 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Pesquisar...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded pl-7 pr-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    '1': { label: 'Ativo', color: 'bg-green-100 text-green-800' },
    '2': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    '3': { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
    '4': { label: 'Inadimplente', color: 'bg-orange-100 text-orange-800' },
    '0': { label: 'Inativo', color: 'bg-gray-100 text-gray-700' },
  }
  const entry = map[status?.trim()] ?? { label: status ?? '-', color: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${entry.color}`}>
      {entry.label}
    </span>
  )
}
