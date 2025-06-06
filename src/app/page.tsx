// pages/index.tsx (o src/app/page.tsx para App Router)
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center text-gray-800 px-4">
      {/* Logo y encabezado */}
      <div className="text-center mb-12">
        <div className="flex justify-center">
          <Image src="/logo.webp" alt="RivasDev" width={160} height={120} />
        </div>
        <h1 className="text-3xl font-bold mt-4 text-blue-800"></h1>
        <p className="text-md mt-2 text-gray-600">
          Conecta talentos freelance con empresas que buscan soluciones digitales de calidad.
        </p>
      </div>

      {/* Tarjetas de acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Freelancer */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition text-center">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">¿Eres Freelancer?</h2>
          <p className="text-gray-600 mb-4">
            Accede a proyectos reales y conecta con clientes de manera directa.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login?role=freelancer">
              <button className="bg-blue-800 text-white px-5 py-2 rounded-xl hover:bg-blue-900 transition">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/auth/register?role=freelancer">
              <button className="border border-blue-800 text-blue-800 px-5 py-2 rounded-xl hover:bg-blue-100 transition">
                Registrarse
              </button>
            </Link>
          </div>
        </div>

        {/* Cliente */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition text-center">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">¿Eres Cliente?</h2>
          <p className="text-gray-600 mb-4">
            Publica proyectos, evalúa propuestas y contrata talento verificado.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login?role=client">
              <button className="bg-blue-800 text-white px-5 py-2 rounded-xl hover:bg-blue-900 transition">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/projects/create">
              <button className="border border-blue-800 text-blue-800 px-5 py-2 rounded-xl hover:bg-blue-100 transition">
                Publicar proyecto
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-500 text-sm">
        © 2025 <span className="font-semibold text-blue-800">RivasDEV</span>. Todos los derechos reservados.
      </footer>
    </main>
  );
}
