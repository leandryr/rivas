'use client'

import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, GlobeIcon, BellIcon, UserIcon, LogOutIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function TopbarDesktop() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="hidden md:flex w-full px-6 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      <div className="text-xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </div>

      <div className="flex items-center gap-4">
        <button className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
          <GlobeIcon className="w-4 h-4 mr-1" />
          EN
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          <BellIcon className="w-5 h-5" />
        </button>

        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
              <a href="/client/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">My Profile</a>
              <a href="/client/verify" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Verifications</a>
              <a href="/client/payments" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Payments</a>
              <a href="/client/subscription" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Subscription</a>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
