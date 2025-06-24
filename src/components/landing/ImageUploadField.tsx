'use client';

import { useState, useEffect } from 'react';

interface ImageUploadFieldProps {
  name: string;
  initialUrl: string;
  label: string;
  placeholderText?: string;
  previewWidth?: number;
  onUrlChange?: (url: string) => void;
}

export default function ImageUploadField({
  name,
  initialUrl,
  label,
  placeholderText,
  previewWidth = 100,
  onUrlChange,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!resp.ok) {
        let errorBody: string;
        try {
          const jsonErr = await resp.json();
          errorBody = JSON.stringify(jsonErr);
        } catch {
          errorBody = await resp.text();
        }
        console.error(
          `[Cloudinary] Status: ${resp.status} ${resp.statusText} — Body: ${errorBody}`
        );
        throw new Error(`Cloudinary devolvió un estado ${resp.status}`);
      }

      const json = await resp.json();
      const secureUrl = json.secure_url as string;
      setUrl(secureUrl);

      if (typeof onUrlChange === 'function') {
        onUrlChange(secureUrl);
      }
    } catch (err) {
      console.error('Error subiendo imagen a Cloudinary:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {uploading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Subiendo…</div>
      )}

      {url ? (
        <img
          src={url}
          alt={label}
          className="mt-2 rounded border border-gray-200 dark:border-gray-700"
          style={{ maxWidth: previewWidth }}
        />
      ) : (
        placeholderText && (
          <div className="text-sm text-gray-400 mt-2">{placeholderText}</div>
        )
      )}

      <input type="hidden" name={name} value={url} />
    </div>
  );
}
