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
    <label className="text-xs font-medium text-[#94A3B8] tracking-[0.3px]">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-12 border-[1.5px] border-[#2D323F] rounded-lg px-4 font-['JetBrains_Mono'] text-[15px] font-semibold text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:bg-[#1A1D26] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 outline-none transition-all placeholder:text-[#475569]"
        placeholder="0"
      />
      <span className="absolute right-4 top-3.5 text-[11px] text-[#94A3B8] font-['JetBrains_Mono']">{unit}</span>
    </div>
  </div>
);

export default function SimulatorUI({ inputs, setInputs, results }: SimulatorProps) {
  
  const handleGenericChange = (key: keyof SimInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleNumTransformersChange = (val: number) => {
    Math.max(0, val);
    Math.min(20, val); 
    const count = Math.min(20, Math.max(0, val)); 

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
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Section 01</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Transformer Setup</h2>
        
        <div className="bg-[#1A1D26] rounded-xl border border-[#2D323F] shadow-lg p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#94A3B8] tracking-[0.3px]">Number of Transformers</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={inputs.numTransformers === 0 ? '': inputs.numTransformers}
                  onChange={(e) => handleNumTransformersChange(parseInt(e.target.value) || 1)}
                  className="w-full h-12 border-[1.5px] border-[#2D323F] rounded-lg px-4 font-['JetBrains_Mono'] text-[15px] font-semibold text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:bg-[#1A1D26] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 outline-none transition-all placeholder:text-[#475569]"
                />
                <span className="absolute right-4 top-3.5 text-[11px] text-[#94A3B8] font-['JetBrains_Mono']">units</span>
              </div>
            </div>
            <InputGroup label="Power Factor" unit="ratio" value={inputs.powerFactor} onChange={(val) => handleGenericChange('powerFactor', val)} />
            <InputGroup label="Safety Buffer" unit="%" value={inputs.buffer} onChange={(val) => handleGenericChange('buffer', val)} />
          </div>

          {/* DYNAMIC INDIVIDUAL CAPACITY FIELDS */}
          <div className="p-5 bg-[#0A0C12] rounded-lg border border-[#2D323F]">
            <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-[1.5px] mb-4">Specify Transformer Loads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputs.transformerKVAs.map((kva, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Transformer {index + 1} Capacity</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kva === 0 ? '' : kva}
                      onChange={(e) => handleTransformerCapacityChange(index, parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#2D323F] rounded-md px-3 font-['JetBrains_Mono'] text-[14px] font-semibold text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all placeholder:text-[#475569]"
                      placeholder="e.g. 250"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-[#94A3B8] font-['JetBrains_Mono']">kVA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Connected Load Profile */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Section 02</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Sanctioned Community Load</h2>
        <div className="bg-[#1A1D26] rounded-xl border border-[#2D323F] shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InputGroup label="3 kW Sanctioned Flats" unit="flats" value={inputs.flats3kw} onChange={(val) => handleGenericChange('flats3kw', val)} />
          <InputGroup label="5 kW Sanctioned Flats" unit="flats" value={inputs.flats5kw} onChange={(val) => handleGenericChange('flats5kw', val)} />
          <InputGroup label="Common Meters" unit="meters" value={inputs.commonMeters} onChange={(val) => handleGenericChange('commonMeters', val)} />
          <InputGroup label="Common Load (per meter)" unit="kW" value={inputs.commonLoad} onChange={(val) => handleGenericChange('commonLoad', val)} />
        </div>
      </div>

      {/* LIVE METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0A6E5C] to-[#10B981] rounded-xl p-6 shadow-lg text-white border border-[#10B981]/20">
          <div className="text-[11px] opacity-80 font-medium mb-2 font-['JetBrains_Mono'] tracking-wide">Usable Grid Capacity</div>
          <div className="font-['Montserrat'] font-bold text-3xl">{results.usable.toFixed(1)} kW</div>
          <div className="text-[10px] opacity-60 font-['JetBrains_Mono'] mt-1">Net capacity available</div>
        </div>
        <div className="bg-[#0A0C12] rounded-xl p-6 shadow-lg text-[#e2e8f0] border border-[#2D323F]">
          <div className="text-[11px] opacity-70 font-medium mb-2 font-['JetBrains_Mono'] tracking-wide">Total Connected Load</div>
          <div className="font-['Montserrat'] font-bold text-3xl">{results.connected.toFixed(1)} kW</div>
          <div className="text-[10px] opacity-50 font-['JetBrains_Mono'] mt-1">Total allocation</div>
        </div>
        <div className="bg-[#1A1D26] border border-[#2D323F] rounded-xl p-6 shadow-lg text-[#e2e8f0]">
          <div className="text-[11px] text-[#94A3B8] font-medium mb-2 font-['JetBrains_Mono'] tracking-wide">Baseline Diversity Factor</div>
          <div className="font-['Montserrat'] font-bold text-3xl">{results.divBase.toFixed(2)}</div>
          <div className="text-[10px] text-[#94A3B8] font-['JetBrains_Mono'] mt-1">connected ÷ usable</div>
        </div>
        <div className="bg-[#1A1D26] border border-[#2D323F] rounded-xl p-6 shadow-lg text-[#e2e8f0]">
          <div className="text-[11px] text-[#94A3B8] font-medium mb-2 font-['JetBrains_Mono'] tracking-wide">Current Peak Demand Estimate</div>
          <div className="font-['Montserrat'] font-bold text-3xl">{results.bescom.toFixed(1)}%</div>
          <div className="text-[10px] text-[#94A3B8] font-['JetBrains_Mono'] mt-1">Pre-EV utilization</div>
        </div>
      </div>

      {/* SECTION 3: Scenario A (3.3 kW) */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Section 03</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Scenario A: 3.3 kW Slow Charging Impact</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#1A1D26] rounded-xl border border-[#2D323F] p-6 space-y-4 shadow-lg">
            <InputGroup label="3 kW Flats EV Users" unit="users" value={inputs.ev33_3kw} onChange={(val) => handleGenericChange('ev33_3kw', val)} />
            <InputGroup label="5 kW Flats EV Users" unit="users" value={inputs.ev33_5kw} onChange={(val) => handleGenericChange('ev33_5kw', val)} />
          </div>
          
          <div className="lg:col-span-2 bg-[#1A1D26] border-l-4 border-[#10B981] rounded-r-xl border-y border-r border-[#2D323F] p-6 flex flex-col justify-between shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Total Users</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#10B981]">{inputs.ev33_3kw + inputs.ev33_5kw}</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#e2e8f0]">{results.peak33.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#EF4444]">{results.tfpct33.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Headroom</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#e2e8f0]">{results.headroom33.toFixed(0)} kW</span></div>
            </div>
            <div className="mt-4 bg-[#0A0C12] p-4 rounded-lg border border-[#2D323F] flex justify-between items-center text-sm">
              <span className="text-[#94A3B8]">Additional concurrent users supported before overload:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#EF4444] text-base">{results.maxExtra33}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Scenario B (7.4 kW) */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Section 04</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Scenario B: 7.4 kW Premium Fast Charging Impact</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#1A1D26] rounded-xl border border-[#2D323F] p-6 space-y-4 shadow-lg">
            <InputGroup label="3 kW Flats EV Users" unit="users" value={inputs.ev74_3kw} onChange={(val) => handleGenericChange('ev74_3kw', val)} />
            <InputGroup label="5 kW Flats EV Users" unit="users" value={inputs.ev74_5kw} onChange={(val) => handleGenericChange('ev74_5kw', val)} />
          </div>
          
          <div className="lg:col-span-2 bg-[#1A1D26] border-l-4 border-[#D97706] rounded-r-xl border-y border-r border-[#2D323F] p-6 flex flex-col justify-between shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Total Users</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#D97706]">{(inputs.ev74_3kw || 0 + inputs.ev74_5kw || 0)}</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Peak Demand</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#e2e8f0]">{results.peak74.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Transformer Load</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#EF4444]">{results.tfpct74.toFixed(1)}%</span></div>
              <div className="p-3 bg-[#0A0C12] rounded-lg"><span className="block text-[11px] text-[#94A3B8] mb-1">Headroom</span><span className="font-['JetBrains_Mono'] font-bold text-lg text-[#e2e8f0]">{results.headroom74.toFixed(0)} kW</span></div>
            </div>
            <div className="mt-4 bg-[#0A0C12] p-4 rounded-lg border border-[#2D323F] flex justify-between items-center text-sm">
              <span className="text-[#94A3B8]">Additional concurrent users supported before overload:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#EF4444] text-base">{results.maxExtra74}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Financial Risk Analysis Framework */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] tracking-[3px] uppercase text-[#94A3B8] mb-2 font-semibold">Section 05</p>
        <h2 className="font-['Montserrat'] font-bold text-[22px] text-[#e2e8f0] mb-6 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2D323F]">Infrastructure Risk & Cost Verdict</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#1A1D26] to-[#0A0C12] rounded-xl p-6 md:p-8 text-[#e2e8f0] shadow-xl relative overflow-hidden border border-[#10B981]/30">
            <div className="absolute top-4 right-4 bg-[#10B981] text-[#090A0F] text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md">Recommended</div>
            <h3 className="text-sm font-['JetBrains_Mono'] tracking-[1.5px] uppercase text-[#10B981] mb-1 font-semibold">Option A — EcoVolt Managed Architecture</h3>
            <p className="text-xs text-[#94A3B8] mb-6">Smart Load Balancing & Controlled Infrastructure Scalability</p>
            <div className="text-4xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-4">₹0 <span className="text-sm font-['DM_Sans'] text-[#94A3B8] font-light">RWA Capital Expenditure</span></div>
            
            <ul className="space-y-3 text-[13px] text-[#cbd5e1] border-t border-[#2D323F] pt-4">
              <li className="flex items-center gap-2"><span className="text-[#10B981] font-bold text-lg leading-none">✓</span> Per-user smart device deployment</li>
              <li className="flex items-center gap-2"><span className="text-[#10B981] font-bold text-lg leading-none">✓</span> Automated cloud load shedding schedules</li>
              <li className="flex items-center gap-2"><span className="text-[#10B981] font-bold text-lg leading-none">✓</span> Eliminates localized peak risk entirely</li>
              <li className="flex items-center gap-2"><span className="text-[#10B981] font-bold text-lg leading-none">✓</span> Secure energy billing & automated settlement</li>
            </ul>
          </div>

          <div className="bg-[#1A1D26] border border-[#2D323F] rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <h3 className="text-sm font-['JetBrains_Mono'] tracking-[1.5px] uppercase text-[#94A3B8] mb-1 font-semibold">Option B — Unmanaged (Do Nothing)</h3>
            <p className="text-xs text-[#94A3B8] mb-6">Uncoordinated Charger Installations & Individual Additions</p>
            <div className="text-4xl font-['Montserrat'] font-bold text-[#EF4444] mb-4">₹8L - ₹20L <span className="text-sm font-['DM_Sans'] text-[#94A3B8] font-light">Forced Emergency Upgrade</span></div>
            
            <ul className="space-y-3 text-[13px] text-[#cbd5e1] border-t border-[#2D323F] pt-4">
              <li className="flex items-center gap-2"><span className="text-[#EF4444] font-bold text-lg leading-none">✗</span> Sudden transformer burnout on peak evening hours</li>
              <li className="flex items-center gap-2"><span className="text-[#EF4444] font-bold text-lg leading-none">✗</span> 4 to 12 weeks of complete blackout downtime during replacement</li>
              <li className="flex items-center gap-2"><span className="text-[#EF4444] font-bold text-lg leading-none">✗</span> Commercial penalties & mandatory technical reassessment</li>
              <li className="flex items-center gap-2"><span className="text-[#EF4444] font-bold text-lg leading-none">✗</span> Legal & liability disputes due to infrastructure degradation</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}