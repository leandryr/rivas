'use server';

import connectDB from '@/lib/db';
import Service, { IService } from '@/models/Service.model';
import { Types } from 'mongoose';

export async function getAllServices(): Promise<
  {
    _id: string;
    name: string;
    description: string;
    modalities: string[];
    subCategories: string[];
  }[]
> {
  await connectDB();

  // 1) Hacemos la consulta con lean<…>() para que TypeScript sepa que _id no es unknown
  interface LeanedServiceDoc {
    _id: Types.ObjectId;
    name: string;
    description: string;
    modalities: string[];
    subCategories: string[];
  }

  const docs: LeanedServiceDoc[] = await Service.find()
    .sort({ createdAt: -1 })
    .lean<LeanedServiceDoc[]>();

  // 2) Convertir cada documento en un objeto plano para que Next.js lo pueda enviar  
  return docs.map((doc) => ({
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    modalities: doc.modalities,
    subCategories: doc.subCategories,
  }));
}
