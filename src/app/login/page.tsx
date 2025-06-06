"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/auth/validate-session")
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.role === "admin") {
            router.replace("/admin");
          } else if (json.ok && json.role === "client") {
            router.replace("/client");
          }
        })
        .catch(() => {});
    }
  }, [status, session, router]);

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/login" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErrorMsg(res.error);
    }
  };

  if (status === "loading") {
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
    );
  }

  if (status === "authenticated") return null;

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
                Built by experts and designed to scale. Our platform delivers speed, security, and flexibility for high-performing businesses.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-blue-600">✔</span>
            <div>
              <p className="font-semibold">Smart management for global leaders</p>
              <p className="text-sm text-gray-600">
                Streamline operations, connect teams, and make data-driven decisions — all from one powerful platform.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-blue-600">✔</span>
            <div>
              <p className="font-semibold">Trusted worldwide</p>
              <p className="text-sm text-gray-600">
                Adopted by organizations and communities across the globe. Chosen by those who demand results, not promises.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-10 text-sm text-gray-500 flex gap-6">
          <a href="#">About</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-center px-6 py-12 min-h-screen md:min-h-0">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-center">Welcome back</h1>
            <p className="text-sm text-gray-600 mt-1 text-center">
              Or <a href="/register" className="text-blue-600">Sign up here</a>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGoogle}
              className="flex items-center gap-3 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition"
            >
              <img src="/google.svg" alt="Google icon" className="w-5 h-5" />
              <span>Log in with Google</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
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
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
