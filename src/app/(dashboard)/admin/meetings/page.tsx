// src/app/(dashboard)/admin/meetings/page.tsx
import connectDB from '@/lib/db';
import { getAllMeetingsForAdmin } from '@/actions/meetingAdminActions';
import MeetingStatusSelect from '@/components/meetings/MeetingStatusSelect';

type MeetingAdminDTO = {
  _id: string;
  user: { _id: string; name: string; email: string };
  project: { _id: string; title: string };
  date: string;
  reason?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  link: string;
  createdAt: string;
  updatedAt: string;
};

export const revalidate = 0; // SSR

export default async function AdminMeetingsPage() {
  await connectDB();
  const meetings: MeetingAdminDTO[] = await getAllMeetingsForAdmin();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Lista de Reuniones
      </h1>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left text-xs text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Email</th>
              <th className="p-3">Proyecto</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Motivo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Creada</th>
              <th className="p-3">Actualizada</th>
              <th className="p-3">Enlace</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr
                key={m._id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="p-3">{m.user.name || '–'}</td>
                <td className="p-3">{m.user.email}</td>
                <td className="p-3">{m.project.title}</td>
                <td className="p-3">
                  {new Date(m.date).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3">{m.reason || 'Sin motivo'}</td>
                <td className="p-3">
                  <MeetingStatusSelect
                    meetingId={m._id}
                    currentStatus={m.status}
                    currentLink={m.link}
                  />
                </td>
                <td className="p-3">
                  {new Date(m.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3">
                  {new Date(m.updatedAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3">
                  {m.status === 'Confirmada' && m.link ? (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Ver enlace
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {meetings.map((m) => (
          <div
            key={m._id}
            className="border rounded p-4 shadow-sm bg-white dark:bg-gray-900"
          >
            <p className="text-sm">
              <strong>Cliente:</strong> {m.user.name || '–'}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {m.user.email}
            </p>
            <p className="text-sm">
              <strong>Proyecto:</strong> {m.project.title}
            </p>
            <p className="text-sm">
              <strong>Fecha:</strong>{' '}
              {new Date(m.date).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-sm">
              <strong>Motivo:</strong> {m.reason || 'Sin motivo'}
            </p>
            <div className="text-sm">
              <strong>Estado:</strong>{' '}
              <MeetingStatusSelect
                meetingId={m._id}
                currentStatus={m.status}
                currentLink={m.link}
              />
            </div>
            <p className="text-sm">
              <strong>Creada:</strong>{' '}
              {new Date(m.createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-sm">
              <strong>Actualizada:</strong>{' '}
              {new Date(m.updatedAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-sm">
              <strong>Enlace:</strong>{' '}
              {m.status === 'Confirmada' && m.link ? (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ver enlace
                </a>
              ) : (
                '—'
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
