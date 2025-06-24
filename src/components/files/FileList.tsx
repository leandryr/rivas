'use client'

import React, { useEffect, useState } from 'react'

interface FileAssetDTO {
  _id: string
  originalName: string
  title?: string
  url: string
  fileType: 'document' | 'image' | 'video' | 'screenshot'
  isAdminUpload: boolean
  createdAt: string
  forProject: { _id: string; title: string } | null
  forClient?: {
    _id: string
    name: string
    lastname?: string
  }
  uploader: {
    _id: string
    name: string
    lastname?: string
    email?: string
    role?: 'admin' | 'client'
  } | null
}

interface FileListProps {
  userId?: string
  projectId?: string
  limit?: number
}

export function FileList({ userId, projectId, limit = 10 }: FileListProps) {
  const [files, setFiles] = useState<FileAssetDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams()
        if (userId) params.set('userId', userId)
        if (projectId) params.set('projectId', projectId)
        if (debouncedQuery) params.set('q', debouncedQuery)
        params.set('page', String(page))
        params.set('limit', String(limit))

        const res = await fetch(`/api/files?${params.toString()}`)
        const json = await res.json()

        if (!res.ok) throw new Error(json.error || 'Error al obtener archivos')

        const data: FileAssetDTO[] = Array.isArray(json) ? json : json.docs
        setFiles(data)
        setTotalPages(json.totalPages || 1)
      } catch (err: any) {
        setError(err.message || 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [userId, projectId, debouncedQuery, page, limit])

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/download?fileId=${fileId}`)
      const data = await res.json()
      if (!res.ok || !data.downloadUrl) throw new Error('No se pudo descargar el archivo')
      window.open(data.downloadUrl, '_blank')
    } catch (err: any) {
      alert(err.message || 'Error al descargar')
    }
  }

  const formatUploader = (u: FileAssetDTO['uploader'], fallback: boolean) => {
    if (!u) return fallback ? 'Admin (Desconocido)' : 'Cliente (Desconocido)'
    const role = u.role === 'admin' ? 'Admin' : 'Cliente'
    return `${role} (${u.name}${u.lastname ? ` ${u.lastname}` : ''})`
  }

  const renderDate = (iso: string) => {
    const date = new Date(iso)
    return `${date.toLocaleDateString('es-ES')} (${date.toLocaleTimeString('es-ES')})`
  }

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Buscar por nombre, título, ID, uploader, etc..."
        className="w-full px-4 py-2 border rounded text-sm"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Cargando archivos…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-gray-500">No hay archivos disponibles.</p>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-300">
                    <th className="p-2">Archivo</th>
                    <th className="p-2">Proyecto</th>
                    <th className="p-2">Subido por</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr key={f._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2">
                        <div className="font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => handleDownload(f._id)}>
                          {f.originalName}
                        </div>
                        {f.title && <div className="text-xs text-muted-foreground">Título: {f.title}</div>}
                      </td>
                      <td className="p-2">{f.forProject?.title || '-'}</td>
                      <td className="p-2">{formatUploader(f.uploader, f.isAdminUpload)}</td>
                      <td className="p-2 text-xs">{renderDate(f.createdAt)}</td>
                      <td className="p-2">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1 rounded"
                          onClick={() => handleDownload(f._id)}
                        >
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden space-y-3">
            {files.map((f) => (
              <div key={f._id} className="border rounded p-3 text-sm shadow-sm">
                <p className="font-semibold text-blue-700">{f.originalName}</p>
                {f.title && <p className="text-muted-foreground">Título: {f.title}</p>}
                <p>Proyecto: {f.forProject?.title || '-'}</p>
                <p>Subido por: {formatUploader(f.uploader, f.isAdminUpload)}</p>
                <p className="text-xs text-muted-foreground">Fecha: {renderDate(f.createdAt)}</p>
                <button
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1 rounded"
                  onClick={() => handleDownload(f._id)}
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-500">
              Mostrando {(page - 1) * limit + 1}–{(page - 1) * limit + files.length} de {totalPages * limit}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {'<'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                {'>'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
