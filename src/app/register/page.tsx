'use client';

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    company: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/auth/validate-session')
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.role === 'admin') {
            router.replace('/admin')
          } else if (json.ok && json.role === 'client') {
            router.replace('/client')
          }
        })
        .catch(() => {})
    }
  }, [status, session, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Registration failed')
      setLoading(false)
      return
    }

    const login = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    })

    if (login?.error) {
      router.push('/login')
    } else {
      router.push('/client')
    }
  }

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/client' })
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div
            className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"
            role="status"
          />
          <p className="text-gray-500 text-sm">Checking session…</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center px-8 lg:px-16">
        <h2 className="text-2xl font-bold mb-6">We are leaders in technology</h2>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="mr-3 text-blue-600">✔</span>
            <div>
              <p className="font-semibold">World-class technology</p>
              <p className="text-sm text-gray-600">
                Built by experts and designed to scale. Security, speed, and flexibility for modern businesses.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-blue-600">✔</span>
            <div>
              <p className="font-semibold">Smart management for leaders</p>
              <p className="text-sm text-gray-600">
                Manage your project, connect your team, and make data-driven decisions—all in one place.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-10 text-sm text-gray-500 flex gap-6">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center px-6 py-12 min-h-screen md:min-h-0">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-center">Create your account</h1>
            <p className="text-sm text-gray-600 mt-1 text-center">
              Already have an account? <a href="/login" className="text-blue-600">Sign in</a>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGoogle}
              className="flex items-center gap-3 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition"
            >
              <Image src="/google.svg" alt="Google icon" width={20} height={20} />
              <span>Sign up with Google</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
                name="name"
                placeholder="First name*"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
                name="lastname"
                placeholder="Last name*"
                value={form.lastname}
                onChange={handleChange}
                required
              />
            </div>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              name="company"
              placeholder="Company (optional)"
              value={form.company}
              onChange={handleChange}
            />
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              type="email"
              name="email"
              placeholder="Email*"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              type="password"
              name="password"
              placeholder="Password*"
              value={form.password}
              onChange={handleChange}
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" required />
              I agree to the <a href="/terms" className="text-blue-600">Terms</a> and <a href="/privacy" className="text-blue-600">Privacy Policy</a>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
