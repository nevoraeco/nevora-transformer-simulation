'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, LineChart, FileText, Zap, UploadCloud } from 'lucide-react';

import { calculateHeadroom, SimInputs } from '../lib/calculator';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import CommunityGate, { CommunityData } from '../components/CommunityGate';
import SimulatorUI from '../components/SimulatorUI';
import { TippingPointChart } from '../components/TippingPointChart';
import { SummaryTab } from '../components/SummaryCard';
import { WhyItMattersTab } from '../components/WhyItMatters';
import ReportSuccess from '../components/ReportSuccess';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

type TabView = 'simulator' | 'tip33' | 'tip74' | 'summary' | 'whymatters';

export default function SimulatorApp() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<TabView>('simulator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; url: string } | null>(null);

  // UX FIX 1: Native Smooth Scrolling on Tab Navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, step]);

  // UX FIX 2: Zero-Tolerance Input Scroll Blocker
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement?.getAttribute('type') === 'number') {
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const [communityData, setCommunityData] = useState<CommunityData>({ 
    communityName: '', address: '', totalFlats: '', operatorId: ''
  });

  const [inputs, setInputs] = useState<SimInputs>({
    numTransformers: 0, transformerKVAs: [], powerFactor: 0.9, buffer: 15, sanctionedLoad: 0,
    flatTiers: [
      { id: 'tier-3kw-default', sanctionedLoad: 3, count: 0, bgNoEv: 0.8, bgEv: 1.0, ev33: 0, enh33: 2, ev74: 0, enh74: 7 },
      { id: 'tier-5kw-default', sanctionedLoad: 5, count: 0, bgNoEv: 1.5, bgEv: 1.8, ev33: 0, enh33: 2, ev74: 0, enh74: 7 }
    ],
    commonMeters: [{ id: 'meter-common-default', name: 'Common Area Load', load: 0 }]
  });

  const results = useMemo(() => calculateHeadroom(inputs), [inputs]);

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    const payload = { 
      communityName: communityData.communityName, address: communityData.address,
      operatorName: communityData.operatorId, totalFlats: results.totalFlats,
      timestamp: new Date().toISOString(), totalKVA: results.totalKVA.toFixed(0),
      usableKW: results.usableKW.toFixed(1), baseActualDemand: results.baseActualDemand.toFixed(1),
      activeEVs33: results.totalEVUsers33, evLoad33: results.evActualDemand33.toFixed(1),
      totalSystemLoad33: results.totalSystemLoad33.toFixed(1), capacityPct33: results.capacityUsed33Pct.toFixed(1),
      headroom33: Math.max(0, results.usableKW - results.totalSystemLoad33).toFixed(1), maxUsers33: results.maxConcurrentUsers33,
      status33: results.capacityUsed33Pct >= 100 ? "OVERLOAD" : results.capacityUsed33Pct >= 85 ? "WARNING" : "SAFE",
      activeEVs74: results.totalEVUsers74, evLoad74: results.evActualDemand74.toFixed(1),
      totalSystemLoad74: results.totalSystemLoad74.toFixed(1), capacityPct74: results.capacityUsed74Pct.toFixed(1),
      headroom74: Math.max(0, results.usableKW - results.totalSystemLoad74).toFixed(1), maxUsers74: results.maxConcurrentUsers74,
      status74: results.capacityUsed74Pct >= 100 ? "OVERLOAD" : results.capacityUsed74Pct >= 85 ? "WARNING" : "SAFE",
      transformerRegistry: inputs.transformerKVAs.map((kva, i) => `TR ${i + 1}: ${kva} kVA`).join(" | ")
    };

    try {
      const response = await fetch('/api/submit-simulation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessData({ id: data.simulationId, url: data.reportUrl });
        setStep(3);
      } else {
        alert("Failed to generate report: " + data.message);
      }
    } catch (err) {
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 selection:bg-emerald selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 select-none">
            <span className="font-heading text-base font-bold tracking-wide text-foreground">
              Nevora's <span className="text-emerald">FluxEngine</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {step === 2 && (
              <span className="hidden md:inline-flex text-sm font-medium text-muted-foreground mr-2 font-mono">
                {communityData.communityName}
              </span>
            )}
            <ThemeSwitcher />
            {step === 2 && (
              <Button onClick={handleGenerateReport} disabled={isSubmitting} className="gap-2 font-heading tracking-wide uppercase text-[11px] font-bold shadow-emerald/20">
                <UploadCloud size={14} strokeWidth={2} />
                {isSubmitting ? 'Syncing...' : 'Generate Proposal'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-8 md:px-8 md:py-12 print:m-0 print:p-0">
        {step === 1 && <CommunityGate communityData={communityData} setCommunityData={setCommunityData} onNext={() => setStep(2)} />}
        {step === 2 && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabView)} className="w-full">
              <div className="border-b border-border bg-muted/10 overflow-x-auto scrollbar-hide fade-edges-x snap-x w-full print:hidden">
                <TabsList className="h-16 w-max justify-start rounded-none bg-transparent p-0 px-6 gap-2">
                  <TabsTrigger value="simulator" className="snap-start shrink-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:text-emerald gap-2 px-4 transition-all duration-300"><Settings size={16} /><span className="font-mono text-xs uppercase tracking-wider">Simulator</span></TabsTrigger>
                  <TabsTrigger value="tip33" className="snap-start shrink-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:text-emerald gap-2 px-4 transition-all duration-300"><LineChart size={16} /><span className="font-mono text-xs uppercase tracking-wider">3.3 kW Scenario</span></TabsTrigger>
                  <TabsTrigger value="tip74" className="snap-start shrink-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:text-emerald gap-2 px-4 transition-all duration-300"><LineChart size={16} /><span className="font-mono text-xs uppercase tracking-wider">7.4 kW Scenario</span></TabsTrigger>
                  <TabsTrigger value="summary" className="snap-start shrink-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:text-emerald gap-2 px-4 transition-all duration-300"><FileText size={16} /><span className="font-mono text-xs uppercase tracking-wider">Executive Summary</span></TabsTrigger>
                  <TabsTrigger value="whymatters" className="snap-start shrink-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:text-emerald gap-2 px-4 transition-all duration-300"><Zap size={16} /><span className="font-mono text-xs uppercase tracking-wider">Why It Matters</span></TabsTrigger>
                </TabsList>
              </div>
              <div className="p-6 md:p-8">
                <TabsContent value="simulator" className="mt-0 outline-none"><SimulatorUI inputs={inputs} setInputs={setInputs} results={results} communityData={communityData} onNext={() => setActiveTab('tip33')} onPrev={() => setStep(1)}/></TabsContent>
                <TabsContent value="tip33" className="mt-0 outline-none"><TippingPointChart scenario="A" inputs={inputs} results={results} onNext={() => setActiveTab('tip74')} onPrev={() => setActiveTab('simulator')}/></TabsContent>
                <TabsContent value="tip74" className="mt-0 outline-none"><TippingPointChart scenario="B" inputs={inputs} results={results} onNext={() => setActiveTab('summary')} onPrev={() => setActiveTab('tip33')}/></TabsContent>
                <TabsContent value="summary" className="mt-0 outline-none"><SummaryTab inputs={inputs} results={results} onNext={() => setActiveTab('whymatters')} onPrev={() => setActiveTab('tip74')}/></TabsContent>
                <TabsContent value="whymatters" className="mt-0 outline-none"><WhyItMattersTab inputs={inputs} results={results} onPrev={() => setActiveTab('summary')} onGenerate={handleGenerateReport}/></TabsContent>
              </div>
            </Tabs>
          </div>
        )}
        {step === 3 && successData && <ReportSuccess id={successData.id} url={successData.url} />}
      </main>
    </div>
  );
}