'use client';

import React, { useState, useMemo } from 'react';
import { Settings, LineChart, FileText, Zap, UploadCloud } from 'lucide-react';

// Core Logic & Types
import { calculateHeadroom, SimInputs } from '../lib/calculator';

// Atomic UI Primitives
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

// Feature Views
import CommunityGate, { CommunityData } from '../components/CommunityGate';
import SimulatorUI from '../components/SimulatorUI';
import { TippingPointChart } from '../components/TippingPointChart';
import { SummaryTab } from '../components/SummaryCard';
import { WhyItMattersTab } from '../components/WhyItMatters';
import ReportSuccess from '../components/ReportSuccess';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

type TabView = 'simulator' | 'tip33' | 'tip74' | 'summary' | 'whymatters';

/**
 * Enterprise Application Orchestrator
 * Manages the high-level state flow, strict wizard progression, and the secure 
 * Google Apps Script export handshake for Nevora's FluxEngine.
 */
export default function SimulatorApp() {
  // Master Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<TabView>('simulator');
  
  // Export State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; url: string } | null>(null);

  // Phase 0: Gate Data
  const [communityData, setCommunityData] = useState<CommunityData>({ 
    communityName: '', 
    address: '', 
    totalFlats: '',
    operatorId: ''
  });

  // Phase 1: Engine Data (Strict Default Alignment)
  const [inputs, setInputs] = useState<SimInputs>({
    numTransformers: 0,
    transformerKVAs: [],
    powerFactor: 0.9,
    buffer: 15, // Default safety buffer
    sanctionedLoad: 0,
    flats3kw: 0,
    flats5kw: 0,
    commonMeters: 0,
    commonLoad: 0,
    // Scenario A Defaults
    enh33_3kw: 0,
    ev33_3kw: 0,
    enh33_5kw: 0,
    ev33_5kw: 0,
    // Scenario B Defaults
    enh74_3kw: 0,
    ev74_3kw: 0,
    enh74_5kw: 0,
    ev74_5kw: 0,
  });

  // Compute metrics dynamically when inputs change
  const results = useMemo(() => calculateHeadroom(inputs), [inputs]);

  // Handle Serverless Export Pipeline
  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    
    const totalFlats = Number(inputs.flats3kw || 0) + Number(inputs.flats5kw || 0);
    const payload = { 
      ...communityData, 
      maxExtra33: results.maxConcurrentUsers33, 
      totalFlats,
      timestamp: new Date().toISOString()
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
      alert("A network error occurred while communicating with the generation server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 ease-in-out selection:bg-emerald selection:text-white">
      
      {/* GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300 print:hidden">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-8">
          
          {/* Brand Mark */}
          <div className="flex items-center gap-2 select-none">
            <Zap size={18} className="text-emerald" strokeWidth={2} />
            <span className="font-heading text-sm font-bold tracking-widest text-emerald uppercase">
              Nevora FluxEngine
            </span>
          </div>
          
          {/* Action Center */}
          <div className="flex items-center gap-4">
            {step === 2 && (
              <span className="hidden md:inline-flex text-sm font-medium text-muted-foreground mr-2 font-mono">
                {communityData.communityName}
              </span>
            )}
            
            <ThemeSwitcher />

            {step === 2 && (
              <Button 
                onClick={handleGenerateReport} 
                disabled={isSubmitting}
                className="gap-2 font-heading tracking-wide uppercase text-[11px] font-bold shadow-emerald/20"
              >
                <UploadCloud size={14} strokeWidth={2} />
                {isSubmitting ? 'Syncing...' : 'Generate Proposal'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-8 md:px-8 md:py-12 print:m-0 print:p-0 print:max-w-none">
        
        {/* PHASE 1: Assessment Initialization Gate */}
        {step === 1 && (
          <CommunityGate 
            communityData={communityData} 
            setCommunityData={setCommunityData} 
            onNext={() => setStep(2)} 
          />
        )}

        {/* PHASE 2: Core Simulation & Analysis Dashboard */}
        {step === 2 && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
            
            {/* Master Tab Orchestrator (Controlled) */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabView)} className="w-full">
              
              <div className="border-b border-border bg-muted/10 overflow-x-auto scrollbar-thin print:hidden">
                <TabsList className="h-16 w-max justify-start rounded-none bg-transparent p-0 px-4 gap-2">
                  <TabsTrigger value="simulator" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald gap-2 px-4">
                    <Settings size={16} /> <span className="font-mono text-xs uppercase tracking-wider">Simulator</span>
                  </TabsTrigger>
                  <TabsTrigger value="tip33" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald gap-2 px-4">
                    <LineChart size={16} /> <span className="font-mono text-xs uppercase tracking-wider">3.3 kW Scenario</span>
                  </TabsTrigger>
                  <TabsTrigger value="tip74" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald gap-2 px-4">
                    <LineChart size={16} /> <span className="font-mono text-xs uppercase tracking-wider">7.4 kW Scenario</span>
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald gap-2 px-4">
                    <FileText size={16} /> <span className="font-mono text-xs uppercase tracking-wider">Executive Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="whymatters" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-emerald data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald gap-2 px-4">
                    <Zap size={16} /> <span className="font-mono text-xs uppercase tracking-wider">Why It Matters</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Individual Tab Viewports (With Navigation Callbacks) */}
              <div className="p-6 md:p-8">
                <TabsContent value="simulator" className="mt-0 outline-none">
                  <SimulatorUI 
                    inputs={inputs} 
                    setInputs={setInputs} 
                    results={results}
                    communityData={communityData} // Passed down for validation
                    onNext={() => setActiveTab('tip33')}
                    onPrev={() => setStep(1)}
                  />
                </TabsContent>
                
                <TabsContent value="tip33" className="mt-0 outline-none">
                  <TippingPointChart 
                    scenario="A" 
                    inputs={inputs} 
                    results={results}
                    onNext={() => setActiveTab('tip74')}
                    onPrev={() => setActiveTab('simulator')}
                  />
                </TabsContent>
                
                <TabsContent value="tip74" className="mt-0 outline-none">
                  <TippingPointChart 
                    scenario="B" 
                    inputs={inputs} 
                    results={results}
                    onNext={() => setActiveTab('summary')}
                    onPrev={() => setActiveTab('tip33')}
                  />
                </TabsContent>
                
                <TabsContent value="summary" className="mt-0 outline-none">
                  <SummaryTab 
                    inputs={inputs} 
                    results={results}
                    onNext={() => setActiveTab('whymatters')}
                    onPrev={() => setActiveTab('tip74')}
                  />
                </TabsContent>
                
                <TabsContent value="whymatters" className="mt-0 outline-none">
                  <WhyItMattersTab 
                    inputs={inputs} 
                    results={results}
                    onPrev={() => setActiveTab('summary')}
                    onGenerate={handleGenerateReport}
                  />
                </TabsContent>
              </div>

            </Tabs>
          </div>
        )}

        {/* PHASE 3: Completion State */}
        {step === 3 && successData && (
          <ReportSuccess id={successData.id} url={successData.url} />
        )}

      </main>
    </div>
  );
}