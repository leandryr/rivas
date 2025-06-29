"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import languageOptions from "@/data/languageOptions.json";

interface NavbarClientProps {
  logoUrl: string;
  primaryColor: string;
}

function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function NavbarClient({
  logoUrl,
  primaryColor,
}: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("es");

  const handleResize = useCallback(() => {
    if (window.innerWidth > 768 && menuOpen) {
      setMenuOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    const stored = localStorage.getItem("preferredLanguage");
    if (stored) setLanguage(stored);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setLanguage(selected);
    localStorage.setItem("preferredLanguage", selected);
    // Puedes agregar lógica adicional para actualizar el contexto del idioma
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image src={logoUrl} alt="Logo" width={140} height={60} />
        </a>

        {/* Botón hamburguesa */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Image
            src="/hamburguesa.png"
            alt="Menú"
            width={32}
            height={32}
            style={{ color: "currentColor" }}
          />
        </button>

        {/* Menú de escritorio */}
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-700">
          <a href="/landing#services" className="hover:text-gray-900">Servicios</a>
          <a href="/landing#portfolio" className="hover:text-gray-900">Portafolio</a>
          <a href="/landing#about" className="hover:text-gray-900">Acerca</a>
          <a href="/landing#contact" className="hover:text-gray-900">Contacto</a>
          <a href="/blog" className="hover:text-gray-900">Blog</a>
          <a
            href="/login"
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="text-white px-4 py-2 rounded hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            Registrarse
          </a>
          {/* Selector de idioma */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="ml-2 px-2 py-1 border rounded bg-white text-gray-800"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {getFlagEmoji(lang.flag)} {lang.label}
              </option>
            ))}
          </select>
        </nav>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 px-4 pb-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
          <a href="#services" onClick={() => setMenuOpen(false)}>Servicios</a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>Portafolio</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Acerca</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contacto</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="text-white px-4 py-2 rounded hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            Registrarse
          </a>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-2 py-1 border rounded bg-white text-gray-800"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {getFlagEmoji(lang.flag)} {lang.label}
              </option>
            ))}
          </select>
        </nav>
      )}
    </header>
  );
}
