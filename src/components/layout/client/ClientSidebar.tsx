'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  TicketIcon,
  FolderIcon,
  CalendarIcon,
  FileTextIcon,
  UserIcon,
  LogOutIcon,
  LockIcon,
  MailIcon,
} from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  protected: boolean;
}

const links: NavLink[] = [
  { href: '/client',            label: 'Dashboard',       icon: HomeIcon,        protected: false },
  { href: '/client/support',    label: 'Support Tickets', icon: TicketIcon,     protected: true  },
  { href: '/client/projects',   label: 'Projects',        icon: FolderIcon,      protected: false },
  { href: '/client/meetings',   label: 'Meetings',        icon: CalendarIcon,    protected: false },
  { href: '/client/files',      label: 'Documents',       icon: FileTextIcon,    protected: false },
  { href: '/client/quotes',     label: 'Quotes',          icon: FileTextIcon,    protected: false },
  { href: '/client/invoices',   label: 'Invoices',        icon: FileTextIcon,    protected: false },
  { href: '/client/profile',    label: 'Profile',         icon: UserIcon,        protected: false },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string>('/user.ico');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const name = session?.user?.name || '';
  const email = session?.user?.email || '';

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await fetch('/api/users/me');
        const { user } = await res.json();
        const dbAvatar = user.avatar || '';
        setAvatarUrl(dbAvatar.startsWith('http') ? dbAvatar : '/user.ico');
        setIsEmailVerified(!!user.isEmailVerified);
      } catch {
        setAvatarUrl('/user.ico');
        setIsEmailVerified(false);
      }
    })();
  }, [session]);

  const handleRestrictedClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const goToVerification = () => {
    setShowToast(false);
    router.push('/client/verify');
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-5 right-5 z-50">
          <div className="flex items-start w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow" role="alert">
            <div className="inline-flex items-center justify-center w-8 h-8 mt-1 text-red-500 bg-red-100 rounded-lg">
              <LockIcon className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm font-normal flex-1">
              <p className="mb-1">You must verify your email to access this section.</p>
              <button
                onClick={goToVerification}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Verify now
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-900 h-screen border-r border-gray-200 dark:border-gray-700 px-4 py-6 flex-col">
        {/* Avatar & Logout */}
        <div className="flex flex-col items-center w-full mb-8">
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          <div className="text-center mt-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
            <div className="flex justify-center items-center gap-2 mt-2 text-sm">
              <MailIcon className="w-4 h-4" />
              <span className={isEmailVerified ? 'text-green-600' : 'text-red-500'}>
                {isEmailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-4 w-full px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 w-full">
          {links.map(({ href, label, icon: Icon, protected: isProtected }) => {
            const allowed = !isProtected || isEmailVerified;
            if (allowed) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-lg text-sm font-medium',
                    pathname === href
                      ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {label}
                </Link>
              );
            } else {
              return (
                <button
                  key={href}
                  onClick={handleRestrictedClick}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed w-full"
                >
                  <LockIcon className="w-4 h-4 mr-3" />
                  {label}
                </button>
              );
            }
          })}
        </nav>
      </aside>
    </>
  );
}
