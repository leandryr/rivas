'use server';

import connectDB from '@/lib/db';
import Project from '@/models/Project.model';
import { Types } from 'mongoose';

/**
 * Este tipo describe la forma exacta que tiene cada documento
 * devuelto por `lean()` antes de mapearlo a JSON.
 */
interface LeanedProjectDoc {
  _id: Types.ObjectId;
  title: string;
  modality: string;
}

/**
 * Devuelve todos los proyectos en forma de objetos planos con
 * campos _id (string), title y modality.
 */
export async function listProjects(): Promise<
  {
    _id: string;
    title: string;
    modality: string;
  }[]
> {
  await connectDB();

  // 1) Forzamos a TS a entender que `lean()` retorna LeanedProjectDoc[]
  const docs: LeanedProjectDoc[] = await Project.find()
    .sort({ createdAt: -1 })
    .lean<LeanedProjectDoc[]>();

  // 2) Ahora `doc._id` es `Types.ObjectId`, así que `toString()` no da error
  return docs.map((doc) => ({
    _id: doc._id.toString(),
    title: doc.title,
    modality: doc.modality,
  }));
}

/**
 * Devuelve un único proyecto por su ID o null si no existe.
 * Los campos de fecha y IDs los convertimos a string para JSON.
 */
export async function getProjectById(
  id: string
): Promise<
  | {
      _id: string;
      ownerId: string;
      service: { name: string; description: string };
      subCategory: string;
      modality: string;
      title: string;
      description: string;
      urgency?: string;
      deadline?: string;
      references?: string[];
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

  // 2) Definimos cómo será el documento “leanado”
  interface LeanedProjectDocFull {
    _id: Types.ObjectId;
    ownerId: Types.ObjectId;
    service: { name: string; description: string };
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

  // 3) Hacemos findById y lean<LeanedProjectDocFull>()
  const doc: LeanedProjectDocFull | null = await Project.findById(id).lean<
    LeanedProjectDocFull
  >();

  if (!doc) {
    return null;
  }

  // 4) Convertimos a un objeto plano con strings para ID/fechas
  return {
    _id: doc._id.toString(),
    ownerId: doc.ownerId.toString(),
    service: {
      name: doc.service.name,
      description: doc.service.description,
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