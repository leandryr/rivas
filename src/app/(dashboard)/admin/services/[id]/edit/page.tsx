'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import connectDB from '@/lib/db';
import Service, { IService } from '@/models/Service.model';
import { updateServiceAction } from '@/actions/serviceAdminActions';
import styles from './page.module.css';

interface FormState {
  name: string;
  description: string;
  modalities: string;    // Cadena separada por comas
  subCategories: string; // Cadena separada por comas
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

  const [initial, setInitial] = useState<IService | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    modalities: '',
    subCategories: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1) Obtener datos actuales del servicio (Cliente + Fetch a un endpoint interno)
  useEffect(() => {
    async function fetchService() {
      try {
        // Hacemos un fetch a una ruta interna que retorna ese servicio
        const res = await fetch(`/api/admin/services/${serviceId}`);
        if (!res.ok) throw new Error('Error al cargar servicio');
        const data: IService = await res.json();
        setInitial(data);
        // Prellenamos el formulario
        setForm({
          name: data.name,
          description: data.description,
          modalities: data.modalities.join(', '),
          subCategories: data.subCategories.join(', '),
        });
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchService();
  }, [serviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.description.trim()) {
      setError('Nombre y Descripción son obligatorios.');
      return;
    }
    if (!form.modalities.trim() || !form.subCategories.trim()) {
      setError('Debes indicar al menos una modalidad y una subcategoría.');
      return;
    }

    try {
      const modalitiesArr = form.modalities.split(',').map((s) => s.trim()).filter((s) => s);
      const subCatsArr = form.subCategories.split(',').map((s) => s.trim()).filter((s) => s);

      await updateServiceAction(serviceId, {
        name: form.name.trim(),
        description: form.description.trim(),
        modalities: modalitiesArr,
        subCategories: subCatsArr,
      });

      setSuccess('✅ Servicio actualizado correctamente.');
      setTimeout(() => {
        router.push('/admin/services');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar servicio.');
    }
  };

  if (!initial && !error) {
    return <p className={styles.loading}>Cargando datos...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Editar Servicio</h1>
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
            required
            className={styles.input}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn}>Actualizar Servicio</button>
        </div>
      </form>
    </div>
  );
}
