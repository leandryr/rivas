import Link from 'next/link';
import connectDB from '@/lib/db';
import Service, { IService } from '@/models/Service.model';
import styles from './page.module.css';
import { Types } from 'mongoose';

interface ServiceDTO {
  _id: string;
  name: string;
  description: string;
}

export const revalidate = 0; // Forzar SSR siempre

export default async function AdminServicesPage() {
  // 1) Conexión a la BD
  await connectDB();

  // 2) Obtener todos los servicios tipando correctamente lean()
  //    Puedes usar cualquiera de las dos opciones A o B descritas arriba:

  // Opción A: definir un tipo intermedio con _id: Types.ObjectId
  interface LeanedServiceDoc {
    _id: Types.ObjectId;
    name: string;
    description: string;
  }
  const docs: LeanedServiceDoc[] = await Service.find()
    .sort({ createdAt: -1 })
    .lean<LeanedServiceDoc[]>();

  // Si prefieres Opción B, reemplaza las dos líneas anteriores por:
  // const docs: IService[] = await Service.find()
  //   .sort({ createdAt: -1 })
  //   .lean<IService[]>();

  // 3) Mapear cada documento a ServiceDTO
  const services: ServiceDTO[] = docs.map((doc) => ({
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Administración de Servicios</h1>
        <Link href="/admin/services/new" className={styles.newButton}>
          + Nuevo Servicio
        </Link>
      </header>

      {services.length === 0 ? (
        <p className={styles.empty}>No hay servicios registrados aún.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc._id}>
                <td>{svc.name}</td>
                <td>{svc.description}</td>
                <td className={styles.actionsCell}>
                  <Link href={`/admin/services/${svc._id}/edit`} className={styles.editButton}>
                    Editar
                  </Link>
                  <Link
                    href={`/admin/services/${svc._id}/delete`}
                    className={styles.deleteButton}
                  >
                    Eliminar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}