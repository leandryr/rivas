'use client';

import React, { useState, useEffect } from 'react';
import ImageUploadField from './ImageUploadField';

interface LogosFormProps {
  initialItems: string[]; // array de URLs
  hiddenFieldName: string; // ej. "clientLogosJSON"
}

export default function LogosForm({
  initialItems,
  hiddenFieldName,
}: LogosFormProps) {
  const [items, setItems] = useState<string[]>([...initialItems]);

  useEffect(() => {
    const textarea = document.querySelector(
      `textarea[name="${hiddenFieldName}"]`
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = JSON.stringify(items);
    }
  }, [items, hiddenFieldName]);

  const handleAdd = () => {
    setItems([...items, '']);
  };

  const handleRemove = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleChange = (index: number, url: string) => {
    const copy = [...items];
    copy[index] = url;
    setItems(copy);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Logos de Clientes</h3>

      <textarea
        name={hiddenFieldName}
        className="hidden"
        defaultValue={JSON.stringify(initialItems)}
      />

      {items.map((url, idx) => (
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

          <ImageUploadField
            name={`clientLogo-${idx}`}
            initialUrl={url}
            label="Logo Cliente"
            placeholderText="Sube o selecciona logo"
            previewWidth={100}
            onUrlChange={(newUrl) => handleChange(idx, newUrl)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
      >
        + Agregar logo
      </button>
    </section>
  );
}
