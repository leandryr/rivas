'use client';

import React, { useState, useEffect } from 'react';
import ImageUploadField from './ImageUploadField';

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
  flagUrl: string;
}

interface TestimonialsFormProps {
  initialItems: TestimonialItem[];
  hiddenFieldName: string;
}

export default function TestimonialsForm({
  initialItems,
  hiddenFieldName,
}: TestimonialsFormProps) {
  const [items, setItems] = useState<TestimonialItem[]>([...initialItems]);

  useEffect(() => {
    const textarea = document.querySelector(
      `textarea[name="${hiddenFieldName}"]`
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = JSON.stringify(items);
    }
  }, [items, hiddenFieldName]);

  const handleAdd = () => {
    setItems([
      ...items,
      {
        quote: '',
        name: '',
        role: '',
        avatarUrl: '',
        flagUrl: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleChange = <K extends keyof TestimonialItem>(
    index: number,
    key: K,
    value: TestimonialItem[K]
  ) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [key]: value };
    setItems(copy);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Testimonios</h3>

      <textarea
        name={hiddenFieldName}
        className="hidden"
        defaultValue={JSON.stringify(initialItems)}
      />

      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
        >
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center"
            title="Eliminar"
          >
            ×
          </button>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cita
            </label>
            <textarea
              value={item.quote}
              onChange={(e) => handleChange(idx, 'quote', e.target.value)}
              placeholder="“Este es el mejor servicio…”"
              rows={3}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleChange(idx, 'name', e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol / Cargo
            </label>
            <input
              type="text"
              value={item.role}
              onChange={(e) => handleChange(idx, 'role', e.target.value)}
              placeholder="CEO XYZ"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            />
          </div>

          <ImageUploadField
            name={`testimonialAvatar-${idx}`}
            initialUrl={item.avatarUrl}
            label="Avatar"
            placeholderText="Sube o selecciona avatar"
            previewWidth={80}
            onUrlChange={(url) => handleChange(idx, 'avatarUrl', url)}
          />

          <ImageUploadField
            name={`testimonialFlag-${idx}`}
            initialUrl={item.flagUrl}
            label="Bandera (país)"
            placeholderText="Sube o selecciona bandera"
            previewWidth={80}
            onUrlChange={(url) => handleChange(idx, 'flagUrl', url)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
      >
        + Agregar testimonio
      </button>
    </section>
  );
}
