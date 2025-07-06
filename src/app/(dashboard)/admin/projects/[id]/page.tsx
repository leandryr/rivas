// src/app/admin/projects/[id]/page.tsx
import Link from 'next/link'
import { getProjectForAdminById } from '@/actions/projectAdminActions'

interface Props {
  params: { id: string }
}

export const revalidate = 0

export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = params
  const project = await getProjectForAdminById(id)

  if (!project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        Proyecto no encontrado.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold">Detalle de Proyecto</h1>
        <Link
          href="/admin/projects"
          className="mt-3 md:mt-0 text-blue-600 hover:underline"
        >
          ← Volver a Proyectos
        </Link>
      </div>

      {/* Grid principal: en desktop dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección 1: Información del Cliente */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-3">Información del Cliente</h2>
          <p className="mb-1">
            <span className="font-semibold">Nombre:</span> {project.ownerName}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {project.ownerEmail}
          </p>
        </section>

        {/* Sección 2: Subcategoría y Modalidad */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-3">Subcategoría y Modalidad</h2>
          <p className="mb-1">
            <span className="font-semibold">Subcategoría:</span> {project.subCategory}
          </p>
          <p>
            <span className="font-semibold">Modalidad:</span> {project.modality}
          </p>
        </section>

        {/* Sección 3: Detalles del Proyecto */}
        <section className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-lg font-medium mb-3">Detalles del Proyecto</h2>
          <p className="mb-1">
            <span className="font-semibold">Título:</span> {project.title}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Descripción detallada:</span>{' '}
            {project.description}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Urgencia:</span>{' '}
            {project.urgency || 'No especificada'}
          </p>
          {project.deadline && (
            <p className="mb-1">
              <span className="font-semibold">Fecha límite:</span>{' '}
              {new Date(project.deadline).toLocaleDateString()}
            </p>
          )}
          {project.references.length > 0 && (
            <div>
              <span className="font-semibold">Referencias:</span>
              <ul className="list-disc list-inside mt-1">
                {project.references.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Sección 4: Estado y Fechas */}
        <section className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-lg font-medium mb-3">Estado y Fechas</h2>
          <p className="mb-1">
            <span className="font-semibold">Estado:</span> {project.status}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Creado en:</span>{' '}
            {new Date(project.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Actualizado en:</span>{' '}
            {new Date(project.updatedAt).toLocaleString()}
          </p>
        </section>
      </div>
    </div>
  )
}
