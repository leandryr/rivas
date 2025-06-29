// app/terms/page.tsx
import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones | RivasDev',
  description: 'Lee los términos y condiciones para el uso de nuestros servicios.',
}

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4 lg:px-0">
      <section className="prose prose-lg mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          Términos y Condiciones
        </h1>
        <p className="text-gray-700 leading-relaxed">
          Al utilizar los servicios de <strong>RivasDev</strong>, aceptas cumplir con los
          siguientes términos y condiciones en vigor.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">1. Uso del Servicio</h2>
        <p className="text-gray-700">
          Nuestra plataforma está destinada únicamente a fines legítimos. Te comprometes a no usarla
          para actividades ilícitas, difamatorias o que violen derechos de terceros.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">2. Propiedad Intelectual</h2>
        <p className="text-gray-700">
          Todos los derechos de diseño, código y contenido de RivasDev son propiedad exclusiva de la
          empresa. Está prohibida la reproducción, distribución o modificación sin autorización previa.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">3. Limitación de Responsabilidad</h2>
        <p className="text-gray-700">
          RivasDev no se hace responsable por daños indirectos, pérdidas de datos o lucro cesante.
          Nuestra garantía se limita al 100% del monto pagado por el proyecto contratado.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">4. Modificaciones</h2>
        <p className="text-gray-700">
          Podremos actualizar estos términos en cualquier momento. Publicaremos la fecha de última
          revisión en la parte superior de esta página y notificaremos a los usuarios registrados.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">5. Contacto</h2>
        <p className="text-gray-700">
          Para dudas o aclaraciones sobre estos términos, escríbenos a{' '}
          <a href="mailto:info@rivasdev.com" className="text-blue-600 hover:underline">
            info@rivasdev.com
          </a>.
        </p>
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Aceptar y continuar
        </Link>
      </div>

      {/* Información legal */}
      <footer className="mt-16 text-center text-sm text-gray-500 space-y-1">
        <p><strong>Rivas Technologies LLC</strong> (EIN: 39-2179227)</p>
        <p>3005 Waterside Oaks Dr SW, Gainesville, GA 30504, USA</p>
        <p>Registered Agent: Leandry Rafael Rivas</p>
      </footer>
    </main>
)
}
