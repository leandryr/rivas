'use client'

import React, { useState } from 'react'
import FileUploadForm from '@/components/files/FileUploadForm'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface ProjectOption {
  _id: string
  title: string
}

interface ClientFormContainerProps {
  userId: string
  projects: ProjectOption[]
}

export default function ClientFormContainer({
  userId,
  projects,
}: ClientFormContainerProps) {
  const [selectedProject, setSelectedProject] = useState<string>('')

  const handleProjectChange = (value: string) => {
    setSelectedProject(value === '__none__' ? '' : value)
  }

  const hasProjects = projects.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Gestión de Archivos del Proyecto
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona uno de tus proyectos para subir archivos relacionados.
        </p>
      </div>

      {/* Selector */}
      <div className="space-y-2">
        <Label htmlFor="project-select">Selecciona tu proyecto:</Label>
        <Select
          value={selectedProject || '__none__'}
          onValueChange={handleProjectChange}
          disabled={!hasProjects}
        >
          <SelectTrigger id="project-select" className="w-full">
            <SelectValue placeholder="— Ninguno —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— Ninguno —</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hasProjects && (
          <p className="text-sm text-muted-foreground">
            No tienes proyectos asociados actualmente.
          </p>
        )}
      </div>

      {/* Subida */}
      {selectedProject && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-base font-semibold mb-2">Subir archivo</h3>
            <FileUploadForm
              userId={userId}
              projectId={selectedProject}
              isAdmin={false}
              onUploaded={() => window.location.reload()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
