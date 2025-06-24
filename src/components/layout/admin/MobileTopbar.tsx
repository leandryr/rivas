// src/components/MobileTopbar.tsx
'use client';

import { useTheme } from 'next-themes';
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  LogOutIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function MobileTopbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [fullName, setFullName] = useState('Admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) throw new Error('Failed to fetch user');
        const { user } = await res.json();
        const name =
          user.lastname && user.name
            ? `${user.name} ${user.lastname}`
            : user.name || 'Admin';
        setFullName(name);
      } catch {
        setFullName('Admin');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex md:hidden w-full px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm items-center justify-between relative">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white">
        <span>{fullName}</span>
        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold ml-2">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Aquí se muestra el dropdown de notificaciones */}
        <NotificationsDropdown />

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Menú de perfil */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
            aria-label="Profile menu"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-50">
              <button
                onClick={() => {
                  router.push('/admin/profile');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Perfil
              </button>
              <button
                onClick={() => {
                  router.push('/admin/settings');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Configuración
              </button>
              <button
                onClick={() => {
                  router.push('/admin/verifications');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Verificaciones
              </button>
              <hr className="border-gray-200 dark:border-gray-600" />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-4 py-2 text-sm"
              >
                <LogOutIcon className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
