import React, { useMemo } from 'react';
import { SimInputs, SimResults } from '../lib/calculator';

interface TippingPointProps {
  inputs: SimInputs;
  results: SimResults;
  scenario: 3.3 | 7.4;
}

export default function TippingPointChart({ inputs, results, scenario }: TippingPointProps) {
  // 1. Generate the Table Data dynamically based on inputs
  const { rows, tippingAt, totalUsers } = useMemo(() => {
    const tableRows = [];
    const evTotal3 = scenario === 3.3 ? inputs.ev33_3kw : inputs.ev74_3kw;
    const evTotal5 = scenario === 3.3 ? inputs.ev33_5kw : inputs.ev74_5kw;
    const totalUsers = evTotal3 + evTotal5;
    
    // Sweep up to either the total users or a minimum of 30 for chart context
    const maxSweep = Math.max(totalUsers, 30);
    
    let tippingFound = false;
    let tippingAt: number | null = null;
    const commonLoad = inputs.commonMeters * inputs.commonLoad;

    for (let n = 0; n <= maxSweep; n++) {
      // Split simulated users proportionally between 3kW and 5kW flats
      const n3 = totalUsers > 0 ? Math.round((n * evTotal3) / totalUsers) : 0;
      const n5 = totalUsers > 0 ? n - n3 : 0;

      const evLoad = (n3 * (scenario + inputs.bg3ev)) + (n5 * (scenario + inputs.bg5ev));
      const bgLoad = ((inputs.flats3kw - n3) * inputs.bg3noev) + ((inputs.flats5kw - n5) * inputs.bg5noev);
      const total = evLoad + bgLoad + commonLoad;
      const pct = results.usable > 0 ? (total / results.usable) * 100 : 0;

      if (pct >= 100 && !tippingFound) {
        tippingFound = true;
        tippingAt = n;
      }

      // Determine Status Tier
      let status = { label: '✅ Safe', bg: 'bg-[#d1fae5]', text: 'text-[#065f46]' };
      if (pct >= 100) status = { label: '🔴 Overload', bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]' };
      else if (pct >= 90) status = { label: '⚠️ Warning', bg: 'bg-[#ffe4b5]', text: 'text-[#7c3e00]' };
      else if (pct >= 75) status = { label: '🟡 Caution', bg: 'bg-[#fef3c7]', text: 'text-[#92400e]' };

      tableRows.push({ n, evLoad, bgLoad, commonLoad, total, pct, status });
    }
    return { rows: tableRows, tippingAt, totalUsers };
  }, [inputs, results, scenario]);

  // 2. Gauge Chart Configuration
  const currentPct = scenario === 3.3 ? results.tfpct33 : results.tfpct74;
  const cappedPct = Math.min(currentPct, 100);
  const themeColor = scenario === 3.3 ? '#0a6e5c' : '#c0392b';
  
  // SVG Circle Math (Radius = 48, Circumference = 2 * Math.PI * 48 ≈ 301.6)
  const circumference = 301.6;
  const strokeDashoffset = circumference - (cappedPct / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-[#dddbd5] shadow-[0_4px_24px_rgba(15,31,61,0.06)] overflow-hidden mt-8">
      {/* Header & Gauge Section */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-b border-[#dddbd5]">
        
        {/* SVG Gauge */}
        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#f7f6f2" strokeWidth="10" />
            <circle 
              cx="60" cy="60" r="48" 
              fill="none" 
              stroke={currentPct >= 100 ? '#c0392b' : currentPct >= 90 ? '#d4890a' : themeColor} 
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className="font-['DM_Serif_Display'] text-2xl text-[#0f1f3d]">{currentPct.toFixed(0)}%</span>
            <span className="text-[10px] text-[#6b6b7a] font-['DM_Sans']">of capacity</span>
          </div>
        </div>

        {/* Dynamic Context Description */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-['DM_Serif_Display'] text-xl text-[#0f1f3d] mb-3 flex items-center justify-center md:justify-start gap-3">
            {scenario} kW Scenario
            {tippingAt !== null ? (
              <span className="text-[11px] font-bold font-['DM_Sans'] bg-[#c0392b] text-white px-3 py-1 rounded-full uppercase tracking-wide">
                Overloads at {tippingAt} Users
              </span>
            ) : (
              <span className="text-[11px] font-bold font-['DM_Sans'] bg-[#0a6e5c] text-white px-3 py-1 rounded-full uppercase tracking-wide">
                No Overload Risk
              </span>
            )}
          </h3>
          <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
            {tippingAt !== null 
              ? `Transformer overloads at exactly ${tippingAt} concurrent EV users. With ${totalUsers} total EV users in the building, even partial simultaneous charging is enough to trip the transformer.`
              : `With current inputs, the transformer stays within capacity even if all ${totalUsers} EV users charge simultaneously. Headroom is available.`}
          </p>
        </div>
      </div>

      {/* Sweep Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f1f3d] text-white sticky top-0 z-10">
            <tr>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">Users</th>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">EV Load</th>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">Background</th>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">Total Load</th>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">% Capacity</th>
              <th className="py-4 px-6 text-[11px] font-semibold font-['JetBrains_Mono'] tracking-[1.5px] uppercase whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                className={`
                  border-b border-[#f7f6f2] hover:bg-[#f7f6f2] transition-colors
                  ${row.pct >= 100 ? 'bg-[#fff0ee] hover:bg-[#ffe4e1]' : row.pct >= 90 ? 'bg-[#fff4e0]' : ''}
                `}
              >
                <td className={`py-3 px-6 font-['JetBrains_Mono'] text-[13px] ${row.n === totalUsers && row.n > 0 ? 'font-bold text-[#0f1f3d]' : 'text-[#6b6b7a]'}`}>
                  {row.n}
                </td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#0f1f3d]">{row.evLoad.toFixed(1)} kW</td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#0f1f3d]">{row.bgLoad.toFixed(1)} kW</td>
                <td className="py-3 px-6 font-['JetBrains_Mono'] text-[13px] text-[#0f1f3d] font-semibold">{row.total.toFixed(1)} kW</td>
                <td className={`py-3 px-6 font-['JetBrains_Mono'] text-[13px] ${row.pct >= 100 ? 'text-[#c0392b] font-bold' : 'text-[#0f1f3d]'}`}>
                  {row.pct.toFixed(1)}%
                </td>
                <td className="py-3 px-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${row.status.bg} ${row.status.text}`}>
                    {row.status.label}
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