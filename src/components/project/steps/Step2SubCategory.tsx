'use client';

import React from 'react';
import type { Service } from './types';
import styles from './Step2SubCategory.module.css';

interface Step2SubCategoryProps {
  services: Service[];
  serviceIdx: number | null;
  subIdx: number | null;
  setSubIdx: (idx: number) => void;
  onNext: () => void;
}

export default function Step2SubCategory({
  services,
  serviceIdx,
  subIdx,
  setSubIdx,
  onNext,
}: Step2SubCategoryProps) {
  if (serviceIdx === null || !services[serviceIdx]) {
    return <p>Por favor, regresa al paso anterior y selecciona un servicio.</p>;
  }
  const subCategories = services[serviceIdx].subCategories;

  return (
    <div>
      <h2 className={styles.heading}>Selecciona una Subcategoría</h2>
      {subCategories.length === 0 ? (
        <p>No hay subcategorías disponibles.</p>
      ) : (
        <ul className={styles.list}>
          {subCategories.map((sub, idx) => (
            <li key={idx} className={styles.listItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="subCategory"
                  value={idx}
                  checked={subIdx === idx}
                  onChange={() => setSubIdx(idx)}
                />
                <span className={styles.subName}>{sub}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}