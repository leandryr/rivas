// src/app/(dashboard)/admin/projects/page.tsx
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project.model';
import Link from 'next/link';
import ProjectStatusSelect from '@/components/projects/ProjectStatusSelect';
import styles from './page.module.css';

type ProjectWithOwner = {
  _id: string;
  title: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  createdAt: string;
  updatedAt: string;
  owner: {
    email: string;
    name?: string;
  };
};

export const revalidate = 0; // Siempre SSR para mostrar cambios inmediatos

export default async function AdminProjectsPage() {
  // 1) Conectar a la base de datos
  await connectDB();

  // 2) Traer todos los proyectos junto con datos del owner (cliente)
  const docs = await ProjectModel.find()
    .populate({ path: 'ownerId', select: 'email name' })
    .sort({ createdAt: -1 })
    .lean();

  // 3) Mapear a la forma iterada por React
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
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Proyectos</h1>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Cliente</th>
            <th className={styles.th}>Título</th>
            <th className={styles.th}>Estado</th>
            <th className={styles.th}>Creado</th>
            <th className={styles.th}>Actualizado</th>
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj._id} className={styles.rowHover}>
              <td className={styles.td}>{proj.owner.email}</td>
              <td className={styles.td}>{proj.title}</td>
              <td className={styles.td}>
                <ProjectStatusSelect
                  projectId={proj._id}
                  currentStatus={proj.status}
                />
              </td>
              <td className={styles.td}>
                {new Date(proj.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className={styles.td}>
                {new Date(proj.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className={styles.td}>
                <Link href={`/admin/projects/${proj._id}`}>
                  <button className={styles.button}>Ver Detalle</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}