'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  ListChecksIcon,
} from 'lucide-react';
import clsx from 'clsx';

const adminLinks = [
  { href: '/admin', icon: HomeIcon, label: 'Inicio' },
  { href: '/admin/projects', icon: FolderIcon, label: 'Proyectos' },
  { href: '/admin/users', icon: UsersIcon, label: 'Usuarios' },
  { href: '/admin/tasks', icon: ListChecksIcon, label: 'Tareas' },
];

export default function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14 md:hidden">
      {adminLinks.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            'flex flex-col items-center justify-center text-xs',
            pathname === href
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-300 hover:text-blue-500'
          )}
        >
          <Icon className="w-5 h-5 mb-0.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
