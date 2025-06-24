// src/app/api/tasks/[id]/route.ts

import Task from '@/models/Task.model';
import connectDB from '@/lib/db';

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    console.log('[PATCH] Conectando a la base de datos...');
    await connectDB();

    const { id } = context.params;
    console.log(`[PATCH] ID recibido: ${id}`);

    // 1) Encontrar la tarea y "popular" projectId (no "project")
    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      console.warn('[PATCH] Tarea no encontrada');
      return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    // 2) `task.projectId` puede ser todavía un ObjectId o bien un documento populado.
    //    Para comprobar su propiedad `status`, lo casteamos a `any` o a una interfaz adecuada.
    const proyectoPopulado: any = task.projectId;
    if (proyectoPopulado?.status === 'Completado') {
      console.warn(
        '[PATCH] Proyecto completado. No se puede editar la tarea.'
      );
      return Response.json(
        {
          error:
            'No se puede editar una tarea de un proyecto completado',
        },
        { status: 400 }
      );
    }

    // 3) Leer el body JSON de la petición
    const data = await req.json();
    if (data.status) task.status = data.status;
    if (data.description !== undefined) task.description = data.description;

    // 4) Guardar cambios
    await task.save();
    console.log('[PATCH] Tarea actualizada correctamente');
    return Response.json({ task });
  } catch (error) {
    console.error('[PATCH] Error al actualizar tarea:', error);
    return Response.json(
      { error: 'Error al actualizar la tarea' },
      { status: 500 }
    );
  }
}
