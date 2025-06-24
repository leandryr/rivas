"use client";

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const formContainer = "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 px-4";
const cardContainer = "w-full max-w-3xl bg-white dark:bg-gray-800 shadow rounded-lg p-8";
const sectionTitle = "text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100";
const fieldWrapper = "mb-4";
const labelStyle = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";
const inputStyle = "w-full px-4 py-2 rounded border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500";
const textareaStyle = inputStyle;
const helpText = "text-xs mt-1 text-gray-500 dark:text-gray-400";
const profileHeader = "flex items-center gap-4 mb-8";
const userName = "font-semibold text-gray-900 dark:text-gray-100";
const userEmail = "text-sm text-gray-500 dark:text-gray-400";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ProfileData {
  name: string;
  lastname: string;
  company: string;
  email: string;
  avatar: string;
  bio: string;
  language: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    lastname: '',
    company: '',
    email: '',
    avatar: '/user.ico',
    bio: '',
    language: '',
  });

  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Unable to fetch profile.');

        const json = await res.json();
        const data: ProfileData = json.user;

        setFormData({
          name: data.name,
          lastname: data.lastname || '',
          company: data.company || '',
          email: data.email,
          avatar: data.avatar || '/user.ico',
          bio: data.bio || '',
          language: data.language || '',
        });
      } catch (err: any) {
        setError(err.message || 'Error loading profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, router]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || 'Error uploading to Cloudinary.');

      setFormData(prev => ({
        ...prev,
        avatar: result.secure_url,
      }));
    } catch (err: any) {
      setError(err.message || 'Error uploading avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: formData.name,
      lastname: formData.lastname,
      company: formData.company,
      avatar: formData.avatar,
      bio: formData.bio,
      language: formData.language,
    };

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Error updating profile.');
      }
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Error updating profile.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className={formContainer}>
      <div className={cardContainer}>
        <h1 className={sectionTitle}>My Profile</h1>

        <div className={profileHeader}>
          <div className="relative">
            <img
              src={formData.avatar}
              alt="Avatar"
              onClick={triggerFileSelect}
              className="w-16 h-16 rounded-full border-2 border-gray-300 cursor-pointer"
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-full">
                <span className="text-sm text-gray-700">Uploading…</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div>
            <p className={`${userName} text-lg`}>
              {formData.name} {formData.lastname}
            </p>
            <p className={userEmail}>{formData.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-600 border border-red-200 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-green-700 border border-green-200 px-4 py-2 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className={labelStyle}>
                First Name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`${inputStyle}`}
              />
            </div>
            <div>
              <label htmlFor="lastname" className={labelStyle}>
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className={`${inputStyle}`}
              />
            </div>
          </div>

          <div className={fieldWrapper}>
            <label htmlFor="company" className={labelStyle}>
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Optional"
              value={formData.company}
              onChange={handleChange}
              className={`${inputStyle}`}
            />
          </div>

          <input
            type="hidden"
            id="avatar"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
          />

          <div className={fieldWrapper}>
            <label htmlFor="bio" className={labelStyle}>
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Tell us something about you..."
              value={formData.bio}
              onChange={handleChange}
              className={`${textareaStyle}`}
            />
          </div>

          <div className={fieldWrapper}>
            <label htmlFor="language" className={labelStyle}>
              Preferred Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              placeholder="e.g. English, Spanish"
              value={formData.language}
              onChange={handleChange}
              className={`${inputStyle}`}
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full md:w-auto inline-flex justify-center rounded-md border border-transparent bg-blue-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
