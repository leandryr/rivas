import Link from 'next/link';
import styles from './page.module.css';

// Importa la nueva función getProjectById desde tu archivo de acciones
import { getProjectById } from '@/actions/project/listProjects';

interface Props {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;      // ← así se soluciona la advertencia
  const project = await getProjectById(id);

  if (!project) {
    return <div className={styles.notFound}>Proyecto no encontrado.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{project.title}</h1>
        <Link href="/client/projects" className={styles.backLink}>
          ← Volver a Mis Proyectos
        </Link>
      </header>

      <section className={styles.section}>
        <h2>Servicio</h2>
        <p>
          <strong>Nombre:</strong> {project.service.name}
        </p>
        <p>
          <strong>Descripción:</strong> {project.service.description}
        </p>
      </section>

      <section className={styles.section}>
        <h2>Subcategoría y Modalidad</h2>
        <p>
          <strong>Subcategoría:</strong> {project.subCategory}
        </p>
        <p>
          <strong>Modalidad:</strong> {project.modality}
        </p>
      </section>

      <section className={styles.section}>
        <h2>Detalles del Proyecto</h2>
        <p>
          <strong>Descripción detallada:</strong> {project.description}
        </p>
        <p>
          <strong>Urgencia:</strong> {project.urgency || 'No especificada'}
        </p>
        {project.deadline && (
          <p>
            <strong>Fecha límite:</strong>{' '}
            {new Date(project.deadline).toLocaleDateString()}
          </p>
        )}
        {project.references && project.references.length > 0 && (
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

      <section className={styles.section}>
        <h2>Información adicional</h2>
        <p>
          <strong>Estado:</strong> {project.status}
        </p>
        <p>
          <strong>Creado en:</strong>{' '}
          {new Date(project.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Actualizado en:</strong>{' '}
          {new Date(project.updatedAt).toLocaleString()}
        </p>
      </section>

      {/* Si quisieras mostrar al propietario: 
      <section>
        <h2>Propietario</h2>
        <p><strong>Usuario ID:</strong> {project.ownerId}</p>
      </section>
      */}
    </div>
  );
}