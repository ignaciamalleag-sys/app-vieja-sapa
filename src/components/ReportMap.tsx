'use client';

import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Building2,
  Filter,
  Layers,
  Map as MapIcon,
  Navigation,
} from 'lucide-react';
import { EnvironmentalReport } from '../lib/types';
import { getAllComunasList } from '../lib/geocoding';

interface ReportMapProps {
  reports: EnvironmentalReport[];
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Vecino Anónimo';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.substring(0, 2)}***@${domain}`;
}

export default function ReportMap({ reports }: ReportMapProps) {
  const [selectedComuna, setSelectedComuna] = useState<string>('all');
  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const comunas = getAllComunasList();

  // Filter reports by comuna if selected
  const filteredReports = reports.filter((r) => {
    if (selectedComuna === 'all') return true;
    return r.comuna?.toLowerCase() === selectedComuna.toLowerCase();
  });

  const activeReport = filteredReports[activeReportIndex] || filteredReports[0] || null;

  // Center coordinates based on active report or default Santiago
  const mapLat = activeReport ? activeReport.latitude : -33.4489;
  const mapLng = activeReport ? activeReport.longitude : -70.6693;

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200">
          <MapIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Mapa de Reportes Vacío</h3>
        <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto">
          Aún no se han registrado denuncias ambientales en el sistema. Sé el primero en ubicar y notificar un desvío ambiental en tu comuna.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Mapa Interactivo de Reportes</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                {filteredReports.length} {filteredReports.length === 1 ? 'punto' : 'puntos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Geolocalización pública de desvíos ambientales reportados por la comunidad
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
          <select
            value={selectedComuna}
            onChange={(e) => {
              setSelectedComuna(e.target.value);
              setActiveReportIndex(0);
            }}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Todas las Comunas ({reports.length})</option>
            {comunas.map((c) => {
              const count = reports.filter((r) => r.comuna?.toLowerCase() === c.toLowerCase()).length;
              return (
                <option key={c} value={c}>
                  {c} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Map View & Interactive Pins Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Visual Map (Google Maps Embed with Pins Centered) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[480px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Vista de Satélite / Mapa</span>
            </span>
            {activeReport && (
              <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-bold">
                {activeReport.comuna || 'Santiago'}: {activeReport.latitude.toFixed(4)}, {activeReport.longitude.toFixed(4)}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-slate-100">
            <iframe
              title="Mapa Global de Reportes"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`}
              className="w-full h-full filter saturate-[1.1]"
            />
            {activeReport && (
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Punto Seleccionado: {activeReport.comuna || 'Desvío'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive List of Pins / Reports Side Panel */}
        <div className="lg:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredReports.map((rep, idx) => {
            const isActive = idx === activeReportIndex;
            return (
              <div
                key={rep.id || idx}
                onClick={() => setActiveReportIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-950 font-extrabold">{rep.comuna || 'Santiago'}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {rep.created_at
                      ? new Date(rep.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : 'Hoy'}
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed mb-3">
                  {rep.description}
                </p>

                {/* Thumbnails */}
                {rep.photo_urls && rep.photo_urls.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    {rep.photo_urls.map((url, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(url);
                        }}
                        className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square w-12 h-12 bg-slate-100 hover:opacity-90"
                      >
                        <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500 font-semibold">{maskEmail(rep.email)}</span>
                  <a
                    href={rep.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                  >
                    <span>Abrir GPS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

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
