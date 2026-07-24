'use client';

import React from 'react';
import ReportForm from '@/components/ReportForm';

export default function HomePage() {
  const handleReportSubmitted = () => {
    // Report created handler
  };

  return (
    <div className="animate-fade-in pt-2">
      <ReportForm onReportSubmitted={handleReportSubmitted} />
    </div>
  );
}
