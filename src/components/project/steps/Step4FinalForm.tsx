'use client';

import React, { ChangeEvent } from 'react';
import type { Service } from './types';
import styles from './Step4FinalForm.module.css';

interface ProjectFormData {
  title: string;
  description: string;
  urgency?: 'Alta' | 'Media' | 'Baja';
  deadline?: string;
  references?: string;
}

interface Step4FinalFormProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  services: Service[];
  serviceIdx: number | null;
  subIdx: number | null;
  modality: string;
  onNext: () => void;
}

export default function Step4FinalForm({
  formData,
  setFormData,
  services,
  serviceIdx,
  subIdx,
  modality,
  onNext,
}: Step4FinalFormProps) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className={styles.heading}>Cuéntanos tu Idea</h2>

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Título del proyecto*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Descripción detallada*
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className={styles.textarea}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="urgency" className={styles.label}>
          Urgencia
        </label>
        <select
          id="urgency"
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="deadline" className={styles.label}>
          Fecha límite (opcional)
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="references" className={styles.label}>
          URLs de referencias (separadas por coma)
        </label>
        <input
          type="text"
          id="references"
          name="references"
          placeholder="https://ejemplo.com, https://otro..."
          value={formData.references}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
    </div>
  );
}