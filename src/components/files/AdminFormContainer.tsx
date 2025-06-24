'use client'

import React, { useState, useEffect } from 'react'
import FileUploadForm from './FileUploadForm'
import { FileList } from './FileList'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

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

interface Props {
  users: UserOption[]
  projects: ProjectOption[]
  adminId: string // ✅ ID del admin autenticado
}

export default function AdminFormContainer({ users, projects, adminId }: Props) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')

  useEffect(() => {
    console.log('[AdminFormContainer] adminId:', adminId)
  }, [adminId])

  const handleUserChange = (value: string) => {
    console.log('[AdminFormContainer] Cliente seleccionado:', value)
    setSelectedUser(value)
    setSelectedProject('')
  }

  const handleProjectChange = (value: string) => {
    console.log('[AdminFormContainer] Proyecto seleccionado:', value)
    setSelectedProject(value)
  }

  const userProjects = selectedUser
    ? projects.filter((p) => p.ownerId === selectedUser)
    : []

  const getUserFullName = (user: UserOption) =>
    `${user.name}${user.lastname ? ' ' + user.lastname : ''}`

  const isReadyToUpload = selectedUser && selectedProject && adminId

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Gestión de Archivos del Cliente
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona un cliente y un proyecto para subir archivos o ver los existentes.
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Selecciona cliente</Label>
          <Select onValueChange={handleUserChange} value={selectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="— Ninguno —" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {getUserFullName(user)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="space-y-1.5">
            <Label>Selecciona proyecto</Label>
            <Select onValueChange={handleProjectChange} value={selectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="— Ninguno —" />
              </SelectTrigger>
              <SelectContent>
                {userProjects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Validación de adminId */}
      {!adminId && (
        <div className="text-red-600 text-sm font-medium">
          ⚠️ Error: No se ha proporcionado el ID del administrador (adminId).
        </div>
      )}

      {/* Formulario */}
      {isReadyToUpload && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-lg font-semibold mb-2">Subir archivo como Admin</h3>
            <FileUploadForm
              userId={adminId} // ← uploader real (admin)
              projectId={selectedProject}
              forClientId={selectedUser} // ← cliente objetivo
              onUploaded={() => window.location.reload()}
              isAdmin={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Lista de archivos */}
      {selectedUser && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-lg font-semibold mb-2">Archivos del cliente</h3>
            <FileList
              userId={selectedUser}
              projectId={selectedProject || undefined}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
