'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Home,
  Globe,
  Layers,
  Ticket,
  FolderKanban,
  ListChecks,
  FileText,
  Video,
  Users,
  Wallet,
  Receipt,
  LogOutIcon,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

const navGroups = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
      { label: 'Landing', href: '/admin/landing-settings', icon: <Globe size={18} /> },
      { label: 'Services', href: '/admin/services', icon: <Layers size={18} /> },
      { label: 'Posts', href: '/admin/posts', icon: <FileText size={18} /> },       // ← agregado
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Tickets', href: '/admin/tickets', icon: <Ticket size={18} /> },
      { label: 'Projects', href: '/admin/projects', icon: <FolderKanban size={18} /> },
      { label: 'Tasks', href: '/admin/tasks', icon: <ListChecks size={18} /> },
      { label: 'Files', href: '/admin/files', icon: <FileText size={18} /> },
      { label: 'Meetings', href: '/admin/meetings', icon: <Video size={18} /> },
    ],
  },
  {
    title: 'Users',
    items: [
      { label: 'All Users', href: '/admin/users', icon: <Users size={18} /> },
      { label: 'Verified Users', href: '/admin/verify', icon: <Layers size={18} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: <Wallet size={18} /> },
      { label: 'Pricing', href: '/admin/pricing', icon: <Wallet size={18} /> },
      { label: 'Quotes', href: '/admin/quotes', icon: <Receipt size={18} /> },
      { label: 'Invoices', href: '/admin/invoices', icon: <Receipt size={18} /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const fallbackImage = '/user.ico';

  // Fetch user avatar once session is ready
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await fetch('/api/users/me');
        const { user } = await res.json();
        const avatar = user.avatar || '';
        setAvatarUrl( avatar.startsWith('http') ? avatar : fallbackImage );
      } catch {
        setAvatarUrl(fallbackImage);
      }
    })();
  }, [session]);

  // Close the mobile menu if you click outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (backdropRef.current && e.target === backdropRef.current) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const name = session?.user?.name || '';
  const email = session?.user?.email || '';
  const avatar = avatarUrl || fallbackImage;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-200
          md:translate-x-0 md:static md:flex md:flex-col
        `}
      >
        <div className="flex flex-col justify-between h-full p-4">
          <div>
            {/* Close icon on mobile */}
            <div className="flex items-center justify-between md:hidden mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Menu
              </h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile section */}
            <div className="flex flex-col items-center mb-8">
              <Image
                src={avatar}
                alt="Avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              <div className="text-center mt-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="mt-4 w-full px-4 py-2 text-sm border rounded-lg
                           text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600
                           hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map(({ label, href, icon }) => (
                      <li key={href}>
                        <Link href={href}>
                          <span
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                              transition-colors
                              ${pathname === href
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                            `}
                            onClick={() => setIsOpen(false)}
                          >
                            {icon}
                            {label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 text-center mt-10">
            &copy; {new Date().getFullYear()} Rivas Technologies LLC
          </div>
        </div>
      </aside>
    </>
  );
}
