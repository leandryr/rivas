export const dynamic = 'force-dynamic';

import { cache } from 'react';
import Image from 'next/image';
import CookieBanner from './CookieBanner';
import NavbarClient from './NavbarClient';
import Testimonials from '@/components/landing/Testimonials'

interface LandingConfig {
  slug: string;
  logoUrl: string;
  primaryColor: string;
  hero: {
    backgroundImage: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  features: Array<{ iconUrl: string; title: string; description: string }>;
  portfolio: Array<{ imageUrl: string; title: string; category: string }>;
  stats: Array<{ value: string; label: string }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
    avatarUrl: string;
    flagUrl: string;
  }>;
  clientLogos: Array<string>;
  aboutText: string;
  mission: string;
  vision: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  contactInfo: {
    address: string;
    phone: string;
    email: string;
  };
  footer: {
    copyrightText: string;
    privacyLink: string;
    termsLink: string;
  };
}

const fetchLandingConfig = cache(async (slug: string): Promise<LandingConfig> => {
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/landing-config?slug=${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('No se pudo cargar la configuración de la landing.');
  return (await res.json()) as LandingConfig;
});

export default async function LandingPage() {
  const config = await fetchLandingConfig('home');

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <NavbarClient logoUrl={config.logoUrl} primaryColor={config.primaryColor} />
      <CookieBanner />

{/* Hero Section */}
<section className="bg-white py-30">
  <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-8 justify-items-center md:justify-items-start">
    {/* Texto */}
    <div className="relative z-10 animate-fadeInUp space-y-4 text-center md:text-left max-w-lg">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">
        {config.hero.title}
      </h1>
      <p className="text-lg text-gray-600">
        {config.hero.subtitle}
      </p>
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        <a
          href={config.hero.primaryButtonLink}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          {config.hero.primaryButtonText}
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
        <a
          href={config.hero.secondaryButtonLink}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
        >
          {config.hero.secondaryButtonText}
        </a>
      </div>
    </div>

    {/* Imagen a la derecha (oculta en <md) */}
    <div className="hidden md:flex justify-end">
      <img
        src={config.hero.backgroundImage}
        alt="Hero illustration"
        className="max-w-full h-auto"
      />
    </div>
  </div>
</section>

      {/* Logos */}
  {config.clientLogos?.length > 0 && (
    <section className="bg-gray-50 py-12 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex animate-marquee gap-12 w-max">
          {config.clientLogos.concat(config.clientLogos).map((logo, idx) => (
            <Image
              key={idx}
              src={logo}
              alt={`Client Logo ${idx}`}
              width={100}
              height={50}
              className="object-contain md:grayscale hover:grayscale-0 transition"
            />
          ))}
        </div>
      </div>
    </section>
  )}

  {/* Features */}
  {config.features?.length > 0 && (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Nuestros Servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {config.features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 duration-300"
            >
              {/* icon wrapper con fondo de marca */}
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded flex items-center justify-center">
                <Image
                  src={feature.iconUrl}
                  alt={feature.title}
                  width={24}
                  height={24}
                />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )}


{/* Portfolio */}
{config.portfolio?.length > 0 && (
  <section className="py-20 px-6 bg-white" id="portfolio">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Portafolio</h2>

      {/* Carrusel desktop automático */}
      <div className="hidden md:block overflow-hidden relative">
        <div className="flex gap-6 animate-marquee-portfolio w-max">
          {[...config.portfolio, ...config.portfolio].map((item, idx) => (
            <div
              key={idx}
              className="w-[380px] flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 duration-300"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={400}
                className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrusel móvil: 1 por vista, animación automática */}
      <div className="md:hidden overflow-hidden relative">
        <div className="flex gap-4 w-max animate-marquee-portfolio-movil">
          {[...config.portfolio, ...config.portfolio].map((item, idx) => (
            <div
              key={idx}
              className="w-[85vw] flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 duration-300"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={500}
                height={300}
                className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)}

      {/* Stats */}
{config.stats?.length > 0 && (
  <section className="bg-gray-50 py-20 px-6">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-12">Nuestras Estadísticas</h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {config.stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 animate-fadeInUp hover:shadow-md transition">
            <p className="text-4xl font-extrabold text-blue-600">{stat.value}</p>
            <p className="mt-2 text-gray-700 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
  {/* Testimonials */}
  <Testimonials testimonials={config.testimonials} />

      {/* About */}
        {(config.aboutText || config.mission || config.vision) && (
          <section id="about" className="bg-white py-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
                Acerca de Nosotros
              </h2>
              <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed mb-12">
                {config.aboutText}
              </p>

              <div className="grid md:grid-cols-2 gap-10 text-left">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Misión</h3>
                  <p className="text-gray-600 leading-relaxed">{config.mission}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Visión</h3>
                  <p className="text-gray-600 leading-relaxed">{config.vision}</p>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Contact CTA */}
      <section id="cta" className="py-20 bg-gray-50 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
        <p className="text-gray-600 mb-6">
          Crea tu cuenta gratis y configura tu panel en minutos. Estamos listos para ayudarte.
        </p>
        <a
          href="/register"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Registrarme y configurar mi panel
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-20 px-6 text-sm border-t">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-0 gap-10 md:px-20">

          {/* Columna izquierda */}
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
              {Object.entries(config.socialLinks).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
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

          {/* Columna derecha */}
          <div className="space-y-3 text-center md:text-right text-gray-700 flex flex-col items-center md:items-end">
            <p>
              <strong>Dirección:</strong> {config.contactInfo?.address}
            </p>
            <p>
              <strong>Teléfono:</strong> {config.contactInfo?.phone}
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a
                href={`mailto:${config.contactInfo?.email}`}
                className="underline hover:text-blue-600"
              >
                {config.contactInfo?.email}
              </a>
            </p>
            <p className="pt-2 space-x-2">
              <a
                href={config.footer?.privacyLink}
                className="underline hover:text-blue-600"
              >
                Política de Privacidad
              </a>
              <span>|</span>
              <a
                href={config.footer?.termsLink}
                className="underline hover:text-blue-600"
              >
                Términos y Condiciones
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
