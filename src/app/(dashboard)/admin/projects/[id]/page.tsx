// src/app/admin/projects/[id]/page.tsx
import Link from 'next/link'
import { getProjectForAdminById } from '@/actions/projectAdminActions'
import styles from './page.module.css'

interface Props {
  params: { id: string }
}

export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectForAdminById(id)

  if (!project) {
    return (
      <div className={styles.notFound}>
        Proyecto no encontrado.
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Detalle de Proyecto</h1>
        <Link href="/admin/projects" className={styles.backLink}>
          ← Volver a Proyectos
        </Link>
      </header>

      {/* --- Sección 1: Información del Cliente --- */}
      <section className={styles.section}>
        <h2>Información del Cliente</h2>
        <p>
          <strong>Nombre:</strong> {project.ownerName}
        </p>
        <p>
          <strong>Email:</strong> {project.ownerEmail}
        </p>
      </section>

      {/* --- Sección 2: Subcategoría y Modalidad --- */}
      <section className={styles.section}>
        <h2>Subcategoría y Modalidad</h2>
        <p>
          <strong>Subcategoría:</strong> {project.subCategory}
        </p>
        <p>
          <strong>Modalidad:</strong> {project.modality}
        </p>
      </section>

      {/* --- Sección 3: Detalles del Proyecto --- */}
      <section className={styles.section}>
        <h2>Detalles del Proyecto</h2>
        <p>
          <strong>Título:</strong> {project.title}
        </p>
        <p>
          <strong>Descripción detallada:</strong> {project.description}
        </p>
        <p>
          <strong>Urgencia:</strong> {project.urgency || 'No especificada'}
        </p>
        {project.deadline && (
          <p>
            <strong>Fecha límite:</strong> {new Date(project.deadline).toLocaleDateString()}
          </p>
        )}
        {project.references.length > 0 && (
          <div>
            <strong>Referencias:</strong>
            <ul>
              {project.references.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* --- Sección 4: Estado y Fechas --- */}
      <section className={styles.section}>
        <h2>Estado y Fechas</h2>
        <p>
          <strong>Estado:</strong> {project.status}
        </p>
        <p>
          <strong>Creado en:</strong> {new Date(project.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Actualizado en:</strong> {new Date(project.updatedAt).toLocaleString()}
        </p>
      </section>
    </div>
  )
}
