// src/app/api/auth/clients/projects/route.ts

import connectDB from '@/lib/db'
import { auth } from '@/lib/a/auth'
import Project from '@/models/Project.model'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // 1) Conecta a la base de datos
  await connectDB()

  // 2) Recupera la sesión (named export desde src/lib/auth.ts)
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 3) Filtra proyectos del cliente según estados activos
  const activeStatuses = ['requested', 'in progress', 'review']
  const projects = await Project.find({
    client: session.user.id,
    status: { $in: activeStatuses }
  })

  // 4) Devuelve el listado de proyectos
  return NextResponse.json({ projects })
}
