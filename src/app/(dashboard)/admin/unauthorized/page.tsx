// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700">
      <div className="text-center p-6 max-w-md bg-white border shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-4">⛔ Acceso Denegado</h1>
        <p className="mb-4">No tienes permisos para ver esta página.</p>
        <a href="/" className="text-blue-600 hover:underline font-semibold">Volver al inicio</a>
      </div>
    </div>
  );
}
