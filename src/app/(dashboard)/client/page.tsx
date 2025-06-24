'use client';

import { useSession } from 'next-auth/react';

export default function ClientDashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name || 'Cliente';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {name}</h1>
      <p className="text-gray-600 mb-6">
        Este es tu panel de cliente. Aquí puedes ver el estado de tus proyectos, contactar soporte y más.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Estado de Proyectos</h2>
          <p className="text-sm text-gray-500">Consulta el avance de los proyectos en los que estás involucrado.</p>
        </div>
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Soporte y Ayuda</h2>
          <p className="text-sm text-gray-500">Accede a soporte técnico o abre un ticket de consulta.</p>
        </div>
      </div>
    </div>
  );
}
