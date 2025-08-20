'use client'

import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  UserIcon,
  LogOutIcon,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

import NotificationsDropdown from '@/components/NotificationsDropdown'

export default function TopbarDesktop() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cierra el menú si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const name = session?.user?.name || 'Usuario'

  return (
    <header className="hidden md:flex w-full px-6 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      <div className="text-xl font-semibold text-gray-800 dark:text-white">
        Panel de Cliente
      </div>

      <div className="flex items-center gap-4">
        {/* Selector de idioma */}
        <button
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
          aria-label="Cambiar idioma"
        >
          <GlobeIcon className="w-4 h-4 mr-1" />
          ES
        </button>

        {/* Dropdown de notificaciones */}
        <NotificationsDropdown />

        {/* Toggle tema */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Menú de perfil */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            aria-label="Menú de perfil"
          >
            <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">
              {name}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
              <a
                href="/client/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Mi Perfil
              </a>
              <a
                href="/client/verify"
                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Verificación
              </a>
              <a
                href="/client/payments"
                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Pagos
              </a>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOutIcon className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
