// src/app/(dashboard)/admin/tasks/CreateTaskForm.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createTaskAction } from '@/actions/taskAdminActions';
import styles from './CreateTaskForm.module.css';

interface UserOption {
  _id: string;
  name: string;
}

interface ProjectOption {
  _id: string;
  title: string;
}

interface CreateTaskFormProps {
  users: UserOption[];
}

export default function CreateTaskForm({ users }: CreateTaskFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setProjectId('');
      return;
    }
    fetch(`/api/projects?userId=${userId}`)
      .then((res) => res.json())
      .then((data: ProjectOption[]) => {
        setProjects(data);
        if (data.length === 1) {
          setProjectId(data[0]._id);
        } else {
          setProjectId('');
        }
      })
      .catch((err) => {
        console.error('Error cargando proyectos:', err);
        setProjects([]);
        setProjectId('');
      });
  }, [userId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', userId);
    formData.append('projectId', projectId);

    try {
      await createTaskAction(formData);
      setTitle('');
      setDescription('');
      setUserId('');
      setProjects([]);
      setProjectId('');
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error creando la tarea. Revisa la consola para más detalles.');
    }
  }

  return (
    <div>
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={styles.buttonPrimary}
        >
          Crear nueva tarea
        </button>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.heading}>Crear nueva tarea</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Título
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="user" className={styles.label}>
              Usuario
            </label>
            <select
              id="user"
              name="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="project" className={styles.label}>
              Proyecto
            </label>
            <select
              id="project"
              name="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={!userId || projects.length === 0}
              className={`${styles.select} ${
                !userId || projects.length === 0 ? styles.disabled : ''
              }`}
            >
              <option value="">-- Selecciona un proyecto --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.buttonPrimary}>
            Guardar tarea
          </button>
        </form>
      )}
    </div>
  );
}
