'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createServiceAction } from '@/actions/serviceAdminActions';
import styles from './page.module.css';

interface FormState {
  name: string;
  description: string;
  modalities: string;    // Cadena separada por comas, ej: "Por proyecto, Por hora"
  subCategories: string; // Cadena separada por comas, ej: "Web, Diseño, Otros"
}

export default function NewServicePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    modalities: '',
    subCategories: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validación básica
    if (!form.name.trim() || !form.description.trim()) {
      setError('Nombre y Descripción son obligatorios.');
      return;
    }
    if (!form.modalities.trim() || !form.subCategories.trim()) {
      setError('Debes indicar al menos una modalidad y una subcategoría.');
      return;
    }

    try {
      // Preparar arrays a partir de cadenas separadas por comas
      const modalitiesArr = form.modalities.split(',').map((s) => s.trim()).filter((s) => s);
      const subCatsArr = form.subCategories.split(',').map((s) => s.trim()).filter((s) => s);

      await createServiceAction({
        name: form.name.trim(),
        description: form.description.trim(),
        modalities: modalitiesArr,
        subCategories: subCatsArr,
      });

      setSuccess('✅ Servicio creado correctamente.');
      // Redirigir tras 1 segundo a la lista
      setTimeout(() => {
        router.push('/admin/services');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al crear servicio.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Crear Nuevo Servicio</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Nombre*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>Descripción*</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            required
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="modalities" className={styles.label}>
            Modalidades* (separadas por coma)
          </label>
          <input
            type="text"
            id="modalities"
            name="modalities"
            value={form.modalities}
            onChange={handleChange}
            placeholder="Por proyecto, Por hora"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="subCategories" className={styles.label}>
            Subcategorías* (separadas por coma)
          </label>
          <input
            type="text"
            id="subCategories"
            name="subCategories"
            value={form.subCategories}
            onChange={handleChange}
            placeholder="Programación Web, Diseño Web, Otros"
            required
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.submitBtn}>Crear Servicio</button>
      </form>
    </div>
  );
}
