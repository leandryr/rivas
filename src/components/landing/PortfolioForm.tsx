'use client';

import React, { useState, useEffect } from 'react';
import ImageUploadField from './ImageUploadField';

export interface PortfolioItem {
  imageUrl: string;
  title: string;
  category: string;
}

interface PortfolioFormProps {
  initialItems: PortfolioItem[];
  hiddenFieldName: string; // ej. "portfolioJSON"
}

export default function PortfolioForm({
  initialItems,
  hiddenFieldName,
}: PortfolioFormProps) {
  const [items, setItems] = useState<PortfolioItem[]>([...initialItems]);

  useEffect(() => {
    const textarea = document.querySelector(
      `textarea[name="${hiddenFieldName}"]`
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = JSON.stringify(items);
    }
  }, [items, hiddenFieldName]);

  const handleAdd = () => {
    setItems([...items, { imageUrl: '', title: '', category: '' }]);
  };

  const handleRemove = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleChange = <K extends keyof PortfolioItem>(
    index: number,
    key: K,
    value: PortfolioItem[K]
  ) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [key]: value };
    setItems(copy);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Portafolio</h3>

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

          <ImageUploadField
            name={`portfolioImage-${idx}`}
            initialUrl={item.imageUrl}
            label="Imagen de Proyecto"
            placeholderText="Sube o selecciona imagen"
            previewWidth={120}
            onUrlChange={(url) => handleChange(idx, 'imageUrl', url)}
          />

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleChange(idx, 'title', e.target.value)}
              placeholder="Título del proyecto"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <input
              type="text"
              value={item.category}
              onChange={(e) => handleChange(idx, 'category', e.target.value)}
              placeholder="Ej: Web, Diseño, Mobile..."
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
      >
        + Agregar proyecto
      </button>
    </section>
  );
}
