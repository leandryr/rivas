'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ClientSidebar from '@/components/layout/ClientSidebar'
import MobileNav from '@/components/layout/MobileNav'
import TopbarDesktop from '@/components/layout/Topbar'
import TopbarMobile from '@/components/layout/TopbarMobile'
import { Toaster } from 'react-hot-toast'
import Spinner from '@/components/ui/Spinner'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role
      if (role !== 'client') {
        router.replace(role === 'admin' ? '/admin' : '/login')
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
        <div className="flex flex-col md:flex-row">
          <ClientSidebar />
          <div className="flex flex-col flex-1 pb-14 md:pb-0">
            <div className="md:hidden">
              <TopbarMobile />
            </div>
            <div className="hidden md:block">
              <TopbarDesktop />
            </div>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
      <Toaster position="top-right" />
    </>
  )
}
