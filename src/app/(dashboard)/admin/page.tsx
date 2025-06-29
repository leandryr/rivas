// src/components/AdminDashboard.tsx
'use client'

import { useSession } from 'next-auth/react'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Administrador'

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Bienvenido, {name}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Tu panel de administración está en construcción. Próximamente añadiremos herramientas para gestionar servicios, usuarios, proyectos y más. ¡Estamos trabajando en ello!
      </p>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-blue-600 animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Panel en desarrollo
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          En breve dispondrás de estadísticas, gestión de usuarios, configuración de servicios y más funcionalidades.
        </p>
      </div>
    </div>
  )
}
