// src/app/admin/profile/page.tsx
'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import languageOptions from '@/data/languageOptions.json';
import currencyOptions from '@/data/currencyOptions.json';
import timezoneOptions from '@/data/timezoneOptions.json';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    lastname: '',
    agencyName: '',
    bio: '',
    language: '',
    theme: 'light',
    currency: 'USD',
    timezone: '',
    avatar: '/user.ico',
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status !== 'authenticated') return;

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/users/me');
        const json = await res.json();
        const user = json.user;

        setForm({
          name: user.name || '',
          lastname: user.lastname || '',
          agencyName: user.agencyName || '',
          bio: user.bio || '',
          language: user.language || 'es',
          theme: user.theme || 'light',
          currency: user.currency || 'USD',
          timezone: user.settings?.timezone || '',
          avatar: user.avatar || '/user.ico',
        });
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [status]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!result.secure_url) throw new Error('Upload failed.');
      setForm(prev => ({ ...prev, avatar: result.secure_url }));
    } catch {
      setError('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        settings: { timezone: form.timezone },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Update failed.');
    } else {
      setSuccess('Profile updated.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900 flex justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Profile</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={form.avatar}
              className="w-16 h-16 rounded-full border cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              alt="Avatar"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              ref={fileInputRef}
              className="hidden"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                <span className="text-xs text-gray-700">Uploading…</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{form.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user.email}</p>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input name="lastname" value={form.lastname} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agency Name</label>
            <input name="agencyName" value={form.agencyName} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <textarea name="bio" rows={4} value={form.bio} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Language</label>
            <select name="language" value={form.language} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white">
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
            <select name="theme" value={form.theme} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white">
              {currencyOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white">
              {timezoneOptions.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
