'use client';

import React from 'react';
import type { Service } from './types';
import styles from './Step5Preview.module.css';

interface ProjectFormData {
  title: string;
  description: string;
  urgency?: 'Alta' | 'Media' | 'Baja';
  deadline?: string;
  references?: string;
}

interface Step5PreviewProps {
  services: Service[];
  serviceIdx: number | null;
  subIdx: number | null;
  modality: string;
  formData: ProjectFormData;
  onNext: () => void;
}

export default function Step5Preview({
  services,
  serviceIdx,
  subIdx,
  modality,
  formData,
  onNext,
}: Step5PreviewProps) {
  if (
    serviceIdx === null ||
    subIdx === null ||
    !services[serviceIdx] ||
    modality.trim() === ''
  ) {
    return <p>Datos incompletos. Por favor regresa y completa los pasos anteriores.</p>;
  }

  const servicio = services[serviceIdx];
  const subCategory = servicio.subCategories[subIdx];

  return (
    <div>
      <h2 className={styles.heading}>Previsualización</h2>

      <div className={styles.previewBox}>
        <p>
          <strong>Servicio:</strong> {servicio.name}
        </p>
        <p>
          <strong>Subcategoría:</strong> {subCategory}
        </p>
        <p>
          <strong>Modalidad:</strong> {modality}
        </p>
        <p>
          <strong>Título:</strong> {formData.title}
        </p>
        <p>
          <strong>Descripción:</strong> {formData.description}
        </p>
        {formData.urgency && (
          <p>
            <strong>Urgencia:</strong> {formData.urgency}
          </p>
        )}
        {formData.deadline && (
          <p>
            <strong>Deadline:</strong> {formData.deadline}
          </p>
        )}
        {formData.references && (
          <p>
            <strong>Referencias:</strong> {formData.references}
          </p>
        )}
      </div>
    </div>
  );
}