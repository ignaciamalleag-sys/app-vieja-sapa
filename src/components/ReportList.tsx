'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, ShieldCheck, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { EnvironmentalReport } from '../lib/types';

interface ReportListProps {
  reports: EnvironmentalReport[];
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Vecino Anónimo';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.substring(0, 2)}***@${domain}`;
}

export default function ReportList({ reports }: ReportListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No hay reportes registrados aún</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Sé el primero en reportar un desvío ambiental en tu sector.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Reportes Ciudadanos Recientes</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
            {reports.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <div
            key={rep.id || idx}
            className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Card Header: Anonymous Badge & Date */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-slate-200">
                    {maskEmail(rep.email)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {rep.created_at
                      ? new Date(rep.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Reciente'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                {rep.description}
              </p>

              {/* Photos Gallery */}
              {rep.photo_urls && rep.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {rep.photo_urls.map((url, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setSelectedPhoto(url)}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <img
                        src={url}
                        alt={`Evidencia ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        Ver
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer: Location Link & Status */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={rep.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold text-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Reportado
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
            <img src={selectedPhoto} alt="Evidencia ampliada" className="w-full h-full object-contain max-h-[85vh]" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-white/90 text-slate-900 font-bold px-3 py-1.5 rounded-full text-xs border border-slate-200 shadow"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
