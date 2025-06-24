// src/app/(dashboard)/admin/tasks/page.tsx
import connectDB from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task.model';
// Importa el modelo de Project para registrar el esquema antes de usar populate.
// Ajusta la ruta según tu configuración de alias o usa relativa si es necesario.
import Project from '@/models/Project.model';
import CreateTaskForm from '@/components/admin/tasks/CreateTaskForm';
import { updateTaskStatusAction } from '@/actions/taskAdminActions';
import styles from './page.module.css';

type TaskWithRefs = {
  _id: string;
  title: string;
  description?: string;
  status: string;
  assignedTo: { _id: string; name: string };
  project:     { _id: string; title: string };
  createdAt: string;
};

export const revalidate = 0; // SSR siempre para mostrar cambios inmediatos

export default async function AdminTasksPage() {
  // 1) Conectar a la base de datos
  await connectDB();

  // 2) Cargar usuarios con rol "client" (solo _id y name)
  const usersRaw = await User.find({ role: 'client' }).select('name').lean();
  const users = usersRaw.map((u: any) => ({
    _id: String(u._id),
    name: String(u.name),
  }));

  // 3) Cargar todas las tareas, poblando assignedTo y projectId
  //    Importamos Project arriba para que Mongoose registre el esquema
  const tasksRaw = await Task.find()
    .populate({ path: 'assignedTo', select: 'name' })
    .populate({ path: 'projectId', select: 'title' })
    .sort({ createdAt: -1 })
    .lean();

  const tasks: TaskWithRefs[] = tasksRaw.map((t: any) => ({
    _id: String(t._id),
    title: t.title,
    description: t.description,
    status: t.status,
    assignedTo: {
      _id: String(t.assignedTo?._id || ''),
      name: String(t.assignedTo?.name || '–'),
    },
    project: {
      _id: String(t.projectId?._id || ''),
      title: String(t.projectId?.title || '–'),
    },
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className={styles.container}>
      {/* Sección: Formulario para crear nuevas tareas */}
      <div className={styles.formContainer}>
        <h2 className={styles.heading}>Crear nueva tarea</h2>
        <CreateTaskForm users={users} />
      </div>

      {/* Sección: Tabla listando todas las tareas */}
      <div className={styles.tableContainer}>
        <h2 className={styles.heading}>Listado de tareas</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Título</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>Proyecto</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Creada</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className={styles.trHover}>
                <td className={styles.td}>{task.title}</td>
                <td className={styles.td}>{task.assignedTo.name}</td>
                <td className={styles.td}>{task.project.title}</td>
                <td className={styles.td}>{task.status}</td>
                <td className={styles.td}>
                  {new Date(task.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className={styles.td}>
                  <form action={updateTaskStatusAction} className={styles.formFlex}>
                    <input type="hidden" name="taskId" value={task._id} />
                    <select
                      name="status"
                      defaultValue={task.status}
                      className={styles.select}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Completado">Completado</option>
                    </select>
                    <button type="submit" className={styles.buttonPrimary}>
                      Cambiar
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className={`${styles.td} ${styles.emptyMessage}`}>
                  No hay tareas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
