'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import ClientSidebar from '@/components/layout/client/ClientSidebar'
import MobileNav from '@/components/layout/client/MobileNav'
import TopbarDesktop from '@/components/layout/client/Topbar'
import TopbarMobile from '@/components/layout/client/TopbarMobile'
import { Toaster } from 'react-hot-toast'
import Spinner from '@/components/ui/Spinner'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role
      const needsOnboarding = (session?.user as any)?.needsOnboarding

      if (role !== 'client') {
        router.replace(role === 'admin' ? '/admin' : '/login')
      } else if (needsOnboarding) {
        router.replace('/client/onboarding')
      }
    } else if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner label="Loading session..." />
      </div>
    )
  }

  if (!session || session.user?.role !== 'client') {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Sidebar (desktop only) */}
          <ClientSidebar />

          {/* Main content */}
          <div className="flex flex-col flex-1">
            {/* Topbars */}
            <div className="md:hidden">
              <TopbarMobile />
            </div>
            <div className="hidden md:block">
              <TopbarDesktop />
            </div>

            {/* Page content */}
            <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>

      {/* Global toast notifications */}
      <Toaster position="top-right" />
    </>
  )
}
