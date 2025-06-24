'use client';

import React from 'react';
import styles from './Stepper.module.css';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((label, index) => (
        <div key={index} className={styles.stepItem}>
          <div
            className={`${styles.circle} ${
              index <= currentStep ? styles.activeCircle : ''
            }`}
          >
            {index + 1}
          </div>
          <div
            className={`${styles.label} ${
              index === currentStep ? styles.activeLabel : ''
            }`}
          >
            {label}
          </div>
          {index < steps.length - 1 && <div className={styles.line} />}
        </div>
      ))}
    </div>
  );
}