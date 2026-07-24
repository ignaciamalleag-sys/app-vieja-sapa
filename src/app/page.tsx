'use client';

import React, { useState, useEffect } from 'react';
import ReportForm from '@/components/ReportForm';
import ReportList from '@/components/ReportList';
import { EnvironmentalReport } from '@/lib/types';
import { fetchAllReports } from '@/lib/supabase';
import { ListFilter, PlusCircle } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in pt-2">
      
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
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
