'use client';
import { useState, useMemo } from 'react';
import { Settings, LineChart, FileText, Zap, ChevronRight, UploadCloud } from 'lucide-react';

import CommunityGate from '../components/CommunityGate';
import SimulatorUI from '../components/SimulatorUI';
import TippingPointChart from '../components/TippingPointChart';
import ReportSuccess from '../components/ReportSuccess';
import { calculateHeadroom, SimInputs } from '../lib/calculator';
import SummaryCard from '../components/SummaryCard';
import WhyItMatters from '../components/WhyItMatters';

// We will build SummaryCard and WhyItMatters in the next steps!
// import SummaryCard from '../components/SummaryCard';
// import WhyItMatters from '../components/WhyItMatters';

export default function SimulatorApp() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'simulator' | 'tip33' | 'tip74' | 'summary' | 'whymatters'>('simulator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; url: string } | null>(null);

  const [communityData, setCommunityData] = useState({ communityName: '', address: '', totalFlats: '' });

  const [inputs, setInputs] = useState<SimInputs>({
    numTransformers: 1, transformerKVAs: [0], powerFactor: 0.9, buffer: 10,
    flats3kw: 0, flats5kw: 0, commonMeters: 0, commonLoad: 0,
    bg3noev: 0.8, bg3ev: 1.0, bg5noev: 1.5, bg5ev: 1.8,
    enh33_3kw: 2, ev33_3kw: 0, enh33_5kw: 0, ev33_5kw: 0,
    enh74_3kw: 7, ev74_3kw: 0, enh74_5kw: 5, ev74_5kw: 0,
  });

  const results = useMemo(() => calculateHeadroom(inputs), [inputs]);

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    const payload = { ...communityData, maxExtra33: results.maxExtra33, totalFlats: inputs.flats3kw + inputs.flats5kw };

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
      
      {/* GLOBAL HEADER */}
      <header className="bg-[#0f1f3d] w-full py-4 px-8 border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-[11px] tracking-[3px] text-[#c9a84c] uppercase">
          <Zap size={14} className="text-[#c9a84c]" />
          Nevora Ecovolt
        </div>
        {step === 2 && (
          <div className="flex items-center gap-4">
             <div className="text-white/70 text-sm font-medium hidden md:block">{communityData.communityName}</div>
             <button 
                onClick={handleGenerateReport} 
                disabled={isSubmitting}
                className="bg-[#0a6e5c] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0d8a74] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <UploadCloud size={14} />
                {isSubmitting ? 'Syncing...' : 'Generate Proposal'}
              </button>
          </div>
        )}
      </header>

      <main className="px-4">
        {step === 1 && (
          <CommunityGate communityData={communityData} setCommunityData={setCommunityData} onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <div className="max-w-[1200px] mx-auto mt-0 bg-white shadow-xl min-h-[80vh] border-x border-b border-[#dddbd5]">
            
            {/* 5-TAB NAVIGATION */}
            <nav className="flex bg-[#1b3260] overflow-x-auto">
              {[
                { id: 'simulator', label: 'Simulator', icon: Settings },
                { id: 'tip33', label: '3.3 kW Tipping Point', icon: LineChart },
                { id: 'tip74', label: '7.4 kW Tipping Point', icon: LineChart },
                { id: 'summary', label: 'Summary Card', icon: FileText },
                { id: 'whymatters', label: 'Why It Matters', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'text-[#c9a84c] border-[#c9a84c] bg-[#0f1f3d]' 
                      : 'text-white/50 border-transparent hover:text-white/80 hover:bg-[#0f1f3d]/50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* TAB CONTENT AREAS */}
            <div className="p-8 md:p-12">
              {activeTab === 'simulator' && (
                <SimulatorUI inputs={inputs} setInputs={setInputs} results={results} />
              )}
              
              {activeTab === 'tip33' && (
                <div className="animate-fadeUp">
                  <h2 className="text-3xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-2">Scenario A: 3.3 kW Charger</h2>
                  <p className="text-[#6b6b7a] mb-8">Each row shows transformer load when exactly N EV users are charging simultaneously.</p>
                  <TippingPointChart inputs={inputs} results={results} scenario={3.3} />
                </div>
              )}

              {activeTab === 'tip74' && (
                <div className="animate-fadeUp">
                  <h2 className="text-3xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-2">Scenario B: 7.4 kW Charger</h2>
                  <p className="text-[#6b6b7a] mb-8">Each row shows transformer load when exactly N EV users are charging simultaneously.</p>
                  <TippingPointChart inputs={inputs} results={results} scenario={7.4} />
                </div>
              )}

              {activeTab === 'summary' && (
                <SummaryCard inputs={inputs} results={results} communityData={communityData} />
              )}

              {activeTab === 'whymatters' && (
                <WhyItMatters inputs={inputs} results={results} communityData={communityData} />
              )}
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