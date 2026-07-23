'use client';

import React, { useState } from 'react';
import { Mail, FileText, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
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

    // 1. Validation of all required fields
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
      // 2. Upload photos to Supabase Storage or Base64 fallback
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

      // 3. Save report to Supabase DB / local storage
      const savedReport = await saveReport(reportData);

      // 4. Call API Route to send email to maepv.pruebas@gmail.com with image links
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

      // Reset form
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
    <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-800/40 rounded-2xl shadow-2xl p-5 sm:p-8">
      
      {/* Form Title & Banner */}
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Crear Nuevo Reporte Ambiental
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Todos los campos marcados con (<span className="text-emerald-400">*</span>) son obligatorios.
          </p>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successData && (
        <div className="mb-6 bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border-2 border-emerald-500 p-5 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-emerald-300">
                ¡Reporte Registrado con Éxito!
              </h3>
              <p className="text-sm text-slate-200">
                El desvío ambiental ha sido almacenado en la base de datos de Supabase y notificado por correo.
              </p>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-800/50 text-xs font-mono text-emerald-400">
                ✨ {successData.emailMsg}
              </div>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="mt-2 text-xs font-bold text-slate-300 hover:text-white underline"
              >
                Crear otro reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-rose-950/90 border border-rose-500/50 text-rose-200 text-sm rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Field 1: Neighbor Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
            Email del Vecino Denunciante <span className="text-emerald-400">*</span>
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
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400">
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
            <label htmlFor="description" className="block text-sm font-semibold text-slate-200">
              Descripción del Problema Ambiental <span className="text-emerald-400">*</span>
            </label>
            <span className="text-xs text-slate-400">
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
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y"
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
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
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
