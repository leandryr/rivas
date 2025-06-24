// src/components/ui/avatar.tsx
'use client'

import React from 'react'
import Image from 'next/image'

export interface AvatarProps {
  /** URL de la imagen de perfil */
  src?: string
  /** Texto alternativo o nombre completo del usuario */
  alt: string
  /** Tamaño en píxeles del avatar (ancho y alto) */
  size?: number
}

export function Avatar({ src, alt, size = 40 }: AvatarProps) {
  // Calcula iniciales a partir del nombre
  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="
        relative inline-flex items-center justify-center
        rounded-full bg-gray-200 text-gray-700 font-semibold
        overflow-hidden
      "
      style={{ width: size, height: size }}
      title={alt}
    >
      {src ? (
        // Si nos pasan URL, usamos next/image para optimizarla
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        // Si no, mostramos las iniciales
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      )}
    </div>
  )
}

export default Avatar
