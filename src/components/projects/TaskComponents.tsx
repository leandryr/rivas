// src/components/projects/TaskComponents.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from './TaskComponents.module.css';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
}

interface TaskButtonProps {
  projectId: string;
}

/**
 * TaskButton: al hacer clic emite un evento global 'toggleProjectTasks'
 * con el projectId. Quien escuche ese evento podrá mostrar u ocultar la lista de tareas.
 */
export function TaskButton({ projectId }: TaskButtonProps) {
  const handleToggle = () => {
    const ev = new CustomEvent('toggleProjectTasks', { detail: projectId });
    window.dispatchEvent(ev);
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleToggle}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
    >
      Ver Tareas
    </button>
  );
}

interface TaskListProps {
  projectId: string;
}

/**
 * TaskList: escucha el evento 'toggleProjectTasks'. Si el projectId coincide,
 * hace fetch a /api/tasks?projectId=<projectId> y muestra/oculta la lista de tareas,
 * incluyendo las fechas formateadas.
 */
export function TaskList({ projectId }: TaskListProps) {
  const [visible, setVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = async (e: Event) => {
      const incomingProjectId = (e as CustomEvent<string>).detail;
      if (incomingProjectId === projectId) {
        if (!visible) {
          setVisible(true);
          setLoading(true);
          setError(null);

          try {
            const res = await fetch(`/api/tasks?projectId=${projectId}`);
            if (!res.ok) {
              const textoError = await res.text();
              console.error(`Fetch /api/tasks falló con estatus ${res.status}: ${textoError}`);
              throw new Error(`HTTP ${res.status}`);
            }
            const data: Task[] = await res.json();
            setTasks(data);
          } catch (err) {
            console.error('[TaskList] Error cargando tareas:', err);
            setError('No se pudieron cargar las tareas. Revisa la consola.');
          } finally {
            setLoading(false);
          }
        } else {
          setVisible(false);
          setTasks([]);
          setError(null);
        }
      }
    };

    window.addEventListener('toggleProjectTasks', listener);
    return () => {
      window.removeEventListener('toggleProjectTasks', listener);
    };
  }, [projectId, visible]);

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Tareas asignadas:</h3>

      {loading && <p className={styles.loading}>Cargando tareas…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p className={styles.empty}>No hay tareas para este proyecto.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul className={styles.list}>
          {tasks.map((task) => {
            // Convertimos las cadenas ISO a objetos Date
            const fechaCreacion = new Date(task.createdAt);
            const fechaActualizacion = new Date(task.updatedAt);

            // Formateamos a locale 'es-ES' con fecha y hora
            const creacionFormateada = fechaCreacion.toLocaleString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const actualizacionFormateada = fechaActualizacion.toLocaleString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <li key={task._id} className={styles.listItem}>
                <div className={styles.itemHeader}>
                  <strong>{task.title}</strong> — <em>{task.status}</em>
                </div>
                {task.description && (
                  <p style={{ marginBottom: '0.5rem' }}>{task.description}</p>
                )}
                <div className={styles.dates}>
                  <p>Creada: {creacionFormateada}</p>
                  <p>Última actualización: {actualizacionFormateada}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
