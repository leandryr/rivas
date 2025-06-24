'use client';

import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {session?.user?.name}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        This is your admin dashboard. From here you can manage services, users, projects, and more.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold">Service Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage the system's active services.
          </p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold">Registered Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage permissions, roles, and verifications.
          </p>
        </div>
      </div>
    </div>
  );
}
