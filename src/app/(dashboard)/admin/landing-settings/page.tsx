'use client';

import { useEffect, useState } from 'react';
import { useSession }         from 'next-auth/react';
import { useRouter }          from 'next/navigation';
import toast                  from 'react-hot-toast';
import { ChevronDown }        from 'lucide-react';

import ImageUploadField       from '@/components/landing/ImageUploadField';
import FeaturesForm           from '@/components/landing/FeaturesForm';
import PortfolioForm          from '@/components/landing/PortfolioForm';
import StatsForm              from '@/components/landing/StatsForm';
import TestimonialsForm       from '@/components/landing/TestimonialsForm';
import LogosForm              from '@/components/landing/LogosForm';

export default function LandingSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [config,  setConfig]  = useState<any>(null);

  // control de expandir/colapsar por sección
  const [open, setOpen] = useState({
    general:      false,
    hero:         false,
    features:     false,
    portfolio:    false,
    stats:        false,
    testimonials: false,
    logos:        false,
    about:        false,
    social:       false,
    contact:      false,
    footer:       false,
  });
  const toggle = (section: keyof typeof open) =>
    setOpen(prev => ({ ...prev, [section]: !prev[section] }));

  // carga inicial de la configuración
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;

    (async () => {
      try {
        const res  = await fetch('/api/landing-config');
        const data = await res.json();
        setConfig(data);
      } catch {
        toast.error('Error cargando configuración');
      } finally {
        setLoading(false);
      }
    })();
  }, [status, router]);

  // guarda sólo la sección indicada y la cierra
  const saveSection = async (section: keyof typeof open, payload: any) => {
    try {
      const res = await fetch('/api/landing-config?slug=home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'home', ...payload }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfig(updated);
      toast.success('Guardado con éxito');
      //  ↓ Colapsar sección tras el guardado
      setOpen(prev => ({ ...prev, [section]: false }));
    } catch {
      toast.error('Error guardando sección');
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando…
      </div>
    );
  if (!config)
    return (
      <div className="p-8 text-center text-red-600">
        No se pudo cargar la configuración.
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900 flex justify-center">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-6">

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Configuración de Landing Page
        </h1>

        {/* ─── Sección: General ─────────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('general')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              General
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.general ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.general && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('general', {
                  logoUrl:      fd.get('logoUrl'),
                  primaryColor: fd.get('primaryColor'),
                });
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploadField
                  name="logoUrl"
                  initialUrl={config.logoUrl}
                  label="Logo Principal"
                  placeholderText="Sube o selecciona un logo"
                  previewWidth={140}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color primario
                  </label>
                  <input
                    type="text"
                    name="primaryColor"
                    defaultValue={config.primaryColor}
                    placeholder="#2563eb"
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar General
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Hero ─────────────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('hero')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Sección Hero
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.hero ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.hero && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('hero', {
                  hero: {
                    backgroundImage:   fd.get('heroBg'),
                    title:             fd.get('heroTitle'),
                    subtitle:          fd.get('heroSubtitle'),
                    primaryButtonText: fd.get('heroPrimaryButtonText'),
                    primaryButtonLink: fd.get('heroPrimaryButtonLink'),
                    secondaryButtonText: fd.get('heroSecondaryButtonText'),
                    secondaryButtonLink: fd.get('heroSecondaryButtonLink'),
                  },
                });
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploadField
                  name="heroBg"
                  initialUrl={config.hero.backgroundImage}
                  label="Imagen de Fondo"
                  placeholderText="Sube o selecciona imagen"
                  previewWidth={240}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <input
                    type="text"
                    name="heroTitle"
                    defaultValue={config.hero.title}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    name="heroSubtitle"
                    defaultValue={config.hero.subtitle}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Texto Botón Primario
                  </label>
                  <input
                    type="text"
                    name="heroPrimaryButtonText"
                    defaultValue={config.hero.primaryButtonText}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enlace Botón Primario
                  </label>
                  <input
                    type="text"
                    name="heroPrimaryButtonLink"
                    defaultValue={config.hero.primaryButtonLink}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Texto Botón Secundario
                  </label>
                  <input
                    type="text"
                    name="heroSecondaryButtonText"
                    defaultValue={config.hero.secondaryButtonText}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enlace Botón Secundario
                  </label>
                  <input
                    type="text"
                    name="heroSecondaryButtonLink"
                    defaultValue={config.hero.secondaryButtonLink}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Hero
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Servicios (Features) ───────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('features')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Servicios
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.features ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.features && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const features = JSON.parse(
                  fd.get('featuresJSON') as string || '[]'
                ) as any[];
                saveSection('features', { features });
              }}
              className="mt-4"
            >
              <FeaturesForm
                initialItems={config.features}
                hiddenFieldName="featuresJSON"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Servicios
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Portafolio ───────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('portfolio')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Portafolio
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.portfolio ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.portfolio && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const portfolio = JSON.parse(
                  fd.get('portfolioJSON') as string || '[]'
                ) as any[];
                saveSection('portfolio', { portfolio });
              }}
              className="mt-4"
            >
              <PortfolioForm
                initialItems={config.portfolio}
                hiddenFieldName="portfolioJSON"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Portafolio
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Estadísticas ─────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('stats')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Estadísticas
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.stats ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.stats && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const stats = JSON.parse(
                  fd.get('statsJSON') as string || '[]'
                ) as any[];
                saveSection('stats', { stats });
              }}
              className="mt-4"
            >
              <StatsForm
                initialItems={config.stats}
                hiddenFieldName="statsJSON"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Estadísticas
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Testimonios ──────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('testimonials')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Testimonios
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.testimonials ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.testimonials && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const testimonials = JSON.parse(
                  fd.get('testimonialsJSON') as string || '[]'
                ) as any[];
                saveSection('testimonials', { testimonials });
              }}
              className="mt-4"
            >
              <TestimonialsForm
                initialItems={config.testimonials}
                hiddenFieldName="testimonialsJSON"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Testimonios
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Logos Clientes ───────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('logos')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Logos Clientes
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.logos ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.logos && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const clientLogos = JSON.parse(
                  fd.get('clientLogosJSON') as string || '[]'
                ) as any[];
                saveSection('logos', { clientLogos });
              }}
              className="mt-4"
            >
              <LogosForm
                initialItems={config.clientLogos}
                hiddenFieldName="clientLogosJSON"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Logos
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Acerca de Nosotros ───────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('about')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Acerca de Nosotros
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.about ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.about && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('about', {
                  aboutText: fd.get('aboutText'),
                  mission:   fd.get('mission'),
                  vision:    fd.get('vision'),
                });
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Texto
                </label>
                <textarea
                  name="aboutText"
                  rows={4}
                  defaultValue={config.aboutText}
                  className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Misión
                  </label>
                  <textarea
                    name="mission"
                    rows={3}
                    defaultValue={config.mission}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visión
                  </label>
                  <textarea
                    name="vision"
                    rows={3}
                    defaultValue={config.vision}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Acerca
              </button>
            </form>
          )}
        </div>

        {/* ─── Sección: Redes Sociales ───────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('social')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Redes Sociales
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.social ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.social && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('social', {
                  socialLinks: {
                    github:    fd.get('githubLink'),
                    linkedin:  fd.get('linkedinLink'),
                    twitter:   fd.get('twitterLink'),
                    facebook:  fd.get('facebookLink'),
                    instagram: fd.get('instagramLink'),
                  },
                });
              }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {['github','linkedin','twitter','facebook','instagram'].map(net => (
                <div key={net}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {net.charAt(0).toUpperCase() + net.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={`${net}Link`}
                    defaultValue={config.socialLinks?.[net]}
                    placeholder={`https://`}
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400" 
                  />
                </div>
              ))}

              <div className="col-span-full">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Guardar Redes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── Sección: Contacto ─────────────────────────────────────── */}
        <div className="border-b pb-4">
          <button
            type="button"
            onClick={() => toggle('contact')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Contacto
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.contact ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.contact && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('contact', {
                  contactInfo: {
                    address: fd.get('address'),
                    phone:   fd.get('phone'),
                    email:   fd.get('email'),
                  },
                });
              }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={config.contactInfo?.address}
                  placeholder="Calle Falsa 123"
                  className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={config.contactInfo?.phone}
                  placeholder="+1 (234) 567-890"
                  className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="col-span-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={config.contactInfo?.email}
                  placeholder="info@tu-dominio.com"
                  className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="col-span-full">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── Sección: Footer ───────────────────────────────────────── */}
        <div className="pb-4">
          <button
            type="button"
            onClick={() => toggle('footer')}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Footer
            </h2>
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                open.footer ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {open.footer && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveSection('footer', {
                  footer: {
                    copyrightText: fd.get('footerCopyright'),
                    privacyLink:   fd.get('footerPrivacy'),
                    termsLink:     fd.get('footerTerms'),
                  },
                });
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Copyright
                  </label>
                  <input
                    type="text"
                    name="footerCopyright"
                    defaultValue={config.footer?.copyrightText}
                    placeholder="© 2025 Tu Empresa"
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Política de Privacidad
                  </label>
                  <input
                    type="text"
                    name="footerPrivacy"
                    defaultValue={config.footer?.privacyLink}
                    placeholder="/privacy"
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Términos y Condiciones
                  </label>
                  <input
                    type="text"
                    name="footerTerms"
                    defaultValue={config.footer?.termsLink}
                    placeholder="/terms"
                    className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Footer
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
