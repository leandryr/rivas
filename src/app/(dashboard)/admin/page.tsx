'use client'

import { useSession } from 'next-auth/react'
import { FolderIcon, UsersIcon, ListChecksIcon } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Administrador'

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bienvenido, {name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Aquí tienes una vista rápida de tu panel de administración.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            120 Usuarios
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            registrados en la plataforma
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <FolderIcon className="h-8 w-8 text-green-600 mb-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            35 Proyectos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            activos actualmente
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <ListChecksIcon className="h-8 w-8 text-purple-600 mb-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            78 Tareas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            pendientes por completar
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            <UsersIcon className="h-6 w-6 mb-2 text-blue-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">
              Gestionar Usuarios
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ver, editar y administrar usuarios
            </p>
          </Link>

          <Link
            href="/admin/projects"
            className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            <FolderIcon className="h-6 w-6 mb-2 text-green-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">
              Ver Proyectos
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Seguimiento y gestión de proyectos
            </p>
          </Link>

          <Link
            href="/admin/tasks"
            className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            <ListChecksIcon className="h-6 w-6 mb-2 text-purple-600" />
            <h3 className="font-medium text-gray-800 dark:text-gray-100">
              Administrar Tareas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organiza y controla tus pendientes
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
