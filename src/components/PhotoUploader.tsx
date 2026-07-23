'use client';

import React, { useState } from 'react';
import { Camera, UploadCloud, Trash2, ImagePlus, AlertCircle } from 'lucide-react';
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

      // 10MB limit per image
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
        <label className="block text-sm font-semibold text-slate-200">
          Subida de Fotos <span className="text-emerald-400">*</span>
          <span className="text-xs font-normal text-slate-400 block sm:inline sm:ml-2">
            (Obligatorio: mínimo 1 foto, máximo 3 fotos)
          </span>
        </label>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            photos.length > 0
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
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
            className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 aspect-square shadow-md"
          >
            <img
              src={photo.previewUrl}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-100 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <span className="self-start text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-700">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                disabled={disabled}
                className="self-end bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-lg shadow transition-all transform hover:scale-110 active:scale-95"
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
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-4 text-center aspect-square transition-all ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-900/30'
                : 'border-emerald-500/40 bg-slate-900/60 hover:bg-emerald-950/30 hover:border-emerald-400'
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
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <ImagePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-300">
              {photos.length === 0 ? 'Subir Foto' : 'Agregar'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Máx 10MB</span>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
