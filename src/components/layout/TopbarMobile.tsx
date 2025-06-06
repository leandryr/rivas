'use client'

import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  UserIcon,
  MailIcon,
  CreditCardIcon,
  CheckIcon,
  LogOutIcon,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function TopbarMobile() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [hasValidPayment, setHasValidPayment] = useState(false)
  const [fullName, setFullName] = useState('Client')

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Failed to fetch user')
        const json = await res.json()
        const user = json.user as {
          name?: string
          lastname?: string
          isEmailVerified?: boolean
          hasValidPaymentMethod?: boolean
        }

        const name =
          user?.lastname && user?.name
            ? `${user.name} ${user.lastname}`
            : user?.name || 'Client'

        setFullName(name)
        setIsEmailVerified(!!user?.isEmailVerified)
        setHasValidPayment(!!user?.hasValidPaymentMethod)
      } catch {
        setFullName('Client')
        setIsEmailVerified(false)
        setHasValidPayment(false)
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
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white">
        <span>{fullName}</span>
        <span className="flex items-center gap-2 text-xs ml-2">
          <span className="flex items-center gap-1">
            <MailIcon className="w-4 h-4" />
            {isEmailVerified ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <span className="text-red-500 text-xs font-medium">Pendiente</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <CreditCardIcon className="w-4 h-4" />
            {hasValidPayment ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <span className="text-red-500 text-xs font-medium">Pendiente</span>
            )}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 relative">
        <button
          className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
        </button>

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

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Profile menu"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-50">
              <button
                onClick={() => {
                  router.push('/client/profile')
                  setDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  router.push('/client/verify')
                  setDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Verifications
              </button>
              <button
                onClick={() => {
                  router.push('/client/payments')
                  setDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Payments
              </button>
              <button
                onClick={() => {
                  router.push('/client/subscription')
                  setDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Subscription
              </button>
              <hr className="border-gray-200 dark:border-gray-600" />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-4 py-2 text-sm"
              >
                <LogOutIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
