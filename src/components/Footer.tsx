// src/components/Footer.tsx

import Image from 'next/image'
import type { ILandingConfig } from '@/models/LandingConfig.model'

interface FooterProps {
  config: ILandingConfig
}

export default function Footer({ config }: FooterProps) {
  return (
    <footer className="bg-white text-gray-800 py-10 px-6 text-sm border-t mt-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-0 gap-10 md:px-20">
        {/* Logo + Social + Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          {config.logoUrl && (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={150}
              height={60}
              className="mx-auto md:mx-0"
            />
          )}
          <p className="text-gray-600">{config.footer?.copyrightText}</p>
          <div className="flex gap-4 justify-center md:justify-start">
            {Object.entries(config.socialLinks || {}).map(([platform, url]) =>
              url ? (
                <a
                  key={platform}
                  href={String(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-100 opacity-70 transition"
                >
                  <Image
                    src={`/rrss/${platform}.webp`}
                    alt={platform}
                    width={24}
                    height={24}
                  />
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Contacto + Links legales */}
        <div className="space-y-3 text-center md:text-right text-gray-700 flex flex-col items-center md:items-end">
          <p><strong>Dirección:</strong> {config.contactInfo?.address}</p>
          <p><strong>Teléfono:</strong> {config.contactInfo?.phone}</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${config.contactInfo?.email}`} className="underline hover:text-blue-600">
              {config.contactInfo?.email}
            </a>
          </p>
          <p className="pt-2 space-x-2">
            <a
              href={String(config.footer?.privacyLink || '#')}
              className="underline hover:text-blue-600"
            >
              Política de Privacidad
            </a>
            <span>|</span>
            <a
              href={String(config.footer?.termsLink || '#')}
              className="underline hover:text-blue-600"
            >
              Términos y Condiciones
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
