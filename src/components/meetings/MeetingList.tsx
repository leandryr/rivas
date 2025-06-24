'use client';

import { useState, useEffect } from 'react';
import {
  updateMeetingAction,
  cancelMeetingAction,
} from '@/actions/meetingClientActions';

interface Meeting {
  _id: string;
  projectId: string;
  projectTitle?: string;
  userId: string;
  date: string;
  reason?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface MeetingListProps {
  userId: string;
}

export function MeetingList({ userId }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    fetch(`/api/meetings?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        const formatted: Meeting[] = data.map((m: any) => ({
          _id: m._id,
          projectId: m.projectId,
          projectTitle: m.project?.title || '—',
          userId: m.userId,
          date: m.date,
          reason: m.reason || '',
          status: m.status,
          link: m.link || '',
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }));
        setMeetings(formatted);
      })
      .catch((e) => {
        console.error('[MeetingList] Error:', e);
        setError('No se pudieron cargar las reuniones.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleCancel = async (meetingId: string) => {
    if (!confirm('¿Cancelar esta reunión?')) return;
    const formData = new FormData();
    formData.append('meetingId', meetingId);
    try {
      await cancelMeetingAction(formData);
      setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
    } catch (e) {
      console.error(e);
      alert('Error al cancelar');
    }
  };

  const startEdit = (m: Meeting) => {
    setEditId(m._id);
    setNewDate(m.date.slice(0, 16));
    setNewReason(m.reason || '');
  };

  const submitEdit = async (meetingId: string) => {
    const formData = new FormData();
    formData.append('meetingId', meetingId);
    formData.append('date', newDate);
    formData.append('reason', newReason);
    try {
      await updateMeetingAction(formData);
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId
            ? { ...m, date: new Date(newDate).toISOString(), reason: newReason }
            : m
        )
      );
      setEditId(null);
    } catch (e) {
      console.error(e);
      alert('Error al modificar');
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Cargando reuniones…</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (meetings.length === 0)
    return <p className="text-gray-500 text-sm">No tienes reuniones agendadas.</p>;

  return (
    <ul className="space-y-6">
      {meetings.map((m) => {
        const fecha = new Date(m.date);
        const fechaLocal = fecha.toLocaleDateString('es-ES');
        const horaLocal = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return (
          <li
            key={m._id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm"
          >
            {editId === m._id ? (
              <form onSubmit={(e) => { e.preventDefault(); submitEdit(m._id); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Fecha y hora</label>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Motivo (opcional)</label>
                  <textarea
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md">Guardar</button>
                  <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 dark:bg-gray-600 text-sm px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Fecha:</span> {fechaLocal}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Hora:</span> {horaLocal}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Proyecto:</span> {m.projectTitle}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Motivo:</span> {m.reason || 'Sin motivo'}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100"><span className="font-medium">Estado:</span> {m.status}</p>
                    {m.status === 'Confirmada' && m.link && (
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        <span className="font-medium">Enlace:</span>{' '}
                        <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {m.link}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    {m.status === 'Pendiente' && (
                      <button
                        onClick={() => startEdit(m)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-4 py-2 rounded-md"
                      >
                        Modificar
                      </button>
                    )}
                    {(m.status === 'Pendiente' || m.status === 'Confirmada') && (
                      <button
                        onClick={() => handleCancel(m._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
