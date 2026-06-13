import React from 'react';

interface GateProps {
  communityData: { communityName: string; address: string; totalFlats: string };
  setCommunityData: (data: any) => void;
  onNext: () => void;
}

export default function CommunityGate({ communityData, setCommunityData, onNext }: GateProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-[#1A1D26] rounded-2xl shadow-[0_12px_48px_rgba(16,185,129,0.1)] border border-[#2D323F]">
      <div className="text-[11px] font-['JetBrains_Mono'] tracking-[3px] text-[#10B981] uppercase mb-4 font-semibold">Nevora Ecovolt</div>
      <h1 className="text-3xl font-['Montserrat'] font-bold text-[#e2e8f0] mb-8 leading-tight tracking-tight">Initialize Infrastructure Analysis</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide mb-2">Community Name</label>
          <input 
            required
            className="w-full h-12 border-[1.5px] border-[#2D323F] rounded-lg px-4 font-['JetBrains_Mono'] text-sm text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:bg-[#1A1D26] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 outline-none transition-all placeholder:text-[#475569]"
            value={communityData.communityName}
            onChange={e => setCommunityData({...communityData, communityName: e.target.value})}
            placeholder="e.g. Prestige Shantiniketan"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide mb-2">Location / Address</label>
          <input 
            required
            className="w-full h-12 border-[1.5px] border-[#2D323F] rounded-lg px-4 font-['JetBrains_Mono'] text-sm text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:bg-[#1A1D26] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 outline-none transition-all placeholder:text-[#475569]"
            value={communityData.address}
            onChange={e => setCommunityData({...communityData, address: e.target.value})}
            placeholder="e.g. Whitefield, Bengaluru"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide mb-2">Total Flats</label>
          <input 
            required
            type="number"
            className="w-full h-12 border-[1.5px] border-[#2D323F] rounded-lg px-4 font-['JetBrains_Mono'] text-sm text-[#e2e8f0] bg-[#0A0C12] hover:bg-[#121318] focus:bg-[#1A1D26] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 outline-none transition-all placeholder:text-[#475569]"
            value={communityData.totalFlats}
            onChange={e => setCommunityData({...communityData, totalFlats: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#10B981] hover:bg-[#059669] text-[#090A0F] py-4 rounded-lg font-['Montserrat'] font-semibold tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] border border-[#10B981]/20">
          Enter Simulator
        </button>
      </form>
    </div>
  );
}