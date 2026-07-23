'use client';

import React, { useState, useEffect } from 'react';
import ReportForm from '@/components/ReportForm';
import ReportList from '@/components/ReportList';
import { EnvironmentalReport } from '@/lib/types';
import { fetchAllReports, isSupabaseConfigured } from '@/lib/supabase';
import { ShieldAlert, ListFilter, PlusCircle, Database, CheckCircle2, Info } from 'lucide-react';

export default function HomePage() {
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReports();
      setReports(data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleReportSubmitted = (newReport: EnvironmentalReport) => {
    setReports((prev) => [newReport, ...prev]);
    // Switch to list view or keep on form
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fiscalización Ambiental Ciudadana</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reporta microbasurales y vertederos en tiempo real
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Juntos vigilamos y protegemos los espacios públicos. Sube la foto del desvío, adjunta la ubicación GPS exacta y notifica automáticamente al equipo de control ambiental.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2 shadow-inner">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Demo / Local'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'form'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Realizar Reporte</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'list'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
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
