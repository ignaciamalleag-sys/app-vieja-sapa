'use client';

import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Download, Wifi, WifiOff } from 'lucide-react';

export default function Header() {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-800/40 text-white shadow-xl">
      <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10 shrink-0">
              <Eye className="w-8 h-8 text-slate-950" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-emerald-400">
                  Reportes Vieja Sapa
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  PWA Social
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Alerta y fiscalización ambiental colaborativa en espacios públicos
              </p>
            </div>
          </div>

          {/* Action Pills: Install PWA & Connection Status */}
          <div className="flex items-center gap-3">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Instalar App
              </button>
            )}

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>En Línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Offline</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
