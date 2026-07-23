'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function MapPicker({ latitude, longitude, onChange, disabled }: MapPickerProps) {
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Default initial location if GPS not captured yet (e.g. Santiago, Chile center: -33.4489, -70.6693)
  const currentLat = latitude ?? -33.4489;
  const currentLng = longitude ?? -70.6693;
  const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización GPS no es soportada por este navegador.');
      return;
    }

    setLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onChange(lat, lng);
        setLoadingGps(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let msg = 'No se pudo obtener la ubicación GPS automática.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Por favor permite el acceso al GPS en tu navegador o ingresa las coordenadas.';
        }
        setGpsError(msg);
        setLoadingGps(false);
        // Fallback default if null
        if (latitude === null || longitude === null) {
          onChange(-33.4489, -70.6693);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (latitude === null || longitude === null) {
      requestGpsLocation();
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm font-semibold text-slate-200">
          Geolocalización GPS <span className="text-emerald-400">*</span>
          <span className="text-xs font-normal text-slate-400 block sm:inline sm:ml-2">
            (Coordenadas precisas del desvío ambiental)
          </span>
        </label>

        <button
          type="button"
          onClick={requestGpsLocation}
          disabled={disabled || loadingGps}
          className="inline-flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
        >
          {loadingGps ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{loadingGps ? 'Obteniendo GPS...' : 'Obtener GPS Actual'}</span>
        </button>
      </div>

      {/* Coordinate Displays & Google Maps Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Latitud:
          </span>
          <input
            type="number"
            step="any"
            value={currentLat}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, currentLng)}
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-700 text-emerald-300 text-sm font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Longitud:
          </span>
          <input
            type="number"
            step="any"
            value={currentLng}
            onChange={(e) => onChange(currentLat, parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-700 text-emerald-300 text-sm font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Direct Google Maps Link Button */}
        <div className="sm:col-span-2 pt-1 flex items-center justify-between">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition-all hover:scale-[1.02]"
          >
            <MapPin className="w-4 h-4 text-emerald-200" />
            <span>Abrir enlace en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Embedded Visual Map Preview */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-44 shadow-inner">
        <iframe
          title="Mapa de Ubicación del Reporte"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&z=16&output=embed`}
          className="w-full h-full filter saturate-[1.2] opacity-90"
        />
        <div className="absolute bottom-2 left-2 bg-slate-950/90 text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>Vista de mapa confirmada</span>
        </div>
      </div>

      {gpsError && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}
    </div>
  );
}
