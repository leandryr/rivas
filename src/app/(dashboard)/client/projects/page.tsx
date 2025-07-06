// src/app/(dashboard)/client/projects/page.tsx
import { Fragment } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import ProjectModel from '@/models/Project.model'
import User from '@/models/User'
import { Types } from 'mongoose'
import { TaskButton, TaskList } from '@/components/projects/TaskComponents'

interface ProjectClientDTO {
  _id: string
  title: string
  modality: string
  status: 'Pendiente' | 'En Proceso' | 'Completado'
  createdAt: string
  updatedAt: string
  serviceName: string
  serviceDescription: string
  subCategory: string
  urgency?: string
  deadline?: string
}

export const revalidate = 0

export default async function ClientProjectsPage() {
  // 1) Sesión
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Debes iniciar sesión para ver tus proyectos.</p>
      </div>
    )
  }

  // 2) Conectar DB
  await connectDB()

  // 3) Buscar usuario
  const userDoc = await User.findOne({ email: session.user.email }).lean()
  if (!userDoc) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Usuario no encontrado.</p>
      </div>
    )
  }

  // 4) Fetch proyectos del usuario
  type LeanedProjectDoc = {
    _id: Types.ObjectId
    title: string
    modality: string
    status: ProjectClientDTO['status']
    createdAt: Date
    updatedAt: Date
    service: { name: string; description: string }
    subCategory: string
    urgency?: string
    deadline?: Date
  }
  const docs = await ProjectModel.find({ ownerId: userDoc._id })
    .sort({ createdAt: -1 })
    .lean<LeanedProjectDoc[]>()

  const projects: ProjectClientDTO[] = docs.map((doc) => ({
    _id: doc._id.toString(),
    title: doc.title,
    modality: doc.modality,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    serviceName: doc.service.name,
    serviceDescription: doc.service.description,
    subCategory: doc.subCategory,
    urgency: doc.urgency,
    deadline: doc.deadline?.toISOString(),
  }))

  return (
    <div className="container mx-auto px-4 py-6">
      {projects.length > 0 && (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Mis Proyectos</h1>
          <Link
            href="/client/projects/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Crear Proyecto
          </Link>
        </header>
      )}

      {projects.length === 0 ? (
        <p className="text-center text-gray-600">
          No tienes proyectos todavía.&nbsp;
          <Link href="/client/projects/new" className="text-blue-600 hover:underline">
            Crear uno
          </Link>
        </p>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <div className="grid grid-cols-1 sm:hidden gap-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <h2 className="text-lg font-medium mb-2">{p.title}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Estado:</span> {p.status}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Modalidad:</span> {p.modality}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(p.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    href={`/client/projects/${p._id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Ver Detalle →
                  </Link>
                  <TaskButton projectId={p._id} />
                </div>
                <div className="mt-2">
                  <TaskList projectId={p._id} />
                </div>
              </div>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Título</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Modalidad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Creado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actualizado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {projects.map((p) => (
                  <Fragment key={p._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">{p.title}</td>
                      <td className="px-4 py-2 text-sm">{p.status}</td>
                      <td className="px-4 py-2 text-sm">{p.modality}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(p.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/client/projects/${p._id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            Ver Detalle
                          </Link>
                          <TaskButton projectId={p._id} />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-4 py-2">
                        <TaskList projectId={p._id} />
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
