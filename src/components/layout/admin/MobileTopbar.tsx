// src/components/MobileTopbar.tsx
'use client'

import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  LogOutIcon,
  HomeIcon,
  FolderIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  UsersIcon,
  ServerIcon,
  SettingsIcon,
  FilePlusIcon,
  ClipboardListIcon,
  TagIcon,
  ShieldIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

import NotificationsDropdown from '@/components/NotificationsDropdown'

export default function MobileTopbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [fullName, setFullName] = useState('Admin')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Lista de secciones
  const sections = [
    {
      title: 'General',
      icon: HomeIcon,
      items: [
        { label: 'Dashboard',     href: '/admin',           icon: HomeIcon },
        { label: 'Mi Perfil',     href: '/admin/profile',   icon: UserIcon },
        { label: 'Verificaciones', href: '/admin/verify',    icon: ShieldIcon },
        { label: 'Ajustes',        href: '/admin/settings',  icon: SettingsIcon },
      ],
    },
    {
      title: 'Contenido',
      icon: FolderIcon,
      items: [
        { label: 'Proyectos',      href: '/admin/projects',    icon: FolderIcon },
        { label: 'Servicios',      href: '/admin/services',    icon: ServerIcon },
        { label: 'Tareas',         href: '/admin/tasks',       icon: ClipboardListIcon },
        { label: 'Publicaciones',  href: '/admin/posts',       icon: FilePlusIcon },
        { label: 'Pricing',        href: '/admin/pricing',     icon: TagIcon },
      ],
    },
    {
      title: 'Reuniones',
      icon: CalendarIcon,
      items: [
        { label: 'Meetings',       href: '/admin/meetings',   icon: CalendarIcon },
      ],
    },
    {
      title: 'Soporte',
      icon: FileTextIcon,
      items: [
        { label: 'Tickets',        href: '/admin/tickets',    icon: FileTextIcon },

      ],
    },
    {
      title: 'Facturación',
      icon: CreditCardIcon,
      items: [
        { label: 'Finanzas',       href: '/admin/finance',     icon: CreditCardIcon },
        { label: 'Invoices',       href: '/admin/invoices',    icon: FileTextIcon },
        { label: 'Payments',       href: '/admin/payments',    icon: CreditCardIcon },
        { label: 'Quotes',         href: '/admin/quotes',      icon: FileTextIcon },
      ],
    },
    {
      title: 'Usuarios',
      icon: UsersIcon,
      items: [
        { label: 'Usuarios',       href: '/admin/users',       icon: UsersIcon },
      ],
    },
  ]

  useEffect(() => {
    setMounted(true)
    ;(async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error()
        const { user } = await res.json()
        setFullName(
          user.lastname && user.name
            ? `${user.name} ${user.lastname}`
            : user.name || 'Admin'
        )
      } catch {
        setFullName('Admin')
      }
    })()
  }, [])

  // Cerramos dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
        setOpenSection(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title)
  }

  return (
    <header className="flex md:hidden w-full px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      {/* Nombre + rol */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white">
        <span>{fullName}</span>
        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold ml-2">
          Admin
        </span>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 relative">
        <NotificationsDropdown />

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Toggle dark mode"
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
            onClick={() => {
              setDropdownOpen(!dropdownOpen)
              setOpenSection(null)
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Profile menu"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-50">
              {sections.map(({ title, icon: SectIcon, items }) => (
                <div key={title} className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Cabecera de sección */}
                  <button
                    onClick={() => toggleSection(title)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="flex items-center">
                      <SectIcon className="w-4 h-4 mr-2" /> {title}
                    </span>
                    {openSection === title ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>

                  {/* Items desplegados */}
                  {openSection === title && (
                    <div className="bg-gray-50 dark:bg-gray-900">
                      {items.map(({ label, href, icon: Icon }) => (
                        <button
                          key={href}
                          onClick={() => {
                            router.push(href)
                            setDropdownOpen(false)
                            setOpenSection(null)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Icon className="w-4 h-4 mr-2" /> {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

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
