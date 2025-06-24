import React from "react"
import { Types } from "mongoose"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Project from "@/models/Project.model"
import AdminFormContainer from "@/components/files/AdminFormContainer"
import AdminDocumentList from "@/components/files/AdminDocumentList"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

interface UserOption {
  _id: string
  name: string
  lastname?: string
}

interface ProjectOption {
  _id: string
  title: string
  ownerId: string
}

export const revalidate = 0

export default async function AdminFilesPage() {
  await connectDB()

  const session = await getServerSession(authOptions)
  const adminId = session?.user?.id

  if (!adminId) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-4 text-red-600 border border-red-500 bg-red-50 rounded">
        ⚠️ Error: No se ha proporcionado el ID del administrador (adminId). Verifica la sesión.
      </div>
    )
  }

  const usuariosDB = await User.find({ role: "client" })
    .select({ _id: 1, name: 1, lastname: 1 })
    .lean<{ _id: Types.ObjectId; name: string; lastname?: string }[]>()

  const users: UserOption[] = usuariosDB.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    lastname: u.lastname,
  }))

  const proyectosDB = await Project.find()
    .select({ _id: 1, title: 1, ownerId: 1 })
    .lean<{ _id: Types.ObjectId; title: string; ownerId: Types.ObjectId }[]>()

  const projects: ProjectOption[] = proyectosDB.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    ownerId: p.ownerId.toString(),
  }))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Documentos
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sube archivos para clientes o proyectos, y administra lo ya cargado.
        </p>
      </header>

      {/* Formulario de carga */}
      <section className="rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 shadow p-4 md:p-6">
        <AdminFormContainer users={users} projects={projects} adminId={adminId} />
      </section>

      {/* Tabla de documentos */}
      <section className="rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 shadow p-4 md:p-6">
        <AdminDocumentList />
      </section>
    </div>
  )
}
