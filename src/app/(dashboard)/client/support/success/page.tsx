'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4">
        Gracias por contactarnos
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Hemos recibido tu incidencia y te responderemos a la brevedad.
      </p>
      <Link
        href="/client/support"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Ver mis tickets
      </Link>
    </div>
  )
}
