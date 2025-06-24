'use client';

import { useEffect, useState } from 'react';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function AdminSettingsPage() {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/availability')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.availability) {
          const map: Record<string, string[]> = {};
          data.data.availability.forEach((item: any) => {
            map[item.day] = item.hours;
          });
          setAvailability(map);
        }
      })
      .catch(() => {
        setAvailability({});
      });
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const toggleHour = (day: string, hour: string) => {
    setAvailability((prev) => {
      const current = prev[day] || [];
      return {
        ...prev,
        [day]: current.includes(hour)
          ? current.filter((h) => h !== hour)
          : [...current, hour].sort(),
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      });
      if (!res.ok) throw new Error('Error al guardar disponibilidad');
      setShowToast(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configurar disponibilidad</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <div key={day} className="border rounded shadow-sm p-4 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{day}</h2>
            <div className="grid grid-cols-4 gap-2">
              {hours.map((hour) => {
                const selected = availability[day]?.includes(hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(day, hour)}
                    className={`text-xs px-2 py-1 rounded border transition ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300'
                    }`}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar disponibilidad'}
        </button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border border-green-300 px-4 py-3 rounded shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-green-700">
            Horario guardado correctamente
          </span>
        </div>
      )}
    </div>
  );
}
