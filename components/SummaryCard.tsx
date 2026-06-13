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
    <div className="bg-[#1A1D26] rounded-xl border border-[#2D323F] shadow-lg overflow-hidden flex flex-col">
      <div className={`px-5 py-4 text-xs font-bold tracking-[2px] uppercase text-[#090A0F] ${isTeal ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}>
        {title}
      </div>
      <div className="p-6 flex-1 flex flex-col gap-3 text-[13px]">
        <div className="flex justify-between py-2 border-b border-[#2D323F]"><span className="text-[#94A3B8]">Total EV Users</span><span className="font-['JetBrains_Mono'] font-bold text-[#e2e8f0] flex items-center gap-1">{users}</span></div>
        <div className="flex justify-between py-2 border-b border-[#2D323F]"><span className="text-[#94A3B8]">Total Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-[#e2e8f0]">{load.toFixed(1)} kW</span></div>
        <div className="flex justify-between py-2 border-b border-[#2D323F]"><span className="text-[#94A3B8]">New Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-[#e2e8f0]">{peak.toFixed(1)}%</span></div>
        <div className="flex justify-between py-2 border-b border-[#2D323F]"><span className="text-[#94A3B8]">Transformer Utilisation</span><span className={`font-['JetBrains_Mono'] font-bold ${util >= 100 ? 'text-[#EF4444]' : 'text-[#e2e8f0]'}`}>{util.toFixed(1)}%</span></div>
        <div className="flex justify-between py-2 border-b border-[#2D323F]"><span className="text-[#94A3B8]">Headroom Remaining</span><span className="font-['JetBrains_Mono'] font-bold text-[#e2e8f0]">{headroom.toFixed(0)} kW</span></div>
        
        <div className="mt-auto pt-4 flex items-center justify-between bg-[#0A0C12] p-4 rounded-lg border border-[#2D323F]">
          <span className="font-semibold text-[#EF4444] flex items-center gap-2 text-xs uppercase tracking-wide">
            <AlertTriangle size={14} /> Max concurrent users
          </span>
          <span className="font-['JetBrains_Mono'] font-bold text-[#EF4444] text-lg">{maxUsers}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeUp">
      <div className="bg-gradient-to-br from-[#1A1D26] to-[#0A0C12] rounded-xl p-8 md:p-10 text-[#e2e8f0] relative overflow-hidden shadow-xl border border-[#2D323F]">
        <h2 className="text-3xl md:text-4xl font-['Montserrat'] font-bold mb-2">Transformer Headroom Report</h2>
        <p className="text-[#94A3B8] text-sm mb-8">For RWA / Association Presentation — {new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Transformer', val: totalKVA, unit: 'kVA' },
            { label: 'Usable', val: results.usable.toFixed(0), unit: 'kW' },
            { label: 'Total Flats', val: totalFlats, unit: 'units' },
            { label: 'Connected', val: results.connected.toFixed(0), unit: 'kW' },
            { label: 'Div Factor', val: results.divBase.toFixed(2), unit: 'baseline' },
            { label: 'Peak Demand', val: results.bescom.toFixed(1), unit: '%' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#2D323F]/30 border border-[#2D323F] rounded-lg p-4">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-2">{stat.label}</div>
              <div className="font-['Montserrat'] font-bold text-2xl text-[#e2e8f0]">{stat.val}</div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-[#64748b] mt-1">{stat.unit}</div>
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

      <div className="bg-[#1A1D26] border-l-4 border-[#10B981] rounded-r-lg p-8 shadow-lg border-y border-r border-[#2D323F]">
        <h3 className="text-xs font-bold tracking-[2px] text-[#94A3B8] uppercase mb-4">Key Insight for Association</h3>
        <p className="text-[14px] leading-relaxed text-[#cbd5e1]">
          <strong className="text-[#e2e8f0]">{communityData.communityName || 'This apartment'}</strong> operates on a <strong className="text-[#e2e8f0]">{totalKVA} kVA transformer infrastructure</strong> with a safe usable capacity of <strong className="text-[#e2e8f0]">{results.usable.toFixed(1)} kW</strong>. 
          The baseline diversity factor is <strong className="text-[#e2e8f0]">{results.divBase.toFixed(2)}</strong>.
          <br/><br/>
          With 3.3 kW unmanaged chargers, the transformer overloads if more than <strong className="text-[#e2e8f0]">{results.maxExtra33} users charge concurrently</strong>. 
          With 7.4 kW premium chargers, critical failure occurs at just <strong className="text-[#e2e8f0]">{results.maxExtra74} concurrent users</strong>.
          <br/><br/>
          <em className="text-[#EF4444] font-medium flex items-center gap-2">
            <XOctagon size={16} /> Without a smart load-balancing architecture, unmanaged EV adoption will mathematically guarantee transformer failure.
          </em>
        </p>
      </div>
    </div>
  );
}