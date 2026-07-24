'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Download, Wifi, WifiOff } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3.5 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full overflow-hidden shadow-md border-2 border-blue-600 bg-blue-50 shrink-0">
              <img
                src="/logo.png"
                alt="Logo Vieja Sapa"
                className="w-full h-full object-cover object-center scale-[1.4] transform m-auto"
              />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Reportes Vieja Sapa App
                </h1>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-300">
                  PWA Social
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Alerta y fiscalización ambiental colaborativa en espacios públicos
              </p>
            </div>
          </div>

          {/* Action Pills: Install PWA & Connection Status */}
          <div className="flex items-center gap-2.5">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all transform hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Instalar App
              </button>
            )}

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isOnline
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>En Línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
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
