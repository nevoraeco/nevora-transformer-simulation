'use client';
import { useState, useMemo } from 'react';
import CommunityGate from '../components/CommunityGate';
import SimulatorUI from '../components/SimulatorUI';
import ReportSuccess from '../components/ReportSuccess';
import TippingPointChart from '../components/TippingPointChart';
import { calculateHeadroom, SimInputs } from '../lib/calculator';

export default function SimulatorApp() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; url: string } | null>(null);

  // Gate State
  const [communityData, setCommunityData] = useState({
    communityName: '',
    address: '',
    totalFlats: '',
  });

  // Master Math State (Defaults modeled from HTML file)
  const [inputs, setInputs] = useState<SimInputs>({
    numTransformers: 0,
    transformerKVAs: [0], // Start with 1 transformer at 0 kVA
    powerFactor: 0.9,
    buffer: 10,
    flats3kw: 0,
    flats5kw: 0,
    commonMeters: 0,
    commonLoad: 0,
    bg3noev: 0.8,
    bg3ev: 1.0,
    bg5noev: 1.5,
    bg5ev: 1.8,
    enh33_3kw: 2,
    ev33_3kw: 0,
    enh33_5kw: 0,
    ev33_5kw: 0,
    enh74_3kw: 7,
    ev74_3kw: 0,
    enh74_5kw: 5,
    ev74_5kw: 0,
  });

  // Memoized Calculation (Runs instantly on any input change)
  const results = useMemo(() => calculateHeadroom(inputs), [inputs]);

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    
    // Combine context and calculated limits for the payload
    const payload = {
      ...communityData,
      maxUsers33: results.maxExtra33,
      maxUsers74: results.maxExtra74,
      totalConnected: results.connected,
      usableKw: results.usable,
      // Add any additional fields required by Google Apps Script here
    };

    try {
      const response = await fetch('/api/submit-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessData({ id: data.simulationId, url: data.reportUrl });
        setStep(3);
      } else {
        alert("Failed to generate report: " + data.message);
      }
    } catch (err) {
      alert("A network error occurred. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] font-['DM_Sans'] text-[#1a1a2e] selection:bg-[#0a6e5c] selection:text-white pb-20">
      
      {/* Top Navbar */}
      <header className="bg-[#0f1f3d] w-full py-4 px-8 border-b border-white/10 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="font-['JetBrains_Mono'] text-[11px] tracking-[3px] text-[#c9a84c] uppercase">Nevora Ecovolt</div>
        {step === 2 && (
          <div className="text-white/70 text-sm font-medium">{communityData.communityName}</div>
        )}
      </header>

      <main className="px-4">
        {step === 1 && (
          <CommunityGate 
            communityData={communityData} 
            setCommunityData={setCommunityData} 
            onNext={() => setStep(2)} 
          />
        )}

        {step === 2 && (
          <div className="max-w-6xl mx-auto mt-12">
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-4">Infrastructure Simulator</h1>
              <p className="text-[#6b6b7a] max-w-2xl leading-relaxed">Adjust the parameters below to instantly model the real impact of EV charging adoption on {communityData.communityName}'s electrical capacity.</p>
            </div>
            
            <SimulatorUI inputs={inputs} setInputs={setInputs} results={results} />
            
            <div className="mt-16 pt-8 border-t border-[#dddbd5] text-right">
              <button 
                onClick={handleGenerateReport} 
                disabled={isSubmitting}
                className="bg-[#0f1f3d] text-[#c9a84c] px-10 py-5 rounded-xl font-semibold tracking-wide shadow-[0_12px_48px_rgba(15,31,61,0.16)] hover:bg-[#1b3260] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] inline-flex items-center gap-3"
              >
                {isSubmitting ? 'Syncing to Cloud...' : 'Finalize & Generate Proposal'}
                {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && successData && (
          <ReportSuccess id={successData.id} url={successData.url} />
        )}
      </main>
    </div>
  );
}