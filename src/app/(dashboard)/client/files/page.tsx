import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User, { IUser } from '@/models/User'
import Project, { IProject } from '@/models/Project.model'
import ClientFormContainer from '@/components/files/ClientFormContainer'
import { FileList } from '@/components/files/FileList'
import { Types } from 'mongoose'

export const revalidate = 0

interface ProjectSummary {
  _id: string
  title: string
}

export default async function ClientFilesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return (
      <p className="p-6 text-center text-red-600 dark:text-red-400">
        No estás autenticado.
      </p>
    )
  }

  await connectDB()

  const userDB = await User.findOne({ email: session.user.email })
    .select({ _id: 1, name: 1, lastname: 1, email: 1 })
    .lean<IUser>()

  if (!userDB) {
    return (
      <p className="p-6 text-center text-red-600 dark:text-red-400">
        Usuario no encontrado.
      </p>
    )
  }

  const userId = (userDB._id as Types.ObjectId).toString()

  const proyectosDB = await Project.find({ ownerId: userDB._id })
    .select({ _id: 1, title: 1 })
    .lean<IProject[]>()

  const projects: ProjectSummary[] = proyectosDB.map((p) => ({
    _id: (p._id as Types.ObjectId).toString(),
    title: p.title,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Panel de Documentos (Cliente)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes subir archivos a tus proyectos y ver todos los documentos que has subido.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de subida */}
        <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Subir Documento</h2>
          <ClientFormContainer userId={userId} projects={projects} />
        </section>

        {/* Lista de proyectos */}
        <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Tus Proyectos</h2>
          {projects.length > 0 ? (
            <ul className="space-y-3">
              {projects.map((proj) => (
                <li
                  key={proj._id}
                  className="flex items-center justify-between p-3 border rounded dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {proj.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No tienes proyectos asociados actualmente.
            </p>
          )}
        </section>
      </div>

      {/* Lista de archivos final */}
      <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Tus Archivos</h2>
        <FileList userId={userId} />
      </section>
    </div>
  )
}
