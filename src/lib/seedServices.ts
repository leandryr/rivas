'use server';

import connectDB from '@/lib/db';
import Service from '@/models/Service.model';

const defaultServices = [
  {
    name: 'Programación y Tecnología',
    description: 'Programación de sitios webs, e-commerce y apps mobile.',
    modalities: ['Por proyecto', 'Por hora'],
    subCategories: [
      'Programación Web',
      'Diseño Web',
      'Tiendas Online (e-commerce)',
      'Wordpress',
      'Programación de Apps. Android, iOS y otros',
      'Data Science',
      'Aplicaciones de escritorio',
      'Inteligencia Artificial',
      'Otros',
    ],
  },
  {
    name: 'Finanzas y Negocios',
    description: 'Servicios de análisis, gestión y estrategia financiera.',
    modalities: ['Por proyecto', 'Por hora'],
    subCategories: [
      'Relevamiento de datos',
      'Gestionar proyectos',
      'Hacer reclutamiento',
      'Planeamiento estratégico',
      'Tareas de Contabilidad',
      'Inteligencia Artificial',
      'Otros',
    ],
  },
  {
    name: 'Diseño y Multimedia',
    description: 'Logos, diseño de sitios web, videos, ilustraciones, etc.',
    modalities: ['Por proyecto', 'Por hora'],
    subCategories: [
      'Diseño de Logo',
      'Diseño Web',
      'Banners',
      'Ilustraciones',
      'Crear o editar video',
      'Infografías',
      'Imágenes para redes sociales',
      'Diseño de App Móvil',
      'Imagen Corporativa',
      'Modelos 3D',
      'Landing Page',
      'Diseño de moda',
      'Inteligencia Artificial',
      'Otros',
    ],
  },
  {
    name: 'Abogados y Consultoría Legal',
    description: 'Consultas legales, servicios paralegales y asesoría jurídica.',
    modalities: ['Por proyecto', 'Por hora'],
    subCategories: [
      'Consultas Legales',
      'Servicios Paralegales',
      'Redacción de Contratos',
      'Revisión de Documentos Legales',
      'Planificación Patrimonial',
      'Cumplimiento Normativo',
      'Asesoramiento Corporativo',
      'Otros',
    ],
  },
];

export async function seedServices() {
  await connectDB();
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany(defaultServices);
    console.log('Servicios insertados exitosamente');
  } else {
    console.log('Ya existen servicios, omitiendo inserción');
  }
}
