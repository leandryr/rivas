'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper } from '@/components/project/Stepper';
import Step1Service from '@/components/project/steps/Step1Service';
import Step2SubCategory from '@/components/project/steps/Step2SubCategory';
import Step3Modality from '@/components/project/steps/Step3Modality';
import Step4FinalForm from '@/components/project/steps/Step4FinalForm';
import Step5Preview from '@/components/project/steps/Step5Preview';
import styles from './NewProject.module.css';
import type { Service } from '@/components/project/steps/types';
import type { IService } from '@/models/Service.model';

// Importamos la Server Action
import { createProjectAction } from '@/actions/projectActions';

interface ProjectFormData {
  title: string;
  description: string;
  urgency?: 'Alta' | 'Media' | 'Baja';
  deadline?: string;
  references?: string;
}

interface NewProjectClientProps {
  initialServices: IService[];
}

export default function NewProjectClient({ initialServices }: NewProjectClientProps) {
  const router = useRouter();

  // -------------------------------------------------------------------
  // 1) Estados del wizard
  // -------------------------------------------------------------------
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceIdx, setServiceIdx] = useState<number | null>(null);
  const [subIdx, setSubIdx] = useState<number | null>(null);
  const [modality, setModality] = useState<string>('');

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    urgency: 'Media',
    deadline: '',
    references: '',
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mensajes de validación
  const [errorStep0, setErrorStep0] = useState<string | null>(null);
  const [errorStep1, setErrorStep1] = useState<string | null>(null);
  const [errorStep2, setErrorStep2] = useState<string | null>(null);
  const [errorStep3, setErrorStep3] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // 2) Inicializar el arreglo `services`
  // -------------------------------------------------------------------
  useEffect(() => {
    const mapped: Service[] = initialServices.map((svc) => ({
      name: svc.name,
      description: svc.description,
      modalities: svc.modalities,
      subCategories: svc.subCategories,
    }));
    setServices(mapped);
  }, [initialServices]);

  // -------------------------------------------------------------------
  // 3) Labels y tips del Stepper
  // -------------------------------------------------------------------
  const stepLabels = ['Servicio', 'Subcategoría', 'Modalidad', 'Idea', 'Previsualización'];
  const stepTips: Record<number, string> = {
    0: `Este es el primer punto de encuentro con el freelancer.
Busca que el título contenga todas las palabras claves del proyecto y que, al mismo tiempo, sea una síntesis de lo que necesitas.`,
    1: `En este paso seleccionas la subcategoría que mejor encaje con tu proyecto.`,
    2: `Elige la modalidad (por proyecto o por hora) que prefieras.`,
    3: `En este formulario final, sé lo más claro posible:
- Explica tu idea.
- Incluye urgencia, fechas y alcance.
- Adjunta cualquier archivo referencial.`,
    4: `Verifica que todos los datos estén correctos antes de enviarlos.`
  };
  const totalSteps = 5;

  // -------------------------------------------------------------------
  // 4) Funciones para avanzar / retroceder con validaciones
  // -------------------------------------------------------------------
  const onNext = () => {
    setErrorStep0(null);
    setErrorStep1(null);
    setErrorStep2(null);
    setErrorStep3(null);

    if (step === 0) {
      if (serviceIdx === null) {
        setErrorStep0('Por favor, selecciona un servicio.');
        return;
      }
    }
    if (step === 1) {
      if (subIdx === null) {
        setErrorStep1('Selecciona una subcategoría antes de continuar.');
        return;
      }
    }
    if (step === 2) {
      if (modality.trim() === '') {
        setErrorStep2('Elige una modalidad (por proyecto o por hora).');
        return;
      }
    }
    if (step === 3) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setErrorStep3('Debes completar título y descripción para continuar.');
        return;
      }
    }

    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const onBack = () => {
    setErrorStep0(null);
    setErrorStep1(null);
    setErrorStep2(null);
    setErrorStep3(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  // -------------------------------------------------------------------
  // 5) handleSubmit: invoca createProjectAction (ya no necesita ownerId)
  // -------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validación final
    if (serviceIdx === null || subIdx === null || modality.trim() === '') {
      setSuccessMessage('❌ Faltan datos obligatorios.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      setSuccessMessage('❌ Completa título y descripción.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    try {
      // Determinar serviceName y serviceDescription
      const servicioElegido = services[serviceIdx];
      const subCategory = servicioElegido.subCategories[subIdx];

      // Construir arreglo de referencias (si hubo)
      const referenciasArr =
        formData.references
          ?.split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0) || [];

      // Llamamos a la Server Action (ownerId se resuelve en el servidor)
      await createProjectAction({
        serviceName: servicioElegido.name,
        serviceDescription: servicioElegido.description,
        subCategory,
        modality,
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency,
        deadline: formData.deadline,
        references: referenciasArr,
      });

      setSuccessMessage('✅ Proyecto enviado correctamente');
      setTimeout(() => {
        router.push('/client/projects');
      }, 1000);
    } catch (error: any) {
      console.error('Error al crear proyecto:', error);
      setSuccessMessage('❌ Falló al enviar el proyecto');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // -------------------------------------------------------------------
  // 6) Renderizado del wizard
  // -------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <Stepper steps={stepLabels} currentStep={step} />

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 0 && (
            <>
              <Step1Service
                services={services}
                serviceIdx={serviceIdx}
                setServiceIdx={setServiceIdx}
                onNext={onNext}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onNext}
                  className={styles.nextBtn}
                  disabled={serviceIdx === null}
                >
                  Siguiente →
                </button>
              </div>
              {errorStep0 && <p className={styles.errorText}>{errorStep0}</p>}
            </>
          )}

          {step === 1 && (
            <>
              <Step2SubCategory
                services={services}
                serviceIdx={serviceIdx}
                subIdx={subIdx}
                setSubIdx={setSubIdx}
                onNext={onNext}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onBack}
                  className={styles.backBtn}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className={styles.nextBtn}
                  disabled={subIdx === null}
                >
                  Siguiente →
                </button>
              </div>
              {errorStep1 && <p className={styles.errorText}>{errorStep1}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <Step3Modality
                services={services}
                serviceIdx={serviceIdx}
                modality={modality}
                setModality={setModality}
                onNext={onNext}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onBack}
                  className={styles.backBtn}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className={styles.nextBtn}
                  disabled={modality.trim() === ''}
                >
                  Siguiente →
                </button>
              </div>
              {errorStep2 && <p className={styles.errorText}>{errorStep2}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <Step4FinalForm
                formData={formData}
                setFormData={setFormData}
                services={services}
                serviceIdx={serviceIdx}
                subIdx={subIdx}
                modality={modality}
                onNext={onNext}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onBack}
                  className={styles.backBtn}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className={styles.nextBtn}
                  disabled={
                    !formData.title.trim() || !formData.description.trim()
                  }
                >
                  Siguiente →
                </button>
              </div>
              {errorStep3 && <p className={styles.errorText}>{errorStep3}</p>}
            </>
          )}

          {step === 4 && (
            <>
              <Step5Preview
                services={services}
                serviceIdx={serviceIdx}
                subIdx={subIdx}
                modality={modality}
                formData={formData}
                onNext={onNext}
              />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={onBack}
                  className={styles.backBtn}
                >
                  ← Atrás
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Crear Proyecto
                </button>
              </div>
            </>
          )}

          {successMessage && (
            <div className={styles.successToast}>{successMessage}</div>
          )}
        </form>

        <aside className={styles.sidebar}>
          {stepTips[step] && (
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>?</div>
              <div className={styles.infoText}>{stepTips[step]}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}