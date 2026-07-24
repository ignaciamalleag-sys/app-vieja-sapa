'use client';

import React from 'react';
import { Eye, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-8 px-4 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-400 shadow-sm bg-blue-50 shrink-0">
            <img src="/logo.png" alt="Logo Vieja Sapa" className="w-full h-full object-cover scale-[1.9] transform" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Reportes Vieja Sapa App
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Iniciativa gratuita de impacto social y cuidado del medio ambiente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Heart className="w-3.5 h-3.5 text-blue-600" />
          <span>Plataforma comunitaria de fiscalización pública</span>
        </div>

      </div>
    </footer>
  );
}
