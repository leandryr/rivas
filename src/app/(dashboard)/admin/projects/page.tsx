// src/app/(dashboard)/admin/projects/page.tsx
import connectDB from '@/lib/db'
import ProjectModel from '@/models/Project.model'
import Link from 'next/link'
import ProjectStatusSelect from '@/components/projects/ProjectStatusSelect'

type ProjectWithOwner = {
  _id: string
  title: string
  status: 'Pendiente' | 'En Proceso' | 'Completado'
  createdAt: string
  updatedAt: string
  owner: {
    email: string
    name?: string
  }
}

export const revalidate = 0 // Siempre SSR para ver cambios inmediatamente

export default async function AdminProjectsPage() {
  await connectDB()

  const docs = await ProjectModel.find()
    .populate({ path: 'ownerId', select: 'email name' })
    .sort({ createdAt: -1 })
    .lean()

  const projects: ProjectWithOwner[] = docs.map((doc: any) => ({
    _id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    owner: {
      email: doc.ownerId?.email || '—',
      name: doc.ownerId?.name || undefined,
    },
  }))

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Lista de Proyectos</h1>

      {/* --- Desktop: Tabla --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Cliente
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Título
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Estado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Creado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Actualizado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {projects.map((proj) => (
              <tr key={proj._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-800">{proj.owner.email}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{proj.title}</td>
                <td className="px-4 py-2 text-sm">
                  <ProjectStatusSelect
                    projectId={proj._id}
                    currentStatus={proj.status}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(proj.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(proj.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-2 text-sm text-center">
                  <Link href={`/admin/projects/${proj._id}`}>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      Ver Detalle
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile: Grid de tarjetas --- */}
      <div className="md:hidden grid gap-4">
        {projects.map((proj) => (
          <div
            key={proj._id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-800">
                {proj.owner.email}
              </span>
              <span
                className={`text-sm font-semibold ${
                  proj.status === 'Completado'
                    ? 'text-green-600'
                    : proj.status === 'En Proceso'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {proj.status}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {proj.title}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Creado:{' '}
              {new Date(proj.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <div className="flex justify-between items-center">
              <ProjectStatusSelect
                projectId={proj._id}
                currentStatus={proj.status}
              />
              <Link href={`/admin/projects/${proj._id}`}>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs">
                  Ver
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
