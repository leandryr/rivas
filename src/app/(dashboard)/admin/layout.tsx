// src/app/(admin)/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth/auth'
import { redirect }         from 'next/navigation'
import AdminSidebar         from '@/components/layout/admin/Sidebar'
import AdminTopbar          from '@/components/layout/admin/Topbar'
import MobileTopbar         from '@/components/layout/admin/MobileTopbar'
import MobileAdminNav       from '@/components/layout/admin/MobileAdminNav'
import AdminToaster         from '@/components/layout/admin/AdminToaster'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1) Autenticación y autorización
  const session = await getServerSession(authOptions)
  if (!session) {
    return redirect('/login')
  }
  if (session.user?.role !== 'admin') {
    return redirect('/client')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar: oculta al imprimir */}
      <aside className="hidden md:flex print:hidden">
        <AdminSidebar />
      </aside>

      <div className="flex flex-col flex-1">
        {/* Mobile topbar: oculta al imprimir */}
        <div className="print:hidden">
          <MobileTopbar />
        </div>

        {/* Desktop topbar: oculta al imprimir */}
        <div className="print:hidden">
          <AdminTopbar />
        </div>

        {/* Toast notifications: oculta al imprimir */}
        <div className="print:hidden">
          <AdminToaster />
        </div>

        {/* Main content: aquí va el invoice-printable wrapper */}
        <main className="flex-1 p-6">
          {/* invoice-printable es el único contenedor que queda visible en el PDF */}
          <div className="invoice-printable">
            {children}
          </div>
        </main>

        {/* Mobile admin nav: oculta al imprimir */}
        <footer className="print:hidden">
          <MobileAdminNav />
        </footer>
      </div>
    </div>
  )
}
