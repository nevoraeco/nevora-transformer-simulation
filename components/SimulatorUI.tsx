import React from 'react';
import { SimInputs, SimResults } from '../lib/calculator';

interface SimulatorProps {
  inputs: SimInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimInputs>>;
  results: SimResults;
}

// FIX: Moving InputGroup OUTSIDE the main component stops it from recreating on every keystroke, permanently fixing the focus bug.
const InputGroup = ({ 
  label, 
  unit, 
  value, 
  onChange 
}: { 
  label: string, 
  unit: string, 
  value: number, 
  onChange: (val: number) => void 
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-medium text-[#6b6b7a] tracking-[0.3px]">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-12 border-[1.5px] border-[#dddbd5] rounded-xl px-4 font-['JetBrains_Mono'] text-[15px] font-semibold text-[#0f1f3d] bg-[#f7f6f2] focus:bg-white focus:border-[#0a6e5c] focus:ring-4 focus:ring-[#0a6e5c]/10 outline-none transition-all"
        placeholder="0"
      />
      <span className="absolute right-4 top-3.5 text-[11px] text-[#6b6b7a] font-['JetBrains_Mono']">{unit}</span>
    </div>
  </div>
);

export default function SimulatorUI({ inputs, setInputs, results }: SimulatorProps) {
  
  const handleGenericChange = (key: keyof SimInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleNumTransformersChange = (val: number) => {
    const count = Math.max(1, val);
    setInputs(prev => {
      const newKVAs = [...prev.transformerKVAs];
      while (newKVAs.length < count) newKVAs.push(0);
      if (newKVAs.length > count) newKVAs.splice(count);
      return { ...prev, numTransformers: count, transformerKVAs: newKVAs };
    });
  };

  const handleTransformerCapacityChange = (index: number, val: number) => {
    setInputs(prev => {
      const newKVAs = [...prev.transformerKVAs];
      newKVAs[index] = val;
      return { ...prev, transformerKVAs: newKVAs };
    });
  };

  return (
    <div className="space-y-12 animate-fadeUp">
      
      {/* SECTION 1: Transformer & Building Profile */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Section 01</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Transformer Setup</h2>
        
        <div className="bg-white rounded-2xl border border-[#dddbd5] shadow-[0_4px_24px_rgba(15,31,61,0.06)] p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6b6b7a] tracking-[0.3px]">Number of Transformers</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={inputs.numTransformers || ''}
                  onChange={(e) => handleNumTransformersChange(parseInt(e.target.value) || 1)}
                  className="w-full h-12 border-[1.5px] border-[#dddbd5] rounded-xl px-4 font-['JetBrains_Mono'] text-[15px] font-semibold text-[#0f1f3d] bg-[#f7f6f2] focus:bg-white focus:border-[#0a6e5c] focus:ring-4 focus:ring-[#0a6e5c]/10 outline-none transition-all"
                />
                <span className="absolute right-4 top-3.5 text-[11px] text-[#6b6b7a] font-['JetBrains_Mono']">units</span>
              </div>
            </div>
            <InputGroup label="Power Factor" unit="ratio" value={inputs.powerFactor} onChange={(val) => handleGenericChange('powerFactor', val)} />
            <InputGroup label="Safety Buffer" unit="%" value={inputs.buffer} onChange={(val) => handleGenericChange('buffer', val)} />
          </div>

          {/* DYNAMIC INDIVIDUAL CAPACITY FIELDS */}
          <div className="p-5 bg-[#f7f6f2] rounded-xl border border-[#eeecea]">
            <h3 className="text-xs font-bold text-[#0f1f3d] uppercase tracking-[1.5px] mb-4">Specify Transformer Loads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputs.transformerKVAs.map((kva, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-[#6b6b7a]">Transformer {index + 1} Capacity</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kva === 0 ? '' : kva}
                      onChange={(e) => handleTransformerCapacityChange(index, parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#dddbd5] rounded-lg px-3 font-['JetBrains_Mono'] text-[14px] font-semibold text-[#0f1f3d] bg-white focus:border-[#0a6e5c] outline-none transition-all"
                      placeholder="e.g. 250"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-[#6b6b7a] font-['JetBrains_Mono']">kVA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Connected Load Profile */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Section 02</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Sanctioned Community Load</h2>
        <div className="bg-white rounded-2xl border border-[#dddbd5] shadow-[0_4px_24px_rgba(15,31,61,0.06)] p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InputGroup label="3 kW Sanctioned Flats" unit="flats" value={inputs.flats3kw} onChange={(val) => handleGenericChange('flats3kw', val)} />
          <InputGroup label="5 kW Sanctioned Flats" unit="flats" value={inputs.flats5kw} onChange={(val) => handleGenericChange('flats5kw', val)} />
          <InputGroup label="Common Meters" unit="meters" value={inputs.commonMeters} onChange={(val) => handleGenericChange('commonMeters', val)} />
          <InputGroup label="Common Load (per meter)" unit="kW" value={inputs.commonLoad} onChange={(val) => handleGenericChange('commonLoad', val)} />
        </div>
      </div>

      {/* LIVE METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#054a3d] to-[#0a6e5c] rounded-2xl p-6 shadow-md text-white">
          <div className="text-[11px] opacity-70 font-medium mb-2">Usable Grid Capacity</div>
          <div className="font-['DM_Serif_Display'] text-3xl">{results.usable.toFixed(1)} kW</div>
          <div className="text-[10px] opacity-50 font-['JetBrains_Mono'] mt-1">Net capacity available</div>
        </div>
        <div className="bg-[#0f1f3d] rounded-2xl p-6 shadow-md text-white">
          <div className="text-[11px] opacity-60 font-medium mb-2">Total Connected Load</div>
          <div className="font-['DM_Serif_Display'] text-3xl">{results.connected.toFixed(1)} kW</div>
          <div className="text-[10px] opacity-40 font-['JetBrains_Mono'] mt-1">Total allocation</div>
        </div>
        <div className="bg-white border border-[#dddbd5] rounded-2xl p-6 shadow-sm text-[#0f1f3d]">
          <div className="text-[11px] text-[#6b6b7a] font-medium mb-2">Baseline Diversity Factor</div>
          <div className="font-['DM_Serif_Display'] text-3xl">{results.divBase.toFixed(2)}</div>
          <div className="text-[10px] text-[#6b6b7a] font-['JetBrains_Mono'] mt-1">connected ÷ usable</div>
        </div>
        <div className="bg-white border border-[#dddbd5] rounded-2xl p-6 shadow-sm text-[#0f1f3d]">
          <div className="text-[11px] text-[#6b6b7a] font-medium mb-2">Current Peak Demand Estimate</div>
          <div className="font-['DM_Serif_Display'] text-3xl">{results.bescom.toFixed(1)}%</div>
          <div className="text-[10px] text-[#6b6b7a] font-['JetBrains_Mono'] mt-1">Pre-EV utilization</div>
        </div>
      </div>

      {/* SECTION 3: Scenario A (3.3 kW) */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Section 03</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Scenario A: 3.3 kW Slow Charging Impact</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#dddbd5] p-6 space-y-4 shadow-sm">
            <InputGroup label="3 kW Flats EV Users" unit="users" value={inputs.ev33_3kw} onChange={(val) => handleGenericChange('ev33_3kw', val)} />
            <InputGroup label="5 kW Flats EV Users" unit="users" value={inputs.ev33_5kw} onChange={(val) => handleGenericChange('ev33_5kw', val)} />
          </div>
          
          <div className="lg:col-span-2 bg-white border-l-4 border-[#0a6e5c] rounded-r-2xl border-y border-r border-[#dddbd5] p-6 flex flex-col justify-between shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Total Users</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#0a6e5c]">{inputs.ev33_3kw + inputs.ev33_5kw}</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#0f1f3d]">{results.peak33.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#c0392b]">{results.tfpct33.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Headroom</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#0f1f3d]">{results.headroom33.toFixed(0)} kW</span></div>
            </div>
            <div className="mt-4 bg-[#f7f6f2] p-4 rounded-xl border border-[#dddbd5] flex justify-between items-center text-sm">
              <span className="text-[#6b6b7a]">Additional concurrent users supported before overload:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#c0392b] text-base">{results.maxExtra33}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Scenario B (7.4 kW) */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Section 04</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Scenario B: 7.4 kW Premium Fast Charging Impact</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#dddbd5] p-6 space-y-4 shadow-sm">
            <InputGroup label="3 kW Flats EV Users" unit="users" value={inputs.ev74_3kw} onChange={(val) => handleGenericChange('ev74_3kw', val)} />
            <InputGroup label="5 kW Flats EV Users" unit="users" value={inputs.ev74_5kw} onChange={(val) => handleGenericChange('ev74_5kw', val)} />
          </div>
          
          <div className="lg:col-span-2 bg-white border-l-4 border-[#b8881a] rounded-r-2xl border-y border-r border-[#dddbd5] p-6 flex flex-col justify-between shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Total Users</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#b8881a]">{inputs.ev74_3kw || (inputs.ev74_3kw + inputs.ev74_5kw)}</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#0f1f3d]">{results.peak74.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#c0392b]">{results.tfpct74.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#f7f6f2] rounded-xl"><span className="block text-[11px] text-[#6b6b7a] mb-1">Headroom</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#0f1f3d]">{results.headroom74.toFixed(0)} kW</span></div>
            </div>
            <div className="mt-4 bg-[#f7f6f2] p-4 rounded-xl border border-[#dddbd5] flex justify-between items-center text-sm">
              <span className="text-[#6b6b7a]">Additional concurrent users supported before overload:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#c0392b] text-base">{results.maxExtra74}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Financial Risk Analysis Framework */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#6b6b7a] mb-2">Section 05</p>
        <h2 className="font-['DM_Serif_Display'] text-[22px] text-[#0f1f3d] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#dddbd5]">Infrastructure Risk & Cost Verdict</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0f1f3d] to-[#1b3260] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#0a6e5c] text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">Recommended</div>
            <h3 className="text-sm font-['JetBrains_Mono'] tracking-[1.5px] uppercase text-[#c9a84c] mb-1">Option A — EcoVolt Managed Architecture</h3>
            <p className="text-xs text-white/60 mb-6">Smart Load Balancing & Controlled Infrastructure Scalability</p>
            <div className="text-4xl font-['DM_Serif_Display'] text-white mb-4">₹0 <span className="text-sm font-['DM_Sans'] text-white/60 font-light">RWA Capital Expenditure</span></div>
            
            <ul className="space-y-3 text-[13px] text-white/80 border-t border-white/10 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#0a6e5c] font-bold">✓</span> Per-user smart device deployment</li>
              <li className="flex items-center gap-2"><span className="text-[#0a6e5c] font-bold">✓</span> Automated cloud load shedding schedules</li>
              <li className="flex items-center gap-2"><span className="text-[#0a6e5c] font-bold">✓</span> Eliminates localized peak risk entirely</li>
              <li className="flex items-center gap-2"><span className="text-[#0a6e5c] font-bold">✓</span> Secure energy billing & automated settlement</li>
            </ul>
          </div>

          <div className="bg-white border border-[#dddbd5] rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-['JetBrains_Mono'] tracking-[1.5px] uppercase text-[#6b6b7a] mb-1">Option B — Unmanaged (Do Nothing)</h3>
            <p className="text-xs text-[#6b6b7a] mb-6">Uncoordinated Charger Installations & Individual Additions</p>
            <div className="text-4xl font-['DM_Serif_Display'] text-[#c0392b] mb-4">₹8L - ₹20L <span className="text-sm font-['DM_Sans'] text-[#6b6b7a] font-light">Forced Emergency Upgrade</span></div>
            
            <ul className="space-y-3 text-[13px] text-[#6b6b7a] border-t border-[#dddbd5] pt-4">
              <li className="flex items-center gap-2"><span className="text-[#c0392b] font-bold">✗</span> Sudden transformer burnout on peak evening hours</li>
              <li className="flex items-center gap-2"><span className="text-[#c0392b] font-bold">✗</span> 4 to 12 weeks of complete blackout downtime during replacement</li>
              <li className="flex items-center gap-2"><span className="text-[#c0392b] font-bold">✗</span> Commercial penalties & mandatory technical reassessment</li>
              <li className="flex items-center gap-2"><span className="text-[#c0392b] font-bold">✗</span> Legal & liability disputes due to infrastructure degradation</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}