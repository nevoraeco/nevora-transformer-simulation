import React, { useMemo } from 'react';
import { SimInputs, SimResults } from '../lib/calculator';
import { Zap, AlertTriangle, CheckCircle2, XOctagon } from 'lucide-react';

interface WhyProps {
  inputs: SimInputs;
  results: SimResults;
  communityData: { communityName: string };
}

// Math Helpers
const combination = (n: number, k: number) => {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) result = result * (n - i) / (i + 1);
  return result;
};
const binomPMF = (n: number, k: number, p: number) => (k > n) ? 0 : combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
const binomialCDF = (n: number, k: number, p: number) => {
  let cumulative = 0;
  for (let i = 0; i < k; i++) cumulative += binomPMF(n, i, p);
  return Math.max(0, Math.min(1, 1 - cumulative));
};

export default function WhyItMatters({ inputs, results, communityData }: WhyProps) {
  const totalEV = Math.max(inputs.ev33_3kw + inputs.ev33_5kw, inputs.ev74_3kw + inputs.ev74_5kw);
  const totalFlats = inputs.flats3kw + inputs.flats5kw;
  const tipping = results.maxExtra33 > 0 ? results.maxExtra33 : results.maxExtra74;
  
  // Guard against empty state
  if (totalEV === 0) {
    return (
      <div className="p-12 text-center text-[#94A3B8] bg-[#1A1D26] rounded-xl border border-[#2D323F]">
        <AlertTriangle size={32} className="mx-auto mb-4 text-[#D97706]" />
        <h3 className="text-xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-2">Awaiting Data</h3>
        <p>Please enter EV user assumptions in the Simulator tab to generate the Risk Analysis.</p>
      </div>
    );
  }

  const p = 0.55; // 55% chance of charging in the 4-hour peak window
  const safeConc = tipping > 0 ? tipping : 1;
  const probOverload = tipping > 0 ? Math.min(99, Math.round(binomialCDF(totalEV, safeConc, p) * 100)) : 99;

  const thresholds = [
    { label: `${Math.max(1, Math.round(safeConc * 0.25))} users (25% of limit)`, k: Math.max(1, Math.round(safeConc * 0.25)), color: '#0a6e5c' },
    { label: `${Math.max(1, Math.round(safeConc * 0.50))} users (50% of limit)`, k: Math.max(1, Math.round(safeConc * 0.50)), color: '#d4890a' },
    { label: `${Math.max(1, Math.round(safeConc * 0.75))} users (75% of limit)`, k: Math.max(1, Math.round(safeConc * 0.75)), color: '#e06b00' },
    { label: `${safeConc} users (OVERLOAD)`, k: safeConc, color: '#c0392b' },
  ].filter(t => t.k <= totalEV);

  const costManaged = (totalEV * 20000) / 100000; // in Lakhs

  return (
    <div className="space-y-12 animate-fadeUp">
      {/* SECTION 1: PROBABILITY */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Counter-Argument 01</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Probability of Simultaneous Charging</h2>
        
        <div className="bg-[#1A1D26] rounded-xl border border-[#2D323F] p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1">
              <h3 className="text-xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-2">"Not everyone will charge at once."</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">Based on real EV charging behaviour, most users plug in between 7–10 PM. With a 4-hour average charge window, this is the statistical probability of overload on any given weeknight.</p>
            </div>
            <div className="bg-gradient-to-br from-[#1A1D26] to-[#0A0C12] text-center rounded-lg p-6 min-w-[200px] shadow-xl border border-[#2D323F]">
              <div className="text-5xl font-['Montserrat'] font-bold text-[#10B981] mb-2">{probOverload}%</div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-[#94A3B8] uppercase tracking-wider">Probability of Overload</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Probability of N or more users charging simultaneously</div>
            {thresholds.map((t, i) => {
              const pr = Math.min(99, Math.round(binomialCDF(totalEV, t.k, p) * 100));
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-xs text-[#94A3B8] w-40 flex-shrink-0">{t.label}</div>
                  <div className="flex-1 h-2.5 bg-[#2D323F] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pr}%`, backgroundColor: t.color === '#0a6e5c' ? '#10B981' : t.color === '#d4890a' ? '#D97706' : t.color === '#e06b00' ? '#F97316' : '#EF4444' }} />
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] font-bold w-12 text-right" style={{ color: t.color === '#0a6e5c' ? '#10B981' : t.color === '#d4890a' ? '#D97706' : t.color === '#e06b00' ? '#F97316' : '#EF4444' }}>{pr}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: COST COMPARISON */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Counter-Argument 02</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">The Cost of Doing Nothing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0A6E5C] to-[#073D2C] rounded-xl p-8 text-[#e2e8f0] shadow-lg relative overflow-hidden border border-[#10B981]/30">
            <div className="text-[10px] font-['JetBrains_Mono'] tracking-[2px] uppercase opacity-80 mb-4 text-[#10B981] font-semibold">Option A — Smart Solution</div>
            <h3 className="text-2xl font-['Montserrat'] font-bold mb-4 text-[#e2e8f0]">Nevora Managed Charging</h3>
            <div className="text-4xl font-['Montserrat'] font-bold mb-2 text-[#10B981]">₹0</div>
            <div className="text-xs opacity-70 mb-8">RWA Capital Expenditure</div>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" /> Per-user smart device (self-install)</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" /> Energy metering & automated billing</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" /> Load dynamically managed — transformer safe</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" /> Scales limitlessly as EV adoption grows</li>
            </ul>
          </div>

          <div className="bg-[#1A1D26] border border-[#2D323F] rounded-xl p-8 shadow-lg">
            <div className="text-[10px] font-['JetBrains_Mono'] tracking-[2px] uppercase text-[#94A3B8] mb-4 font-semibold">Option B — Do Nothing</div>
            <h3 className="text-2xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-4">Transformer Overload</h3>
            <div className="text-4xl font-['Montserrat'] font-bold text-[#EF4444] mb-2">₹8–20 L</div>
            <div className="text-xs text-[#94A3B8] mb-8">Forced emergency upgrade when failure occurs</div>
            <ul className="space-y-3 text-sm text-[#cbd5e1]">
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#EF4444] flex-shrink-0" /> BESCOM transformer upgrade: ₹8–15 Lakhs</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#EF4444] flex-shrink-0" /> Power outage during replacement: 4–12 weeks</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#EF4444] flex-shrink-0" /> Liability for resident appliance damage</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#EF4444] flex-shrink-0" /> Complete downtime for lifts & water pumps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}