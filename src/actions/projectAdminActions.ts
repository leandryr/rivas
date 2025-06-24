// src/app/actions/projectAdminActions.ts
'use server';

import connectDB from '@/lib/db';
import Project from '@/models/Project.model';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

/**
 * Tipo intermedio para la lista general de proyectos (Admin).
 * Proyectamos ownerEmail y ownerName directamente como alias planos.
 */
interface LeanedProjectForAdmin {
  _id: Types.ObjectId;
  ownerEmail: string;     // alias plano
  ownerName?: string;     // alias plano (puede ser undefined)
  'service.name': string; // nombre del servicio
  subCategory: string;
  modality: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Devuelve todos los proyectos junto con datos básicos del cliente (owner).
 * Retorna un array de objetos planos que el Admin consume para la tabla.
 */
export async function getAllProjectsForAdmin(): Promise<
  {
    _id: string;
    ownerEmail: string;
    ownerName?: string;
    serviceName: string;
    subCategory: string;
    modality: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[]
> {
  await connectDB();

  const docs: LeanedProjectForAdmin[] = await Project.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'ownerInfo',
      },
    },
    {
      $unwind: {
        path: '$ownerInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        _id: 1,
        ownerEmail: '$ownerInfo.email',   // alias plano
        ownerName: '$ownerInfo.name',     // alias plano
        'service.name': 1,
        subCategory: 1,
        modality: 1,
        title: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    ownerEmail: doc.ownerEmail || '—',
    ownerName: doc.ownerName || '—',
    serviceName: doc['service.name'],
    subCategory: doc.subCategory,
    modality: doc.modality,
    title: doc.title,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));
}

/**
 * Tipo intermedio para un solo proyecto (detalle Admin).
 * Proyectamos ownerEmail y ownerName como alias planos.
 */
interface LeanedProjectAdminDetail {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  ownerEmail: string;         // alias plano
  ownerName?: string;         // alias plano
  'service.name': string;
  'service.description': string;
  subCategory: string;
  modality: string;
  title: string;
  description: string;
  urgency?: string;
  deadline?: Date;
  references?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Devuelve un único proyecto por su ID, junto con datos del cliente (owner).
 * Si no existe o el ID no es válido, retorna null.
 */
export async function getProjectForAdminById(
  id: string
): Promise<
  | {
      _id: string;
      ownerId: string;
      ownerEmail: string;
      ownerName?: string;
      service: { name: string; description: string };
      subCategory: string;
      modality: string;
      title: string;
      description: string;
      urgency?: string;
      deadline?: string;
      references: string[];
      status: string;
      createdAt: string;
      updatedAt: string;
    }
  | null
> {
  await connectDB();

  // 1) Validar que sea un ObjectId válido
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  // 2) Pipeline de agregación para un solo proyecto + datos del owner
  const docs: LeanedProjectAdminDetail[] = await Project.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'ownerInfo',
      },
    },
    {
      $unwind: {
        path: '$ownerInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        ownerId: 1,
        ownerEmail: '$ownerInfo.email',         // alias plano
        ownerName: '$ownerInfo.name',           // alias plano
        'service.name': 1,
        'service.description': 1,
        subCategory: 1,
        modality: 1,
        title: 1,
        description: 1,
        urgency: 1,
        deadline: 1,
        references: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (docs.length === 0) {
    return null;
  }

  const doc = docs[0];

  // 3) Mapear a un objeto plano que Next.js pueda serializar
  return {
    _id: doc._id.toString(),
    ownerId: doc.ownerId.toString(),
    ownerEmail: doc.ownerEmail || '—',
    ownerName: doc.ownerName || '—',
    service: {
      name: doc['service.name'],
      description: doc['service.description'],
    },
    subCategory: doc.subCategory,
    modality: doc.modality,
    title: doc.title,
    description: doc.description,
    urgency: doc.urgency,
    deadline: doc.deadline ? doc.deadline.toISOString() : undefined,
    references: doc.references || [],
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Server Action para actualizar el estado de un proyecto (Admin).
 * - Espera recibir un FormData con:
 *    • projectId: ID del proyecto a actualizar
 *    • status: nuevo estado ('Pendiente' | 'En Proceso' | 'Completado')
 * - Revalida la ruta /(dashboard)/admin/projects para actualizar la tabla.
 */
export async function updateProjectStatusAction(formData: FormData) {
  await connectDB();

  const projectId = formData.get('projectId')?.toString() || '';
  const newStatus = formData.get('status')?.toString() || '';
  const validStatuses = ['Pendiente', 'En Proceso', 'Completado'];

  if (!projectId || !validStatuses.includes(newStatus)) {
    throw new Error('Faltan datos o estado no válido');
  }

  await Project.findByIdAndUpdate(projectId, { status: newStatus });

  // Revalida la página de Admin → Proyectos
  revalidatePath('/(dashboard)/admin/projects');
}
