'use client';

import React from 'react';
import type { Service } from './types';
import styles from './Step1Service.module.css';

interface Step1ServiceProps {
  services: Service[];
  serviceIdx: number | null;
  setServiceIdx: (idx: number) => void;
  onNext: () => void;
}

export default function Step1Service({
  services,
  serviceIdx,
  setServiceIdx,
  onNext,
}: Step1ServiceProps) {
  return (
    <div>
      <h2 className={styles.heading}>Selecciona un Servicio</h2>
      {services.length === 0 ? (
        <p>No hay servicios disponibles.</p>
      ) : (
        <ul className={styles.list}>
          {services.map((svc, idx) => (
            <li key={idx} className={styles.listItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="service"
                  value={idx}
                  checked={serviceIdx === idx}
                  onChange={() => setServiceIdx(idx)}
                />
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>{svc.name}</span>
                  <span className={styles.serviceDesc}>{svc.description}</span>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}