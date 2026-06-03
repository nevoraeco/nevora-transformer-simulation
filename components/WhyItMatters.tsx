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
  const tipping = inputs.maxExtra33 > 0 ? inputs.maxExtra33 : inputs.maxExtra74;
  
  // Guard against empty state
  if (totalEV === 0) {
    return (
      <div className="p-12 text-center text-[#6b6b7a] bg-white rounded-2xl border border-[#dddbd5]">
        <AlertTriangle size={32} className="mx-auto mb-4 text-[#c9a84c]" />
        <h3 className="text-xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-2">Awaiting Data</h3>
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
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Counter-Argument 01</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Probability of Simultaneous Charging</h2>
        
        <div className="bg-white rounded-2xl border border-[#dddbd5] p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1">
              <h3 className="text-xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-2">"Not everyone will charge at once."</h3>
              <p className="text-sm text-[#6b6b7a] leading-relaxed">Based on real EV charging behaviour, most users plug in between 7–10 PM. With a 4-hour average charge window, this is the statistical probability of overload on any given weeknight.</p>
            </div>
            <div className="bg-gradient-to-br from-[#0f1f3d] to-[#1b3260] text-center rounded-2xl p-6 min-w-[200px] shadow-lg">
              <div className="text-5xl font-['DM_Serif_Display'] text-[#c9a84c] mb-2">{probOverload}%</div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-white/50 uppercase tracking-wider">Probability of Overload</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[11px] font-bold text-[#6b6b7a] uppercase tracking-wider mb-2">Probability of N or more users charging simultaneously</div>
            {thresholds.map((t, i) => {
              const pr = Math.min(99, Math.round(binomialCDF(totalEV, t.k, p) * 100));
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-xs text-[#6b6b7a] w-40 flex-shrink-0">{t.label}</div>
                  <div className="flex-1 h-2.5 bg-[#eeecea] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pr}%`, backgroundColor: t.color }} />
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] font-bold w-12 text-right" style={{ color: t.color }}>{pr}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: COST COMPARISON */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Counter-Argument 02</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">The Cost of Doing Nothing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0a6e5c] to-[#054a3d] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="text-[10px] font-['JetBrains_Mono'] tracking-[2px] uppercase opacity-70 mb-4">Option A — Smart Solution</div>
            <h3 className="text-2xl font-['DM_Serif_Display'] mb-4">Nevora Managed Charging</h3>
            <div className="text-4xl font-['DM_Serif_Display'] mb-2">₹0</div>
            <div className="text-xs opacity-70 mb-8">RWA Capital Expenditure</div>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#e8c96a] flex-shrink-0" /> Per-user smart device (self-install)</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#e8c96a] flex-shrink-0" /> Energy metering & automated billing</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#e8c96a] flex-shrink-0" /> Load dynamically managed — transformer safe</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#e8c96a] flex-shrink-0" /> Scales limitlessly as EV adoption grows</li>
            </ul>
          </div>

          <div className="bg-white border border-[#dddbd5] rounded-2xl p-8 shadow-sm">
            <div className="text-[10px] font-['JetBrains_Mono'] tracking-[2px] uppercase text-[#6b6b7a] mb-4">Option B — Do Nothing</div>
            <h3 className="text-2xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-4">Transformer Overload</h3>
            <div className="text-4xl font-['DM_Serif_Display'] text-[#c0392b] mb-2">₹8–20 L</div>
            <div className="text-xs text-[#6b6b7a] mb-8">Forced emergency upgrade when failure occurs</div>
            <ul className="space-y-3 text-sm text-[#1a1a2e]">
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#c0392b] flex-shrink-0" /> BESCOM transformer upgrade: ₹8–15 Lakhs</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#c0392b] flex-shrink-0" /> Power outage during replacement: 4–12 weeks</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#c0392b] flex-shrink-0" /> Liability for resident appliance damage</li>
              <li className="flex items-center gap-2"><XOctagon size={16} className="text-[#c0392b] flex-shrink-0" /> Complete downtime for lifts & water pumps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}