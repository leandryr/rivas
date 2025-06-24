'use client';

import { useRouter } from 'next/navigation';
import styles from './DeleteProjectForm.module.css';

interface DeleteProjectFormProps {
  projectId: string;
}

export default function DeleteProjectForm({ projectId }: DeleteProjectFormProps) {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Abrir confirm manualmente
    if (!confirm('¿Estás seguro que deseas eliminar este proyecto?')) {
      return;
    }
    // Tras confirmar, hacemos fetch a nuestro endpoint de borrado
    const res = await fetch(`/api/admin/projects/${projectId}/delete`, {
      method: 'POST',
    });
    if (res.ok) {
      // Si todo salió bien, revalidamos /admin/projects
      router.refresh(); // Forzamos re-render en Server Component padre
    } else {
      alert('Error al eliminar el proyecto');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'inline' }}>
      <button type="submit" className={styles.deleteButton}>
        Eliminar
      </button>
    </form>
  );
}
