'use client';

import React, { useState } from 'react';
import { Trash2, ImagePlus, AlertCircle } from 'lucide-react';
import { PhotoFile } from '../lib/types';

interface PhotoUploaderProps {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
  disabled?: boolean;
}

export default function PhotoUploader({ photos, onChange, disabled }: PhotoUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const newPhotos: PhotoFile[] = [...photos];
    const maxAllowed = 3;

    if (newPhotos.length >= maxAllowed) {
      setError('Solo se permite un máximo de 3 fotos por reporte.');
      return;
    }

    const availableSlots = maxAllowed - newPhotos.length;
    const selectedFiles = Array.from(files).slice(0, availableSlots);

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona solo archivos de imagen (JPG, PNG, WEBP).');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`La imagen "${file.name}" supera el tamaño máximo permitido (10MB).`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
      });
    }

    onChange(newPhotos);
  };

  const handleRemovePhoto = (id: string) => {
    setError(null);
    const updated = photos.filter((p) => p.id !== id);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-800">
          Subida de Fotos <span className="text-blue-600">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Obligatorio: mínimo 1 foto, máximo 3 fotos)
          </span>
        </label>
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
            photos.length > 0
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
        >
          {photos.length} / 3 Fotos
        </span>
      </div>

      {/* Grid of Preview Thumbnails */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="relative group rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-100 aspect-square shadow-sm"
          >
            <img
              src={photo.previewUrl}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-100 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <span className="self-start text-[10px] font-bold bg-white/90 text-slate-900 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-200">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                disabled={disabled}
                className="self-end bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-xl shadow transition-all transform hover:scale-110 active:scale-95"
                title="Eliminar foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Box Slot if less than 3 photos */}
        {photos.length < 3 && (
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer p-4 text-center aspect-square transition-all ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                : 'border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-500'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1 shadow-sm">
              <ImagePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-800">
              {photos.length === 0 ? 'Subir Foto' : 'Agregar'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">Máx 10MB</span>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
