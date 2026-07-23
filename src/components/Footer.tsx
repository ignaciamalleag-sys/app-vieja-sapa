'use client';

import React from 'react';
import { Eye, Github, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-8 px-4 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">
              Reportes Vieja Sapa
            </p>
            <p className="text-xs text-slate-400">
              Iniciativa gratuita de impacto social y cuidado del medio ambiente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://github.com/ignaciamalleag-sys/app-vieja-sapa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors font-medium"
          >
            <Github className="w-4 h-4" />
            <span>GitHub: ignaciamalleag-sys/app-vieja-sapa</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
