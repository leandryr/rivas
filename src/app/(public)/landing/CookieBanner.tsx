// src/app/(public)/landing/CookieBanner.tsx
"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const acceptedCookies = localStorage.getItem("cookiesAccepted");
    if (acceptedCookies === "true") setAccepted(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-sm text-center md:text-left">
        Utilizamos cookies para mejorar la experiencia. Al seguir navegando, aceptas nuestra{" "}
        <a href="/privacy" className="underline text-blue-400 hover:text-blue-300">
          Política de Privacidad
        </a>.
      </p>
      <button
        onClick={handleAccept}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium transition"
      >
        Aceptar Cookies
      </button>
    </div>
  );
}
