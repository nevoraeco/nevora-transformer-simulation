import React from 'react';

interface SuccessProps {
  id: string;
  url: string;
}

export default function ReportSuccess({ id, url }: SuccessProps) {
  return (
    <div className="max-w-lg mx-auto mt-20 p-10 bg-[#1A1D26] rounded-xl shadow-[0_12px_48px_rgba(16,185,129,0.1)] text-center border-t-4 border-[#10B981]">
      <div className="w-16 h-16 bg-[#10B981]/15 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-3xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-4">Report Generated</h2>
      <p className="text-sm text-[#94A3B8] mb-2">The dynamic proposal for the RWA has been compiled successfully.</p>
      <p className="text-[#94A3B8] mb-8 text-sm">Simulation ID: <span className="font-['JetBrains_Mono'] font-bold text-[#e2e8f0] bg-[#0A0C12] px-2 py-1 rounded border border-[#2D323F]">{id}</span></p>
      
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer"
        className="inline-flex justify-center w-full bg-[#10B981] hover:bg-[#059669] text-[#090A0F] px-8 py-4 rounded-lg font-['Montserrat'] font-bold tracking-wide shadow-lg shadow-[#10B981]/20 transition-all transform active:scale-95"
      >
        View Google Doc Report
      </a>
    </div>
  );
}