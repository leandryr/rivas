'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createMeetingAction } from '@/actions/meetingClientActions';

interface ProjectOption {
  _id: string;
  title: string;
}

interface MeetingFormProps {
  userId: string;
}

export default function MeetingForm({ userId }: MeetingFormProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/projects?userId=${userId}`)
      .then((res) => res.json())
      .then((data: ProjectOption[]) => {
        setProjects(data);
        if (data.length === 1) {
          setSelectedProject(data[0]._id);
        }
      })
      .catch((e) => {
        console.error('[MeetingForm] Error cargando proyectos:', e);
        setProjects([]);
        setSelectedProject('');
      });
  }, [userId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedProject || !selectedDate) {
      setError('Selecciona proyecto y fecha/hora');
      return;
    }

    const formData = new FormData();
    formData.append('projectId', selectedProject);
    formData.append('userId', userId);
    formData.append('date', selectedDate);
    formData.append('reason', reason);

    try {
      await createMeetingAction(formData);
      setSelectedProject('');
      setSelectedDate('');
      setReason('');
      window.location.reload();
    } catch (err: any) {
      console.error('[MeetingForm] Error creando reunión:', err);
      setError(err.message || 'Error al crear reunión');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Agendar nueva reunión</h2>

      {/* Proyecto */}
      <div className="space-y-1">
        <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Proyecto
        </label>
        <select
          id="project"
          name="projectId"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          required
          className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm p-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        >
          <option value="">-- Selecciona un proyecto --</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha y hora */}
      <div className="space-y-1">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Fecha y hora
        </label>
        <input
          id="date"
          type="datetime-local"
          name="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm p-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      {/* Motivo */}
      <div className="space-y-1">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Motivo (opcional)
        </label>
        <textarea
          id="reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm p-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Botón */}
      <button
        type="submit"
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition"
      >
        Agendar
      </button>
    </form>
  );
}
