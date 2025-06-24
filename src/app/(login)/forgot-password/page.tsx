'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus('success');
      router.push('/login?resetRequested=true');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Unexpected error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center px-8 lg:px-16">
        <h2 className="text-2xl font-bold mb-6">We are leaders in technology</h2>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="mr-3 text-blue-600">✔</span>
            <div>
              <p className="font-semibold">Secure reset process</p>
              <p className="text-sm text-gray-600">
                Our password reset system is built with security and reliability in mind.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-10 text-sm text-gray-500 flex gap-6">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-gray-600 mt-1">
              Enter your email and we’ll send you a link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />

            {message && (
              <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center"
            >
              {status === 'loading' ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
