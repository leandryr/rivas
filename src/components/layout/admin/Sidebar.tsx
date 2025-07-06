// src/components/DesktopSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home,
  Globe,
  Layers,
  FileText,
  Ticket,
  FolderKanban,
  ListChecks,
  Video,
  Users,
  Receipt,
  Wallet,
  LogOutIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string>('/user.ico')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  // Definimos los grupos de navegación
  const navGroups = [
    {
      title: 'Main',
      icon: Home,
      items: [
        { label: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
        { label: 'Landing', href: '/admin/landing-settings', icon: <Globe size={18} /> },
        { label: 'Services', href: '/admin/services', icon: <Layers size={18} /> },
        { label: 'Posts', href: '/admin/posts', icon: <FileText size={18} /> },
      ],
    },
    {
      title: 'Management',
      icon: Layers,
      items: [
        { label: 'Tickets', href: '/admin/tickets', icon: <Ticket size={18} /> },
        { label: 'Projects', href: '/admin/projects', icon: <FolderKanban size={18} /> },
        { label: 'Tasks', href: '/admin/tasks', icon: <ListChecks size={18} /> },
        { label: 'Files', href: '/admin/files', icon: <FileText size={18} /> },
        { label: 'Meetings', href: '/admin/meetings', icon: <Video size={18} /> },
      ],
    },
    {
      title: 'Users',
      icon: Users,
      items: [
        { label: 'All Users', href: '/admin/users', icon: <Users size={18} /> },
        { label: 'Verified Users', href: '/admin/verify', icon: <Layers size={18} /> },
      ],
    },
    {
      title: 'Finance',
      icon: Wallet,
      items: [
        { label: 'Summary', href: '/admin/finance', icon: <Receipt size={18} /> },
        { label: 'Payments', href: '/admin/payments', icon: <Receipt size={18} /> },
        { label: 'Pricing', href: '/admin/pricing', icon: <Wallet size={18} /> },
        { label: 'Quotes', href: '/admin/quotes', icon: <Receipt size={18} /> },
        { label: 'Invoices', href: '/admin/invoices', icon: <Receipt size={18} /> },
      ],
    },
  ]

  // Carga avatar
  useEffect(() => {
    if (!session?.user) return
    ;(async () => {
      try {
        const res = await fetch('/api/users/me')
        const { user } = await res.json()
        setAvatarUrl(user.avatar || '/user.ico')
      } catch {
        setAvatarUrl('/user.ico')
      }
    })()
  }, [session])

  const toggleGroup = (title: string) =>
    setOpenGroup(openGroup === title ? null : title)

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      {/* Perfil */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
        <h2 className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
          {session?.user?.name ?? 'Admin'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {session?.user?.email}
        </p>
        <button
          onClick={() => signOut()}
          className="mt-3 flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
        >
          <LogOutIcon className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span className="flex items-center gap-2">
                <group.icon className="w-5 h-5" /> {group.title}
              </span>
              {openGroup === group.title ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            {openGroup === group.title && (
              <ul className="mt-1 pl-6 space-y-1">
                {group.items.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span
                        className={`flex items-center gap-2 px-2 py-1 text-sm rounded
                          ${pathname === link.href
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                        {link.icon}
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
