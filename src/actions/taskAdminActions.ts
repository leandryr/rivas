// src/actions/taskAdminActions.ts
'use server';

import connectDB from '@/lib/db';
import Task from '@/models/Task.model';
import { revalidatePath } from 'next/cache';

/**
 * Server Action para crear una nueva tarea.
 * - Espera un FormData con: title, description, userId (assignedTo) y projectId.
 * - Revalida la ruta /(dashboard)/admin/tasks para que la página se actualice después de crear.
 */
export async function createTaskAction(formData: FormData) {
  await connectDB();

  const title       = formData.get('title')?.toString()       || '';
  const description = formData.get('description')?.toString() || '';
  const assignedTo  = formData.get('userId')?.toString()      || '';
  const projectId   = formData.get('projectId')?.toString()   || '';

  if (!title || !assignedTo || !projectId) {
    throw new Error('Faltan datos obligatorios para crear la tarea.');
  }

  await Task.create({
    assignedTo,
    projectId,
    title,
    description,
    status: 'Pendiente',
  });

  // Revalida la página de Admin → Tareas
  revalidatePath('/(dashboard)/admin/tasks');
}

/**
 * Server Action para actualizar solo el status de una tarea existente.
 * - Espera un FormData con: taskId y status.
 * - Revalida la ruta /(dashboard)/admin/tasks para que la tabla se actualice.
 */
export async function updateTaskStatusAction(formData: FormData) {
  await connectDB();

  const taskId   = formData.get('taskId')?.toString() || '';
  const newStatus= formData.get('status')?.toString() || '';
  const validStatuses = ['Pendiente', 'En Proceso', 'Completado'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Estado inválido para la tarea.');
  }

  await Task.findByIdAndUpdate(taskId, { status: newStatus });
  revalidatePath('/(dashboard)/admin/tasks');
}
