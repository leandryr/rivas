import NewProjectClient from '././NewProjectClient';
import { getAllServices } from '@/actions/serviceActions';
import type { IService } from '@/models/Service.model';

export const metadata = {
  title: 'Nuevo Proyecto',
};

export default async function NewProjectPage() {
  const servicios: IService[] = await getAllServices();
  return <NewProjectClient initialServices={servicios} />;
}