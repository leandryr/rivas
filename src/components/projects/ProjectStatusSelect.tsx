'use client';

import { useState } from 'react';
import { updateProjectStatusAction } from '@/actions/projectAdminActions';

interface Props {
  projectId: string;
  currentStatus: 'Pendiente' | 'En Proceso' | 'Completado';
}

export default function ProjectStatusSelect({ projectId, currentStatus }: Props) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setError(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('status', newStatus);

      await updateProjectStatusAction(formData);
      // Si no arroja error, Next revalidará la página automáticamente.
      setStatus(newStatus);
    } catch (err: any) {
      console.error('Error al actualizar estado de proyecto:', err);
      setError('No se pudo actualizar.');
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: '0.25rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.875rem',
          backgroundColor: '#ffffff',
          color: '#374151',
        }}
      >
        <option value="Pendiente">Pendiente</option>
        <option value="En Proceso">En Proceso</option>
        <option value="Completado">Completado</option>
      </select>

      {saving && (
        <span
          style={{
            position: 'absolute',
            right: '-1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          ...
        </span>
      )}

      {error && (
        <p
          style={{
            margin: 0,
            marginTop: '0.25rem',
            color: '#dc2626',
            fontSize: '0.75rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
