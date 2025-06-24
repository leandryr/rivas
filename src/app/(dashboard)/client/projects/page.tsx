// src/app/(dashboard)/client/projects/page.tsx
import { Fragment } from 'react';
import Link from 'next/link';
import styles from './Projects.module.css';
import { TaskButton, TaskList } from '@/components/projects/TaskComponents';

// NextAuth: obtenemos la sesión
import { getServerSession } from 'next-auth';
// Importamos authOptions desde src/auth.ts
import { authOptions } from '@/lib/auth/auth';

import connectDB from '@/lib/db';
import ProjectModel, { IProject } from '@/models/Project.model';
import User, { IUser } from '@/models/User';

import { Types } from 'mongoose';

interface ProjectClientDTO {
  _id: string;
  title: string;
  modality: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  createdAt: string;
  updatedAt: string;
  serviceName: string;
  serviceDescription: string;
  subCategory: string;
  urgency?: string;
  deadline?: string;
}

export const revalidate = 0; // Forzar SSR cada vez

export default async function ClientProjectsPage() {
  // 1) Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return (
      <div className={styles.container}>
        <p>Debes iniciar sesión para ver tus proyectos.</p>
      </div>
    );
  }

  // 2) Conectar a MongoDB
  await connectDB();

  // 3) Buscar al usuario en base a su email. IMPORTANTE: usar lean<IUser>(), no lean<IUser[]>()
  const userDoc: IUser | null = await User.findOne({ email: session.user.email }).lean<IUser>();
  if (!userDoc) {
    return (
      <div className={styles.container}>
        <p>Usuario no encontrado.</p>
      </div>
    );
  }

  // 4) Definir un tipo que represente la forma de cada proyecto "leaned"
  type LeanedProjectDoc = {
    _id: Types.ObjectId;
    title: string;
    modality: string;
    status: 'Pendiente' | 'En Proceso' | 'Completado';
    createdAt: Date;
    updatedAt: Date;
    service: { name: string; description: string };
    subCategory: string;
    urgency?: 'Alta' | 'Media' | 'Baja';
    deadline?: Date;
  };

  // 5) Obtener solo los proyectos cuyo ownerId coincida con userDoc._id.
  const docs: LeanedProjectDoc[] = await ProjectModel.find({ ownerId: userDoc._id })
    .sort({ createdAt: -1 })
    .lean<LeanedProjectDoc[]>();

  // 6) Mapear a DTO (convertir _id a string, fechas a ISO)
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
    deadline: doc.deadline ? doc.deadline.toISOString() : undefined,
  }));

  return (
    <div className={styles.container}>
      {projects.length > 0 && (
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Proyectos</h1>
          <Link href="/client/projects/new" className={styles.addButton}>
            + Crear Proyecto
          </Link>
        </header>
      )}

      {projects.length === 0 ? (
        <p className={styles.empty}>
          No tienes proyectos todavía.&nbsp;
          <Link href="/client/projects/new" className={styles.link}>
            Crear uno
          </Link>
        </p>
      ) : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Título</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Modalidad</th>
              <th className={styles.th}>Creado</th>
              <th className={styles.th}>Actualizado</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <Fragment key={p._id}>
                {/* 1ª fila: datos del proyecto */}
                <tr className={styles.rowHover}>
                  <td className={styles.td}>{p.title}</td>
                  <td className={styles.td}>{p.status}</td>
                  <td className={styles.td}>{p.modality}</td>
                  <td className={styles.td}>
                    {new Date(p.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className={styles.td}>
                    {new Date(p.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <Link href={`/client/projects/${p._id}`} className={styles.detailsLink}>
                        Ver detalles →
                      </Link>
                      <TaskButton projectId={p._id} />
                    </div>
                  </td>
                </tr>

                {/* 2ª fila: lista de tareas (oculta/visible) */}
                <tr>
                  <td colSpan={6} className={styles.taskListWrapper}>
                    <TaskList projectId={p._id} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
