'use client'

import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  MailIcon,
  LogOutIcon,
  HomeIcon,
  TicketIcon,
  FolderIcon,
  CalendarIcon,
  FileTextIcon,
  FileIcon,
  CreditCardIcon,
  DollarSignIcon,
  LockIcon,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

import NotificationsDropdown from '@/components/NotificationsDropdown'

export default function TopbarMobile() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [fullName, setFullName] = useState('Client')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Failed to fetch user')
        const { user } = await res.json()
        const name = user.lastname && user.name
          ? `${user.name} ${user.lastname}`
          : user.name || 'Client'
        setFullName(name)
        setIsEmailVerified(!!user.isEmailVerified)
      } catch {
        setFullName('Client')
        setIsEmailVerified(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex md:hidden w-full px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      {/* Nombre + estado */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white">
        <span>{fullName}</span>
        <span className="flex items-center gap-3 text-xs ml-2">
          <MailIcon className="w-4 h-4" />
          <span className={isEmailVerified ? 'text-green-600' : 'text-red-500'}>
            {isEmailVerified ? 'Verified' : 'Pendiente'}
          </span>
        </span>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 relative">
        {/* Dropdown de notificaciones */}
        <NotificationsDropdown />

        {/* Toggle tema */}
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
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Profile menu"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-50">
              {/* ——— General ——— */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                General
              </div>
              <button
                onClick={() => { router.push('/client'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HomeIcon className="w-4 h-4 mr-2" /> Home
              </button>
              <button
                onClick={() => { router.push('/client/support'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <TicketIcon className="w-4 h-4 mr-2" /> Tickets
              </button>
              <button
                onClick={() => { router.push('/client/projects'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FolderIcon className="w-4 h-4 mr-2" /> Projects
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* ——— Finances ——— */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Finances
              </div>
              <button
                onClick={() => { router.push('/client/files'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileTextIcon className="w-4 h-4 mr-2" /> Documents
              </button>
              <button
                onClick={() => { router.push('/client/invoices'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileIcon className="w-4 h-4 mr-2" /> Invoices
              </button>
              <button
                onClick={() => { router.push('/client/payments'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CreditCardIcon className="w-4 h-4 mr-2" /> Payments
              </button>
              <button
                onClick={() => { router.push('/client/quotes'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileTextIcon className="w-4 h-4 mr-2" /> Quotes
              </button>
              <button
                onClick={() => { router.push('/client/subscription'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <DollarSignIcon className="w-4 h-4 mr-2" /> Subscription
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* ——— Account ——— */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Account
              </div>
              <button
                onClick={() => { router.push('/client/profile'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="w-4 h-4 mr-2" /> Profile
              </button>
              <button
                onClick={() => { router.push('/client/verify'); setDropdownOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LockIcon className="w-4 h-4 mr-2" /> Verify Email
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Sign Out */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 w-ful­l px-4 py-2 text-sm"
              >
                <LogOutIcon className="w-4 h-4 mr-2" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
