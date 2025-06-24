'use server';

import connectDB from '@/lib/db';
import FileAsset from '@/models/FileAsset.model';
import { revalidatePath } from 'next/cache';

/**
 * En este caso no necesitamos una acción pura para subir (ya está en API),
 * pero sí podemos tener una acción para revalidar o eliminar archivos.
 * Por ahora incluimos solo revalidar la página de Admin/Files.
 */
export async function revalidateAdminFiles() {
  await connectDB();
  // Revalida la página de lista de archivos en Admin
  revalidatePath('/(dashboard)/admin/files');
}
