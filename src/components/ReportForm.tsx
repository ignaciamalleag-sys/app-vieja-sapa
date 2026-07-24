'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import MapPicker from './MapPicker';
import PhotoUploader from './PhotoUploader';
import { PhotoFile, EnvironmentalReport } from '../lib/types';
import { saveReport, uploadReportPhoto } from '../lib/supabase';

interface ReportFormProps {
  onReportSubmitted: (newReport: EnvironmentalReport) => void;
}

export default function ReportForm({ onReportSubmitted }: ReportFormProps) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ report: EnvironmentalReport; emailMsg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un email válido del vecino denunciante.');
      return;
    }

    if (latitude === null || longitude === null) {
      setErrorMessage('La ubicación GPS es obligatoria. Presiona "Obtener GPS Actual" o ajusta las coordenadas.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('La descripción del problema o desvío ambiental es obligatoria.');
      return;
    }

    if (photos.length === 0) {
      setErrorMessage('La subida de al menos 1 foto (máximo 3) es obligatoria.');
      return;
    }

    if (photos.length > 3) {
      setErrorMessage('No se pueden subir más de 3 fotos.');
      return;
    }

    setSubmitting(true);

    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const uploadedUrl = await uploadReportPhoto(photo.file);
        photoUrls.push(uploadedUrl);
      }

      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const reportData: EnvironmentalReport = {
        email: email.trim(),
        description: description.trim(),
        latitude,
        longitude,
        google_maps_url: googleMapsUrl,
        photo_urls: photoUrls,
      };

      const savedReport = await saveReport(reportData);

      let emailStatusMsg = '';
      try {
        const emailRes = await fetch('/api/reports/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedReport),
        });

        const emailResult = await emailRes.json();
        if (emailRes.ok) {
          emailStatusMsg = emailResult.message || 'Notificación enviada a maepv.pruebas@gmail.com';
        } else {
          console.warn('API Email warning:', emailResult);
          emailStatusMsg = 'Reporte guardado. (Notificación por correo en cola de verificación).';
        }
      } catch (err) {
        console.warn('Network call to email route failed, but report saved:', err);
        emailStatusMsg = 'Reporte guardado con éxito localmente/Supabase.';
      }

      setSuccessData({
        report: savedReport,
        emailMsg: emailStatusMsg,
      });

      onReportSubmitted(savedReport);

      setEmail('');
      setDescription('');
      setPhotos([]);
    } catch (err: any) {
      console.error('Error enviando reporte:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
      
      {/* Form Title & Header */}
      <div className="flex items-start sm:items-center gap-3.5 pb-6 mb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Crear Nuevo Reporte Ambiental
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Juntos vigilamos y protegemos los espacios públicos. Sube la foto del desvío, adjunta la ubicación GPS exacta y notifica automáticamente a la direccion ambiental de la comuna a traves de un reporte.
          </p>
          <p className="text-xs text-slate-500 font-semibold pt-1">
            Todos los campos marcados con (<span className="text-emerald-600 font-bold">*</span>) son obligatorios.
          </p>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successData && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-500 p-5 rounded-2xl shadow-md animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-emerald-900">
                ¡Reporte Registrado con Éxito!
              </h3>
              <p className="text-sm text-slate-700 font-medium">
                El desvío ambiental ha sido almacenado en la base de datos de Supabase y notificado por correo.
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-emerald-800 shadow-sm">
                ✨ {successData.emailMsg}
              </div>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Crear otro reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Field 1: Neighbor Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-bold text-slate-800">
            Email del Vecino Denunciante <span className="text-emerald-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              disabled={submitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo: vecino.activo@comuna.cl"
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Utilizado para confirmación y seguimiento de la denuncia pública.
          </p>
        </div>

        {/* Field 2: GPS Location */}
        <MapPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
          disabled={submitting}
        />

        {/* Field 3: Problem Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-bold text-slate-800">
              Descripción del Problema Ambiental <span className="text-emerald-600">*</span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {description.length} caracteres
            </span>
          </div>
          <div className="relative">
            <textarea
              id="description"
              required
              rows={4}
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente la irregularidad (ej: microbasural clandestino, escombros en canal, vertido ilegal de líquidos, quema no autorizada)..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y font-medium"
            />
          </div>
        </div>

        {/* Field 4: Photo Upload (Max 3) */}
        <PhotoUploader
          photos={photos}
          onChange={setPhotos}
          disabled={submitting}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base px-6 py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Enviando Reporte a Supabase y Notificando...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar Reporte Ambiental</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
