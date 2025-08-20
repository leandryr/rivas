'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  BarChart3,
  FileText,
  Calendar,
  FolderKanban,
  ClipboardList,
} from 'lucide-react'

interface Project {
  _id: string
  title: string
  modality: string
  status: string
  createdAt: string
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Cliente'

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/auth/clients/projects')
        if (!res.ok) throw new Error('Error al cargar proyectos')
        const data = await res.json()
        setProjects(data.projects || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  const statusLabels: Record<string, string> = {
    requested: 'Solicitado',
    'in progress': 'En progreso',
    review: 'En revisión',
  }

  const statusClasses: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-700',
    'in progress': 'bg-blue-100 text-blue-700',
    review: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Bienvenido, {name}</h1>
        <p className="text-gray-600 text-lg">
          Aquí tienes el estado actual de tus proyectos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 text-center space-y-2">
            <FolderKanban className="mx-auto h-8 w-8 text-blue-600" />
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="text-gray-500">Proyectos activos</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 text-center space-y-2">
            <FileText className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-3xl font-bold">
              {projects.filter((p) => p.status === 'requested').length}
            </p>
            <p className="text-gray-500">Solicitados</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 text-center space-y-2">
            <BarChart3 className="mx-auto h-8 w-8 text-orange-600" />
            <p className="text-3xl font-bold">
              {projects.filter((p) => p.status === 'in progress').length}
            </p>
            <p className="text-gray-500">En progreso</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 text-center space-y-2">
            <Calendar className="mx-auto h-8 w-8 text-purple-600" />
            <p className="text-3xl font-bold">
              {projects.filter((p) => p.status === 'review').length}
            </p>
            <p className="text-gray-500">En revisión</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de proyectos */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tus proyectos</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ClipboardList className="h-10 w-10 mb-3 text-gray-400" />
            <p>No tienes proyectos activos en este momento.</p>
            <button className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Crear nuevo proyecto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Modalidad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Creado</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{p.title}</td>
                    <td className="py-3 px-4 text-gray-500">{p.modality}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          statusClasses[p.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
