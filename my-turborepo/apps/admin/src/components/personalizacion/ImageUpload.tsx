'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  currentImage?: string;
  onUpload: (file: File) => Promise<string>;
  accept?: string;
  description?: string;
}

export function ImageUpload({
  label,
  currentImage,
  onUpload,
  accept = 'image/*',
  description,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir
    setUploading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-primary-700">
        {label}
      </label>

      {preview && (
        <div className="relative w-32 h-32 border-2 border-primary-200 rounded-lg overflow-hidden">
          <Image
            src={preview}
            alt={label}
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          isLoading={uploading}
        >
          {uploading ? 'Subiendo...' : preview ? 'Cambiar' : 'Subir Imagen'}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPreview(undefined)}
          >
            Eliminar
          </Button>
        )}
      </div>

      {description && (
        <p className="text-xs text-primary-600">{description}</p>
      )}
    </div>
  );
}