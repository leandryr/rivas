'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const FILE_TYPES = ['document', 'image', 'video', 'screenshot'] as const
type FileType = typeof FILE_TYPES[number]

interface FileUploadFormProps {
  userId: string           // uploader real (admin o cliente)
  projectId: string
  isAdmin: boolean
  onUploaded: () => void
  forClientId?: string     // ✅ añadir este campo opcional
}

export default function FileUploadForm({
  userId,
  projectId,
  isAdmin,
  onUploaded,
  forClientId,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [fileType, setFileType] = useState<FileType>('document')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Selecciona un archivo.')
      return
    }

    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('fileType', fileType)
    formData.append('isAdmin', isAdmin ? 'true' : 'false')

    // uploader real (admin o cliente)
    formData.append('uploaderId', userId)

    // si admin, también incluir el cliente destino
    if (isAdmin && forClientId) {
      formData.append('forClientId', forClientId)
    }

    if (title.trim()) {
      formData.append('title', title.trim())
    }

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir archivo')

      onUploaded()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error desconocido')
    } finally {
      setUploading(false)
      setFile(null)
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Factura de abril, foto de avance, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Archivo</Label>
        <Input id="file" type="file" onChange={handleFileChange} />
        {file && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Archivo seleccionado: <strong>{file.name}</strong>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipo de archivo</Label>
        <Select
          value={fileType}
          onValueChange={(value) => setFileType(value as FileType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo..." />
          </SelectTrigger>
          <SelectContent>
            {FILE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'document'
                  ? 'Documento'
                  : type === 'image'
                  ? 'Imagen'
                  : type === 'video'
                  ? 'Video'
                  : 'Captura'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={uploading}>
        {uploading ? 'Subiendo...' : 'Subir archivo'}
      </Button>
    </form>
  )
}
