'use client'

import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  FolderIcon,
  FileTextIcon,
  LogOutIcon,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function TopbarMobile() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [fullName, setFullName] = useState('Cliente')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Error al cargar usuario')
        const { user } = await res.json()
        const name =
          user.lastname && user.name
            ? `${user.name} ${user.lastname}`
            : user.name || 'Cliente'
        setFullName(name)
      } catch {
        setFullName('Cliente')
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex md:hidden w-full px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      {/* Nombre */}
      <div className="text-sm font-medium text-gray-800 dark:text-white">
        {fullName}
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 relative">
        {/* Toggle tema */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Menú de perfil */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Abrir menú de perfil"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-50">
              {/* Opciones */}
              <button
                onClick={() => { router.push('/client/profile'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <UserIcon className="w-4 h-4 mr-2" /> Perfil
              </button>
              <button
                onClick={() => { router.push('/client/files'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <FileTextIcon className="w-4 h-4 mr-2" /> Documentos
              </button>
              <button
                onClick={() => { router.push('/client/projects'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <FolderIcon className="w-4 h-4 mr-2" /> Proyectos
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Cerrar sesión */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-4 py-2 text-sm"
              >
                <LogOutIcon className="w-4 h-4 mr-2" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
