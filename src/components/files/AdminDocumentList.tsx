'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FileAssetDTO {
  _id: string
  originalName: string
  title?: string
  url: string
  fileType: 'document' | 'image' | 'video' | 'screenshot'
  forProject: { _id: string; title: string } | null
  forClient?: { _id: string; name: string; lastname?: string } // ✅ AÑADIDO
  isAdminUpload: boolean
  createdAt: string
  uploader: {
    _id: string
    name: string
    lastname?: string
    email?: string
    role?: 'admin' | 'client'
  } | null
}

interface ApiResponse {
  docs: FileAssetDTO[]
  total?: number
  page?: number
  totalPages?: number
}

export default function AdminDocumentList() {
  const [files, setFiles] = useState<FileAssetDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const buildQuery = () => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    if (searchTerm.trim()) params.set('q', searchTerm.trim())
    return params.toString()
  }

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQuery()
      const res = await fetch(`/api/files?${qs}`)
      if (!res.ok) throw new Error('Error al cargar documentos')

      const json: ApiResponse | FileAssetDTO[] = await res.json()
      let docs: FileAssetDTO[] = []
      let tp = 1

      if (Array.isArray(json)) {
        docs = json
      } else {
        docs = json.docs
        tp = json.totalPages ?? 1
      }

      setFiles(docs)
      setTotalPages(tp)
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
      setFiles([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [page, searchTerm])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/download?fileId=${fileId}`)
      const data = await res.json()
      if (!res.ok || !data.downloadUrl) throw new Error('No se pudo obtener el enlace de descarga.')
      window.open(data.downloadUrl, '_blank')
    } catch (err) {
      console.error(err)
      alert('Error al intentar descargar el archivo.')
    }
  }

  const getUploaderDisplayName = (file: FileAssetDTO): string => {
    if (file.uploader) {
      const fullName = `${file.uploader.name}${file.uploader.lastname ? ' ' + file.uploader.lastname : ''}`
      const roleLabel = file.uploader.role === 'admin' ? 'Admin' : 'Cliente'
      return `${roleLabel} (${fullName})`
    }
    return file.isAdminUpload ? 'Admin (Desconocido)' : 'Cliente (Desconocido)'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar por nombre o proyecto..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>

      <div className="hidden md:block overflow-auto rounded-lg shadow border dark:border-gray-800">
        <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Archivo</th>
              <th className="px-4 py-3 font-semibold">Proyecto</th>
              <th className="px-4 py-3 font-semibold">Subido por</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {loading || error || files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  {loading
                    ? 'Cargando documentos…'
                    : error
                    ? error
                    : 'No se encontraron documentos.'}
                </td>
              </tr>
            ) : (
              files.map((f) => {
                const date = new Date(f.createdAt).toLocaleDateString()
                const time = new Date(f.createdAt).toLocaleTimeString()
                return (
                  <tr key={f._id}>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">{f.originalName}</div>
                      {f.title && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Título: {f.title}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{f.forProject?.title || '-'}</td>
                    <td className="px-4 py-2">
                      {getUploaderDisplayName(f)}
                      {f.forClient && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Para: {f.forClient.name} {f.forClient.lastname || ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {date}{' '}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({time})
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(f._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" /> Descargar
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile layout */}
      <div className="block md:hidden space-y-4">
        {files.map((f) => {
          const date = new Date(f.createdAt).toLocaleDateString()
          const time = new Date(f.createdAt).toLocaleTimeString()
          return (
            <div
              key={f._id}
              className="border rounded p-4 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800"
            >
              <h3 className="font-bold text-lg mb-1">{f.originalName}</h3>
              {f.title && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Título: {f.title}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Proyecto: {f.forProject?.title || '-'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Subido por: {getUploaderDisplayName(f)}
              </p>
              {f.forClient && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Para: {f.forClient.name} {f.forClient.lastname || ''}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Fecha: {date}{' '}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({time})
                </span>
              </p>
              <Button
                size="sm"
                onClick={() => handleDownload(f._id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-1" /> Descargar
              </Button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {(page - 1) * limit + 1} –{' '}
          {Math.min(page * limit, totalPages * limit)} de{' '}
          {totalPages * limit}
        </p>
        <div className="inline-flex items-center space-x-1 text-sm border rounded overflow-hidden dark:border-gray-700">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
          >
            {'<'}
          </button>
          {[...Array(Math.min(3, totalPages))].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 ${
                page === i + 1
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {totalPages > 3 && <span className="px-2 py-1">...</span>}
          {totalPages > 3 && (
            <button
              onClick={() => setPage(totalPages)}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {totalPages}
            </button>
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  )
}
