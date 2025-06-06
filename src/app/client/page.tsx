'use client'

import { useSession } from 'next-auth/react'

export default function ClientPage() {
  const { data: session } = useSession()

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 transition-colors duration-300">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Welcome, {session?.user?.name || 'Client'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          This is your client dashboard. Here you can track your project status, contact support, and more.
        </p>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">📦 Project Status</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stay updated on all phases of your ongoing projects in real time.
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">💬 Support</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contact our support team directly through chat or ticket.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
