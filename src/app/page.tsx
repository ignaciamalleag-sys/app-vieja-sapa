'use client';

import React, { useState, useEffect } from 'react';
import ReportForm from '@/components/ReportForm';
import ReportList from '@/components/ReportList';
import { EnvironmentalReport } from '@/lib/types';
import { fetchAllReports, isSupabaseConfigured } from '@/lib/supabase';
import { ShieldAlert, ListFilter, PlusCircle, Database } from 'lucide-react';

export default function HomePage() {
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  const loadReports = async () => {
    try {
      const data = await fetchAllReports();
      setReports(data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleReportSubmitted = (newReport: EnvironmentalReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-600/15">
        {/* Subtle background decorative shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-200" />
              <span>Fiscalización Ambiental Ciudadana</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Reporta microbasurales y vertederos en tiempo real
            </h2>
            <p className="text-sm text-emerald-50 leading-relaxed font-medium">
              Juntos vigilamos y protegemos los espacios públicos. Sube la foto del desvío, adjunta la ubicación GPS exacta y notifica automáticamente al equipo de control ambiental.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0 w-full md:w-auto">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold text-white flex items-center gap-2 shadow-sm">
              <Database className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Demo / Local'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all ${
            activeTab === 'form'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Realizar Reporte</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all ${
            activeTab === 'list'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Ver Reportes Recientes ({reports.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'form' ? (
        <ReportForm onReportSubmitted={handleReportSubmitted} />
      ) : (
        <ReportList reports={reports} />
      )}

    </div>
  );
}
