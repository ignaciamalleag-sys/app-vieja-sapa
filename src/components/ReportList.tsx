'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, Calendar, Mail, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { EnvironmentalReport } from '../lib/types';

interface ReportListProps {
  reports: EnvironmentalReport[];
}

export default function ReportList({ reports }: ReportListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-300">No hay reportes registrados aún</h3>
        <p className="text-xs text-slate-400 mt-1">
          Sé el primero en reportar un desvío ambiental en tu sector.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Reportes Ciudadanos Recientes</span>
          <span className="bg-emerald-950 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {reports.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <div
            key={rep.id || idx}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Card Header: Email & Date */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[220px]">{rep.email}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
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
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
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
                      className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-square group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <img
                        src={url}
                        alt={`Evidencia ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        Ver
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer: Location Link & Status */}
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={rep.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Reportado
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <img src={selectedPhoto} alt="Evidencia ampliada" className="w-full h-full object-contain max-h-[85vh]" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-slate-900/80 text-white hover:bg-slate-950 font-bold px-3 py-1.5 rounded-full text-xs border border-slate-700"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
