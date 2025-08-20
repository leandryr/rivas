'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  FolderIcon,
  FileTextIcon,
  LockIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import 'flowbite'

const links = [
  { href: '/client', icon: HomeIcon, label: 'Inicio' },
  { href: '/client/projects', icon: FolderIcon, label: 'Proyectos' },
  { href: '/client/files', icon: FileTextIcon, label: 'Documentos' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Error al obtener usuario')
        const json = await res.json()
        const user = json.user as {
          isEmailVerified?: boolean
        }
        setIsEmailVerified(!!user?.isEmailVerified)
      } catch {
        setIsEmailVerified(false)
      }
    }

    fetchUser()
  }, [])

  const handleRestrictedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  const goToVerification = () => {
    setShowToast(false)
    router.push('/client/verify')
  }

  return (
    <>
      {showToast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className="flex items-start w-full max-w-xs p-4 text-gray-700 bg-white rounded-lg shadow dark:text-gray-300 dark:bg-gray-800"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
              <LockIcon className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm font-normal flex-1">
              <p className="mb-1">Debes verificar tu correo para acceder a esta sección.</p>
              <button
                onClick={goToVerification}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Verificar ahora
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14 md:hidden">
        {links.map(({ href, icon: Icon, label }) => {
          const isHome = href === '/client'
          const accessible = isHome || isEmailVerified

          return accessible ? (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={clsx(
                'flex flex-col items-center justify-center text-xs',
                pathname === href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-500'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </Link>
          ) : (
            <button
              key={href}
              onClick={handleRestrictedClick}
              aria-label={`Bloqueado: ${label}`}
              className="flex flex-col items-center justify-center text-xs text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <LockIcon className="w-5 h-5 mb-0.5" />
              {label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
