'use server';

import connectDB from '@/lib/db';
import Service, { IService } from '@/models/Service.model';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

interface ServiceFormData {
  name: string;
  description: string;
  modalities: string[];     // ej. ['Por proyecto', 'Por hora']
  subCategories: string[];  // ej. ['Programación Web', 'Diseño Web', ...]
}

/**
 * Crea un nuevo servicio en MongoDB.
 * -- Ya no se devuelve la instancia de Mongoose, 
 *    solo se revalida la ruta y se retorna un objeto plano o undefined.
 */
export async function createServiceAction(data: ServiceFormData) {
  await connectDB();

  // 1) Validar duplicados
  const exists = await Service.findOne({ name: data.name }).lean();
  if (exists) {
    throw new Error(`Ya existe un servicio con el nombre "${data.name}"`);
  }

  // 2) Crear y guardar el nuevo documento
  const nuevo = new Service({
    name: data.name,
    description: data.description,
    modalities: data.modalities,
    subCategories: data.subCategories,
  });
  await nuevo.save();

  // 3) Revalidar la ruta de listado de servicios (ISR / ISR-blocking)
  revalidatePath('/admin/services');

  // 4) No devolvemos “nuevo” (instancia de Mongoose). Devolvemos un objeto plano
  //    por ejemplo, solo el ID convertido a string o simplemente nothing.
  //    A continuación tienes dos opciones. Elige la que prefieras:

  // Opción A: no devolver nada explícito (undefined)
  return;

  // Opción B: devolver un objeto plano con datos mínimos (por ejemplo, el ID)
  // return { id: nuevo._id.toString() };
}

/**
 * Actualiza un servicio existente.
 * -- Al igual que en create, no devolvemos la instancia de Mongoose.
 */
export async function updateServiceAction(
  id: string,
  data: ServiceFormData
) {
  await connectDB();

  // 1) Validar ID válido de Mongo
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID de servicio inválido.');
  }

  // 2) Buscar el documento
  const servicio = await Service.findById(id);
  if (!servicio) {
    throw new Error('Servicio no encontrado.');
  }

  // 3) Si cambió el nombre, verificar duplicados
  if (servicio.name !== data.name) {
    const dup = await Service.findOne({ name: data.name }).lean();
    if (dup) {
      throw new Error(`Ya existe un servicio con el nombre "${data.name}"`);
    }
  }

  // 4) Asignar nuevos valores y guardar
  servicio.name = data.name;
  servicio.description = data.description;
  servicio.modalities = data.modalities;
  servicio.subCategories = data.subCategories;
  await servicio.save();

  // 5) Revalidar la ruta
  revalidatePath('/admin/services');

  // 6) No devolvemos la instancia de Mongoose
  return;
}

/**
 * Elimina un servicio por su ID.
 * -- En este caso devolvemos solo un objeto plano con deletedId (string).
 */
export async function deleteServiceAction(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID de servicio inválido.');
  }

  const servicio = await Service.findById(id);
  if (!servicio) {
    throw new Error('Servicio no encontrado.');
  }

  await Service.deleteOne({ _id: servicio._id });
  revalidatePath('/admin/services');

  // Retornamos un objeto plano informando del borrado
  return { deletedId: id };
}