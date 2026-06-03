import React from 'react';
import { SimInputs, SimResults } from '../lib/calculator';
import { CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';

interface SummaryProps {
  inputs: SimInputs;
  results: SimResults;
  communityData: { communityName: string };
}

export default function SummaryCard({ inputs, results, communityData }: SummaryProps) {
  const totalFlats = inputs.flats3kw + inputs.flats5kw;
  const totalKVA = inputs.transformerKVAs.reduce((sum, val) => sum + val, 0);
  const totalEV33 = inputs.ev33_3kw + inputs.ev33_5kw;
  const totalEV74 = inputs.ev74_3kw + inputs.ev74_5kw;

  const ScenarioBlock = ({ title, users, load, peak, util, headroom, maxUsers, isTeal }: any) => (
    <div className="bg-white rounded-2xl border border-[#dddbd5] shadow-sm overflow-hidden flex flex-col">
      <div className={`px-5 py-4 text-xs font-bold tracking-[2px] uppercase text-white ${isTeal ? 'bg-[#0a6e5c]' : 'bg-[#c0392b]'}`}>
        {title}
      </div>
      <div className="p-6 flex-1 flex flex-col gap-3 text-[13px]">
        <div className="flex justify-between py-2 border-b border-[#eeecea]"><span className="text-[#6b6b7a]">Total EV Users</span><span className="font-['JetBrains_Mono'] font-bold text-[#0f1f3d] flex items-center gap-1">{users}</span></div>
        <div className="flex justify-between py-2 border-b border-[#eeecea]"><span className="text-[#6b6b7a]">Total Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-[#0f1f3d]">{load.toFixed(1)} kW</span></div>
        <div className="flex justify-between py-2 border-b border-[#eeecea]"><span className="text-[#6b6b7a]">New Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-[#0f1f3d]">{peak.toFixed(1)}%</span></div>
        <div className="flex justify-between py-2 border-b border-[#eeecea]"><span className="text-[#6b6b7a]">Transformer Utilisation</span><span className={`font-['JetBrains_Mono'] font-bold ${util >= 100 ? 'text-[#c0392b]' : 'text-[#0f1f3d]'}`}>{util.toFixed(1)}%</span></div>
        <div className="flex justify-between py-2 border-b border-[#eeecea]"><span className="text-[#6b6b7a]">Headroom Remaining</span><span className="font-['JetBrains_Mono'] font-bold text-[#0f1f3d]">{headroom.toFixed(0)} kW</span></div>
        
        <div className="mt-auto pt-4 flex items-center justify-between bg-[#f7f6f2] p-4 rounded-xl border border-[#dddbd5]">
          <span className="font-semibold text-[#c0392b] flex items-center gap-2 text-xs uppercase tracking-wide">
            <AlertTriangle size={14} /> Max concurrent users
          </span>
          <span className="font-['JetBrains_Mono'] font-bold text-[#c0392b] text-lg">{maxUsers}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeUp">
      <div className="bg-gradient-to-br from-[#0f1f3d] to-[#162848] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
        <h2 className="text-3xl md:text-4xl font-['DM_Serif_Display'] mb-2">Transformer Headroom Report</h2>
        <p className="text-white/60 text-sm mb-8">For RWA / Association Presentation — {new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Transformer', val: totalKVA, unit: 'kVA' },
            { label: 'Usable', val: results.usable.toFixed(0), unit: 'kW' },
            { label: 'Total Flats', val: totalFlats, unit: 'units' },
            { label: 'Connected', val: results.connected.toFixed(0), unit: 'kW' },
            { label: 'Div Factor', val: results.divBase.toFixed(2), unit: 'baseline' },
            { label: 'Peak Demand', val: results.bescom.toFixed(1), unit: '%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">{stat.label}</div>
              <div className="font-['DM_Serif_Display'] text-2xl">{stat.val}</div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-white/40 mt-1">{stat.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioBlock 
          title="Scenario A — 3.3 kW Charger" 
          users={totalEV33} load={results.total33} peak={results.peak33} util={results.tfpct33} headroom={results.headroom33} maxUsers={results.maxExtra33} isTeal={true} 
        />
        <ScenarioBlock 
          title="Scenario B — 7.4 kW Charger" 
          users={totalEV74} load={results.total74} peak={results.peak74} util={results.tfpct74} headroom={results.headroom74} maxUsers={results.maxExtra74} isTeal={false} 
        />
      </div>

      <div className="bg-white border-l-4 border-[#c9a84c] rounded-r-2xl p-8 shadow-sm border-y border-r border-[#dddbd5]">
        <h3 className="text-xs font-bold tracking-[2px] text-[#6b6b7a] uppercase mb-4">Key Insight for Association</h3>
        <p className="text-[14px] leading-relaxed text-[#1a1a2e]">
          <strong>{communityData.communityName || 'This apartment'}</strong> operates on a <strong>{totalKVA} kVA transformer infrastructure</strong> with a safe usable capacity of <strong>{results.usable.toFixed(1)} kW</strong>. 
          The baseline diversity factor is <strong>{results.divBase.toFixed(2)}</strong>.
          <br/><br/>
          With 3.3 kW unmanaged chargers, the transformer overloads if more than <strong>{results.maxExtra33} users charge concurrently</strong>. 
          With 7.4 kW premium chargers, critical failure occurs at just <strong>{results.maxExtra74} concurrent users</strong>.
          <br/><br/>
          <em className="text-[#c0392b] font-medium flex items-center gap-2">
            <XOctagon size={16} /> Without a smart load-balancing architecture, unmanaged EV adoption will mathematically guarantee transformer failure.
          </em>
        </p>
      </div>
    </div>
  );
}