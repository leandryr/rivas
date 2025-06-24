// src/app/actions/projectAdminActions.ts
'use server';

import connectDB from '@/lib/db';
import Project, { IProject } from '@/models/Project.model';
import User, { IUser } from '@/models/User';
import { revalidatePath } from 'next/cache';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

interface CreateProjectParams {
  serviceName: string;
  serviceDescription: string;
  subCategory: string;
  modality: string;

  title: string;
  description: string;
  urgency?: 'Alta' | 'Media' | 'Baja';
  deadline?: string;      // ISO string
  references?: string[];  // arreglo de URLs
}

export async function createProjectAction(data: CreateProjectParams) {
  // 1. Conexión a MongoDB
  await connectDB();

  // 2. Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error('No hay sesión válida. Debes iniciar sesión para crear un proyecto.');
  }

  // 3. Buscar al usuario en la BD por email
  const userDoc = await User.findOne({ email: session.user.email }).lean<IUser>();
  if (!userDoc) {
    throw new Error('Usuario no encontrado en la base de datos.');
  }

  // 4. Ya tenemos su ObjectId
  const ownerId = userDoc._id;

  // 5. Desestructuramos los datos que vienen del cliente
  const {
    serviceName,
    serviceDescription,
    subCategory,
    modality,
    title,
    description,
    urgency,
    deadline,
    references,
  } = data;

  // 6. Creamos y guardamos el nuevo documento
  const newProject = new Project({
    ownerId: ownerId,
    service: {
      name: serviceName,
      description: serviceDescription,
    },
    subCategory,
    modality,
    title,
    description,
    urgency: urgency || 'Media',
    deadline: deadline ? new Date(deadline) : undefined,
    references: references || [],
    status: 'Pendiente',
  });
  await newProject.save();

  // 7. Revalidamos la ruta donde listamos proyectos (ISR)
  revalidatePath('/client/projects');

  // 8. **NO devolvemos `newProject`** (una instancia de Mongoose).
  //    Puedes devolver `undefined` o, si necesitas algo en el cliente,
  //    devolver solo un objeto plano. Ejemplo:
  // return { id: newProject._id.toString() };

  return;
}

/**
 * Server Action para actualizar el estado de un proyecto.
 * Espera recibir un FormData con:
 *  - projectId: ID del proyecto a actualizar
 *  - status: nuevo estado ("Pendiente" | "En Proceso" | "Completado")
 *
 * Al finalizar, revalida la ruta /(dashboard)/admin/projects
 * para que la tabla muestre el cambio inmediatamente.
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
