'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type User = {
  _id: string;
  name: string;
  lastname?: string;
  email: string;
  role: string;
  provider: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  hasValidPaymentMethod?: boolean;
  stripeCustomerId?: string;
  paymentMethodDetails?: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  avatar?: string;
  createdAt: string;
  agencyName?: string;
  subdomain?: string;
  company?: string;
  bio?: string;
  language?: string;
  otherLanguages?: { code: string; level: string }[];
  services?: string[];
  category?: string;
  location?: string;
  teamSize?: string;
  currency?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Todos los Usuarios</h1>

      {loading ? (
        <p className="text-gray-500">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2">Avatar</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Correo</th>
                <th className="p-2">Rol</th>
                <th className="p-2">Proveedor</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Email Verificado</th>
                <th className="p-2">Teléfono Verificado</th>
                <th className="p-2">Pago Válido</th>
                <th className="p-2">Tarjeta</th>
                <th className="p-2">Agencia / Empresa</th>
                <th className="p-2">Categoría</th>
                <th className="p-2">Servicios</th>
                <th className="p-2">Ubicación</th>
                <th className="p-2">Moneda</th>
                <th className="p-2">Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="avatar" width={32} height={32} className="rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    )}
                  </td>
                  <td className="p-2">{user.name} {user.lastname || ''}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.provider}</td>
                  <td className="p-2">{user.phone || '—'}</td>
                  <td className="p-2">{user.isEmailVerified ? '✅' : '❌'}</td>
                  <td className="p-2">{user.isPhoneVerified ? '✅' : '❌'}</td>
                  <td className="p-2">{user.hasValidPaymentMethod ? '✅' : '❌'}</td>
                  <td className="p-2">
                    {user.paymentMethodDetails?.last4
                      ? `${user.paymentMethodDetails.brand} •••• ${user.paymentMethodDetails.last4}`
                      : '—'}
                  </td>
                  <td className="p-2">
                    {user.agencyName || user.company || '—'}
                  </td>
                  <td className="p-2">{user.category || '—'}</td>
                  <td className="p-2">
                    {user.services?.length ? user.services.join(', ') : '—'}
                  </td>
                  <td className="p-2">{user.location || '—'}</td>
                  <td className="p-2">{user.currency || '—'}</td>
                  <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
