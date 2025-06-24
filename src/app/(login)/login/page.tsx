// src/app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetRequested = searchParams.get('resetRequested') === 'true';

  const { data: session, status } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Si ya está autenticado, validamos rol y redirigimos
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/auth/validate-session')
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.role === 'admin') {
            router.replace('/admin');
          } else if (json.ok && json.role === 'client') {
            router.replace('/client');
          }
        })
        .catch(() => {});
    }
  }, [status, router]);

  // Login con Google: NextAuth se encarga de la redirección completa
  const handleGoogle = () => {
    signIn('google', {
      callbackUrl: `${window.location.origin}/client`,
    });
  };

  // Login con credenciales
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErrorMsg('Invalid email or password');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Panel informativo (desktop) */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center px-8 lg:px-16">
        <h2 className="text-2xl font-bold mb-6">We are leaders in technology</h2>
        <ul className="space-y-4">
          {[
            {
              title: 'World-class technology',
              desc:
                'Built by experts and designed to scale. Our platform delivers speed, security, and flexibility.',
            },
            {
              title: 'Smart management for global leaders',
              desc:
                'Streamline operations, connect teams, and make data-driven decisions.',
            },
            {
              title: 'Trusted worldwide',
              desc:
                'Adopted by organizations across the globe. Chosen by those who demand results.',
            },
          ].map((item) => (
            <li key={item.title} className="flex items-start">
              <span className="mr-3 text-blue-600">✔</span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-sm text-gray-500 flex gap-6">
          <a href="#">About</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Contact</a>
        </div>
      </div>

      {/* Formulario de login */}
      <div className="flex w-full md:w-1/2 justify-center items-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold">Welcome back</h1>
            <p className="text-sm text-gray-600 mt-1">
              Or{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up here
              </a>
            </p>
          </div>

          {/* Botón Google */}
          <div className="flex justify-center">
            <button
              onClick={handleGoogle}
              className="flex items-center gap-3 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition"
            >
              <Image src="/google.svg" alt="Google icon" width={20} height={20} />
              <span>Log in with Google</span>
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login con credenciales */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            {resetRequested && (
              <p className="text-sm text-green-600 text-center">
                If an account exists, we’ve sent a reset link to your email.
              </p>
            )}

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" />
                Remember me
              </label>
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign in to your account
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
