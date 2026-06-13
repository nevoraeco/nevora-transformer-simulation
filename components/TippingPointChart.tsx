import React, { useMemo } from 'react';
import { SimInputs, SimResults } from '../lib/calculator';
import { CheckCircle2, AlertCircle, AlertTriangle, XOctagon } from 'lucide-react';

interface TippingPointProps {
  inputs: SimInputs;
  results: SimResults;
  scenario: 3.3 | 7.4;
}

export default function TippingPointChart({ inputs, results, scenario }: TippingPointProps) {
  const { rows, tippingAt, totalUsers } = useMemo(() => {
    const tableRows = [];
    const evTotal3 = scenario === 3.3 ? inputs.ev33_3kw : inputs.ev74_3kw;
    const evTotal5 = scenario === 3.3 ? inputs.ev33_5kw : inputs.ev74_5kw;
    const totalUsers = evTotal3 + evTotal5;
    const maxSweep = Math.max(totalUsers, 30);
    
    let tippingFound = false;
    let tippingAt: number | null = null;
    const commonLoad = inputs.commonMeters * inputs.commonLoad;

    for (let n = 0; n <= maxSweep; n++) {
      const n3 = totalUsers > 0 ? Math.round((n * evTotal3) / totalUsers) : 0;
      const n5 = totalUsers > 0 ? n - n3 : 0;
      const evLoad = (n3 * (scenario + inputs.bg3ev)) + (n5 * (scenario + inputs.bg5ev));
      const bgLoad = ((inputs.flats3kw - n3) * inputs.bg3noev) + ((inputs.flats5kw - n5) * inputs.bg5noev);
      const total = evLoad + bgLoad + commonLoad;
      const pct = results.usable > 0 ? (total / results.usable) * 100 : 0;

      if (pct >= 100 && !tippingFound) { tippingFound = true; tippingAt = n; }

      // Icon replacement logic
      let status = { label: 'Safe', icon: CheckCircle2, bg: 'bg-[#d1fae5]', text: 'text-[#065f46]' };
      if (pct >= 100) status = { label: 'Overload', icon: XOctagon, bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]' };
      else if (pct >= 90) status = { label: 'Warning', icon: AlertTriangle, bg: 'bg-[#ffe4b5]', text: 'text-[#7c3e00]' };
      else if (pct >= 75) status = { label: 'Caution', icon: AlertCircle, bg: 'bg-[#fef3c7]', text: 'text-[#92400e]' };

      tableRows.push({ n, evLoad, bgLoad, commonLoad, total, pct, status });
    }
    return { rows: tableRows, tippingAt, totalUsers };
  }, [inputs, results, scenario]);

  const currentPct = scenario === 3.3 ? results.tfpct33 : results.tfpct74;
  const cappedPct = Math.min(currentPct, 100);
  const themeColor = scenario === 3.3 ? '#0a6e5c' : '#c0392b';
  const circumference = 301.6;
  const strokeDashoffset = circumference - (cappedPct / 100) * circumference;

  return (
    <div className="bg-[#1A1D26] rounded-xl border border-[#2D323F] shadow-lg overflow-hidden mt-6">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-b border-[#2D323F]">
        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#0A0C12" strokeWidth="10" />
            <circle cx="60" cy="60" r="48" fill="none" stroke={currentPct >= 100 ? '#EF4444' : currentPct >= 90 ? '#D97706' : '#10B981'} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-700 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className="font-['Montserrat'] font-bold text-2xl text-[#e2e8f0]">{currentPct.toFixed(0)}%</span>
            <span className="text-[10px] text-[#94A3B8] font-['DM_Sans']">of capacity</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-['Montserrat'] font-bold text-xl text-[#e2e8f0] mb-3 flex items-center justify-center md:justify-start gap-3">
            {scenario} kW Scenario Load
            {tippingAt !== null ? (
              <span className="text-[10px] font-bold font-['JetBrains_Mono'] bg-[#EF4444] text-[#090A0F] px-3 py-1 rounded-md uppercase tracking-widest flex items-center gap-1"><XOctagon size={12} /> Overloads at {tippingAt} Users</span>
            ) : (
              <span className="text-[10px] font-bold font-['JetBrains_Mono'] bg-[#10B981] text-[#090A0F] px-3 py-1 rounded-md uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Safe</span>
            )}
          </h3>
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">
            {tippingAt !== null ? `Transformer capacity will fail at exactly ${tippingAt} concurrent users. With ${totalUsers} EV users registered, unmanaged charging is a severe risk.` : `The transformer remains within safe operational limits even if all ${totalUsers} active EV users charge simultaneously.`}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#090A0F] text-[#e2e8f0] sticky top-0 z-10">
            <tr>
              {['Users', 'EV Load', 'Background', 'Total Load', '% Capacity', 'Status'].map(h => (
                <th key={h} className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#1A1D26]">
            {rows.map((row, idx) => (
              <tr key={idx} className={`border-b border-[#2D323F] transition-colors ${row.pct >= 100 ? 'bg-[#EF4444]/5' : row.pct >= 90 ? 'bg-[#D97706]/5' : ''}`}>
                <td className={`py-3 px-6 font-['JetBrains_Mono'] text-[13px] ${row.n === totalUsers && row.n > 0 ? 'font-bold text-[#e2e8f0]' : 'text-[#94A3B8]'}`}>{row.n}</td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#cbd5e1]">{row.evLoad.toFixed(1)} kW</td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#cbd5e1]">{row.bgLoad.toFixed(1)} kW</td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e2e8f0] font-semibold">{row.total.toFixed(1)} kW</td>
                <td className={`py-3 px-6 font-['JetBrains_Mono'] text-[13px] ${row.pct >= 100 ? 'text-[#EF4444] font-bold' : 'text-[#cbd5e1]'}`}>{row.pct.toFixed(1)}%</td>
                <td className="py-3 px-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    row.status.label === 'Safe' ? 'bg-[#10B981]/15 text-[#10B981]' :
                    row.status.label === 'Overload' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
                    row.status.label === 'Warning' ? 'bg-[#D97706]/15 text-[#D97706]' :
                    'bg-[#60A5FA]/15 text-[#60A5FA]'
                  }`}>
                    <row.status.icon size={12} /> {row.status.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}