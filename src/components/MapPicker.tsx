'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Building2,
  Mail,
  CheckCircle,
  Crosshair,
  Edit3,
} from 'lucide-react';
import {
  getComunaInfoFromCoordinates,
  getAllComunasList,
  getCorreoByComuna,
} from '@/lib/geocoding';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onComunaDetected?: (comunaName: string, email: string) => void;
  disabled?: boolean;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  onComunaDetected,
  disabled,
}: MapPickerProps) {
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingComuna, setLoadingComuna] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  const [comunaName, setComunaName] = useState<string>('Detectando comuna...');
  const [comunaEmail, setComunaEmail] = useState<string>('');
  const [isManualOverride, setIsManualOverride] = useState(false);

  const allComunas = getAllComunasList();

  const currentLat = latitude ?? -33.4489;
  const currentLng = longitude ?? -70.6693;
  const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  // Reverse geocoding lookup whenever coordinates change (unless manually overriden)
  useEffect(() => {
    let isMounted = true;
    if (isManualOverride) return;

    const fetchComuna = async () => {
      setLoadingComuna(true);
      const info = await getComunaInfoFromCoordinates(currentLat, currentLng);
      if (isMounted) {
        setComunaName(info.comunaName);
        setComunaEmail(info.email);
        setLoadingComuna(false);
        if (onComunaDetected) {
          onComunaDetected(info.comunaName, info.email);
        }
      }
    };

    fetchComuna();

    return () => {
      isMounted = false;
    };
  }, [currentLat, currentLng, isManualOverride]);

  const handleManualComunaChange = (selectedComuna: string) => {
    setIsManualOverride(true);
    setComunaName(selectedComuna);
    const assignedEmail = getCorreoByComuna(selectedComuna);
    setComunaEmail(assignedEmail);
    if (onComunaDetected) {
      onComunaDetected(selectedComuna, assignedEmail);
    }
  };

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización GPS no es soportada por este navegador.');
      return;
    }

    setLoadingGps(true);
    setGpsError(null);
    setIsManualOverride(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy);

        onChange(lat, lng);
        setAccuracyMeters(acc);
        setLoadingGps(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let msg = 'No se pudo obtener la ubicación GPS automática.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Permite el acceso al GPS en tu navegador o selecciona la comuna manualmente.';
        }
        setGpsError(msg);
        setLoadingGps(false);
        if (latitude === null || longitude === null) {
          onChange(-33.4489, -70.6693);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm font-bold text-slate-800">
          Geolocalización GPS & Comuna <span className="text-blue-600">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Alta precisión y asignación municipal)
          </span>
        </label>

        <button
          type="button"
          onClick={requestGpsLocation}
          disabled={disabled || loadingGps}
          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
        >
          {loadingGps ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{loadingGps ? 'Obteniendo GPS...' : 'Obtener GPS Alta Precisión'}</span>
        </button>
      </div>

      {/* Accuracy Badge */}
      {accuracyMeters !== null && !loadingGps && (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          <span>Precisión GPS estimada: <strong className="text-slate-900">± {accuracyMeters} metros</strong></span>
          {accuracyMeters <= 20 && (
            <span className="ml-auto text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-300">
              Alta Precisión
            </span>
          )}
        </div>
      )}

      {/* Coordinate Inputs & Google Maps Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Latitud:
          </span>
          <input
            type="number"
            step="any"
            value={currentLat}
            onChange={(e) => {
              setIsManualOverride(false);
              onChange(parseFloat(e.target.value) || 0, currentLng);
            }}
            disabled={disabled}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-mono font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Longitud:
          </span>
          <input
            type="number"
            step="any"
            value={currentLng}
            onChange={(e) => {
              setIsManualOverride(false);
              onChange(currentLat, parseFloat(e.target.value) || 0);
            }}
            disabled={disabled}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-mono font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Direct Google Maps Link Button */}
        <div className="sm:col-span-2 pt-1 flex items-center justify-between">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
          >
            <MapPin className="w-4 h-4 text-blue-200" />
            <span>Abrir mapa en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
          <span className="text-[11px] text-slate-500 font-mono font-semibold">
            {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Comuna Selection & Municipal Email Card */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1">
                <span>Comuna Asignada:</span>
                {isManualOverride && (
                  <span className="bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 text-[10px] rounded border border-amber-300">
                    Ajuste Manual
                  </span>
                )}
              </div>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                {loadingComuna ? (
                  <span className="text-xs text-slate-600 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Identificando comuna con precisión...
                  </span>
                ) : (
                  <span>{comunaName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Selector / Dropdown para corregir/seleccionar comuna manualmente */}
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={allComunas.includes(comunaName) ? comunaName : ''}
              onChange={(e) => handleManualComunaChange(e.target.value)}
              disabled={disabled}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" disabled>
                -- Cambiar comuna --
              </option>
              {allComunas.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Assigned Email Display */}
        {comunaEmail && !loadingComuna && (
          <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 text-blue-950 font-bold shadow-2xs justify-between">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-600 font-medium">Dirección Ambiental:</span>
              <span className="text-blue-900 font-mono underline truncate">{comunaEmail}</span>
            </div>
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
        )}
      </div>

      {/* Embedded Visual Map Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white h-44 shadow-inner">
        <iframe
          title="Mapa de Ubicación del Reporte"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&z=17&output=embed`}
          className="w-full h-full filter saturate-[1.1]"
        />
        <div className="absolute bottom-2 left-2 bg-white/90 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg border border-slate-200 shadow-sm backdrop-blur-sm flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-blue-600" />
          <span>Vista de mapa confirmada</span>
        </div>
      </div>

      {gpsError && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span className="font-medium">{gpsError}</span>
        </div>
      )}
    </div>
  );
}
