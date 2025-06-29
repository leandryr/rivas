// src/components/ClientDashboard.tsx
'use client'

import { useSession } from 'next-auth/react'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Cliente'

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Bienvenido, {name}
      </h1>
      <p className="text-gray-600">
        Tu panel de control está en construcción. Próximamente agregaremos estadísticas reales y reportes interactivos. ¡Estamos trabajando en ello!
      </p>
      <div className="bg-white p-8 rounded-xl shadow-md">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-blue-600 animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3v18h18M3 12h18M12 3v18"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-800">
          Estadísticas próximamente
        </h2>
        <p className="text-gray-500">
          En breve podrás ver informes detallados de facturas, cotizaciones, proyectos y reuniones.
        </p>
      </div>
    </div>
  )
}
