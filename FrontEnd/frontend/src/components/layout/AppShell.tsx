import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useThemeStore } from '../../store/themeStore'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/appStore'

export function AppShell() {
  const theme = useThemeStore((s) => s.theme)
  const { user: firebaseUser } = useAuth()
  const { setUsuario, nivelop } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.remove('theme-blue', 'theme-orange', 'theme-gray')
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])

  // Sincroniza o usuário do Firebase com o store sempre que o auth resolver
  useEffect(() => {
    if (!firebaseUser) return
    const nome = (firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'SIS')
      .toUpperCase()
    setUsuario(nome, nivelop)
  }, [firebaseUser])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
