'use client';

import React, { useState, useEffect } from 'react';
import ImageUploadField from './ImageUploadField';

export interface FeatureItem {
  iconUrl: string;
  title: string;
  description: string;
}

interface FeaturesFormProps {
  initialItems: FeatureItem[];
  hiddenFieldName: string; // ej. "featuresJSON"
}

export default function FeaturesForm({
  initialItems,
  hiddenFieldName,
}: FeaturesFormProps) {
  const [items, setItems] = useState<FeatureItem[]>([...initialItems]);

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
        iconUrl: '',
        title: '',
        description: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleChange = <K extends keyof FeatureItem>(
    index: number,
    key: K,
    value: FeatureItem[K]
  ) => {
    const copy = [...items];
    copy[index] = {
      ...copy[index],
      [key]: value,
    };
    setItems(copy);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Servicios (Features)</h3>

      <textarea
        name={hiddenFieldName}
        className="hidden"
        defaultValue={JSON.stringify(initialItems)}
      />

      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800"
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
            name={`featureIcon-${idx}`}
            initialUrl={item.iconUrl}
            label="Icono"
            placeholderText="Sube o selecciona un icono"
            previewWidth={80}
            onUrlChange={(url) => handleChange(idx, 'iconUrl', url)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleChange(idx, 'title', e.target.value)}
              placeholder="Título del servicio"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={item.description}
              onChange={(e) =>
                handleChange(idx, 'description', e.target.value)
              }
              placeholder="Descripción del servicio"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
      >
        + Agregar servicio
      </button>
    </section>
  );
}
