// components/ShareButtons.tsx
'use client'

import React from 'react'
import {
  FaFacebookF,
  FaTwitter,
  FaLink as FaLinkIcon,
  FaWhatsapp,
  FaLinkedinIn,
  FaShareAlt,
} from 'react-icons/fa'

interface ShareButtonsProps {
  /** URL completa de la página a compartir */
  url: string
  /** Título del artículo o página */
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const handleCopy = () => {
    if (!navigator.clipboard) {
      alert('Clipboard API no está disponible en este navegador')
      return
    }
    navigator.clipboard.writeText(url)
    alert('Enlace copiado al portapapeles')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (err) {
        console.warn('Web Share falló:', err)
      }
    } else {
      alert('La función de compartir no está disponible en este dispositivo.')
    }
  }

  return (
    <div className="flex space-x-3 text-gray-700">
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Compartir en Facebook"
      >
        <FaFacebookF />
      </a>

      {/* Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Compartir en Twitter"
      >
        <FaTwitter />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${title} ${url}`
        )}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Compartir en WhatsApp"
      >
        <FaWhatsapp />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Compartir en LinkedIn"
      >
        <FaLinkedinIn />
      </a>

      {/* Botón nativo (para Instagram en móvil, etc) */}
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Compartir…"
        type="button"
      >
        <FaShareAlt />
      </button>

      {/* Copiar enlace */}
      <button
        onClick={handleCopy}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Copiar enlace"
        type="button"
      >
        <FaLinkIcon />
      </button>
    </div>
  )
}
