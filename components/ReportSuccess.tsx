import React from 'react';

interface SuccessProps {
  id: string;
  url: string;
}

export default function ReportSuccess({ id, url }: SuccessProps) {
  return (
    <div className="max-w-lg mx-auto mt-20 p-10 bg-white rounded-2xl shadow-[0_12px_48px_rgba(15,31,61,0.16)] text-center border-t-4 border-[#0a6e5c]">
      <div className="w-16 h-16 bg-[#0a6e5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-[#0a6e5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-3xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-4">Report Generated</h2>
      <p className="text-sm text-[#6b6b7a] mb-2">The dynamic proposal for the RWA has been compiled successfully.</p>
      <p className="text-[#6b6b7a] mb-8 text-sm">Simulation ID: <span className="font-['JetBrains_Mono'] font-bold text-[#0f1f3d] bg-[#f7f6f2] px-2 py-1 rounded">{id}</span></p>
      
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer"
        className="inline-flex justify-center w-full bg-[#0a6e5c] text-white px-8 py-4 rounded-xl font-['DM_Sans'] font-semibold tracking-wide hover:bg-[#0d8a74] shadow-lg transition-all"
      >
        View Google Doc Report
      </a>
    </div>
  );
}