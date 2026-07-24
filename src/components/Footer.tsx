'use client';

import React from 'react';
import { Eye, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-8 px-4 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Reportes Vieja Sapa
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Iniciativa gratuita de impacto social y cuidado del medio ambiente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <a
            href="https://github.com/ignaciamalleag-sys/app-vieja-sapa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors"
          >
            <Github className="w-4 h-4 text-slate-900" />
            <span>GitHub: ignaciamalleag-sys/app-vieja-sapa</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
