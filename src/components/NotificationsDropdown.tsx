// src/components/NotificationsDropdown.tsx
'use client';

import { useEffect, useState } from 'react';
import { BellIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notif {
  _id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Carga inicial + polling cada 15s
  useEffect(() => {
    let mounted = true;
    const load = () =>
      fetch('/api/notifications')
        .then(r => r.json())
        .then((data: Notif[]) => mounted && setNotifs(data))
        .catch(() => {});
    load();
    const iv = setInterval(load, 15_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifs(ns => ns.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const shortId = (id: string) => id.slice(-4);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-red-600 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-50">
          {notifs.length === 0
            ? <p className="p-4 text-center text-gray-500">No hay notificaciones.</p>
            : notifs.map(n => (
                <div
                  key={n._id}
                  className={`px-4 py-2 cursor-pointer ${n.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                  onClick={() => {
                    markAsRead(n._id);
                    router.push(n.link ?? '/client/quotes');
                    setOpen(false);
                  }}
                >
                  <p className="text-sm">
                    {n.message.replace(/#\w+/, `#${shortId(n._id)}`)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
