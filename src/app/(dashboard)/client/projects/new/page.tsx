import NewProjectClient from './NewProjectClient'
import { getAllServices } from '@/actions/serviceActions'
import type { IService } from '@/models/Service.model'

export const metadata = {
  title: 'Nuevo Proyecto',
}

export default async function NewProjectPage() {
  // ← aquí aplicamos el cast
  const servicios = (await getAllServices()) as unknown as IService[]
  return <NewProjectClient initialServices={servicios} />
}
