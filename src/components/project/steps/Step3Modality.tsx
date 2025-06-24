'use client';

import React from 'react';
import type { Service } from './types';
import styles from './Step3Modality.module.css';

interface Step3ModalityProps {
  services: Service[];
  serviceIdx: number | null;
  modality: string;
  setModality: (mod: string) => void;
  onNext: () => void;
}

export default function Step3Modality({
  services,
  serviceIdx,
  modality,
  setModality,
  onNext,
}: Step3ModalityProps) {
  if (serviceIdx === null || !services[serviceIdx]) {
    return <p>Por favor, regresa a seleccionar un servicio.</p>;
  }
  const modalities = services[serviceIdx].modalities;

  return (
    <div>
      <h2 className={styles.heading}>Elige una Modalidad</h2>
      {modalities.length === 0 ? (
        <p>No hay modalidades disponibles.</p>
      ) : (
        <ul className={styles.list}>
          {modalities.map((mod, idx) => (
            <li key={idx} className={styles.listItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="modality"
                  value={mod}
                  checked={modality === mod}
                  onChange={() => setModality(mod)}
                />
                <span className={styles.modName}>{mod}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}