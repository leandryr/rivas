// src/app/(dashboard)/client/meetings/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import User, { IUser } from '@/models/User';
import MeetingToggle from '@/components/meetings/MeetingToggle';
import { MeetingList } from '@/components/meetings/MeetingList';

export const revalidate = 0; // Siempre SSR

export default async function ClientMeetingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Debes iniciar sesión para ver Reuniones.</p>
      </div>
    );
  }

  await connectDB();

  const userDoc: IUser | null = await User.findOne({ email: session.user.email }).lean();

  if (!userDoc) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Usuario no encontrado.</p>
      </div>
    );
  }

  const userIdStr = String(userDoc._id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Reuniones</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sección para agendar nueva reunión */}
        <section className="bg-white dark:bg-gray-900 border rounded shadow-sm p-4">
          <MeetingToggle userId={userIdStr} />
        </section>

        {/* Sección para listar reuniones del usuario */}
        <section className="bg-white dark:bg-gray-900 border rounded shadow-sm p-4">
          <MeetingList userId={userIdStr} />
        </section>
      </div>
    </div>
  );
}
