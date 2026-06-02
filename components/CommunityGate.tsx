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
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-2xl shadow-[0_12px_48px_rgba(15,31,61,0.1)] border border-[#dddbd5]">
      <div className="text-[11px] font-['JetBrains_Mono'] tracking-[3px] text-[#c9a84c] uppercase mb-4">Nevora Ecovolt</div>
      <h1 className="text-3xl font-['DM_Serif_Display'] text-[#0f1f3d] mb-8 leading-tight">Initialize Infrastructure Analysis</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#6b6b7a] tracking-wide mb-2">Community Name</label>
          <input 
            required
            className="w-full h-12 border-[1.5px] border-[#dddbd5] rounded-xl px-4 font-['JetBrains_Mono'] text-sm text-[#0f1f3d] bg-[#f7f6f2] focus:bg-white focus:border-[#0a6e5c] focus:ring-4 focus:ring-[#0a6e5c]/10 outline-none transition-all"
            value={communityData.communityName}
            onChange={e => setCommunityData({...communityData, communityName: e.target.value})}
            placeholder="e.g. Prestige Shantiniketan"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b6b7a] tracking-wide mb-2">Location / Address</label>
          <input 
            required
            className="w-full h-12 border-[1.5px] border-[#dddbd5] rounded-xl px-4 font-['JetBrains_Mono'] text-sm text-[#0f1f3d] bg-[#f7f6f2] focus:bg-white focus:border-[#0a6e5c] focus:ring-4 focus:ring-[#0a6e5c]/10 outline-none transition-all"
            value={communityData.address}
            onChange={e => setCommunityData({...communityData, address: e.target.value})}
            placeholder="e.g. Whitefield, Bengaluru"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6b6b7a] tracking-wide mb-2">Total Flats</label>
          <input 
            required
            type="number"
            className="w-full h-12 border-[1.5px] border-[#dddbd5] rounded-xl px-4 font-['JetBrains_Mono'] text-sm text-[#0f1f3d] bg-[#f7f6f2] focus:bg-white focus:border-[#0a6e5c] focus:ring-4 focus:ring-[#0a6e5c]/10 outline-none transition-all"
            value={communityData.totalFlats}
            onChange={e => setCommunityData({...communityData, totalFlats: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full mt-4 bg-[#0a6e5c] text-white py-4 rounded-xl font-['DM_Sans'] font-semibold tracking-wide hover:bg-[#0d8a74] shadow-[0_4px_16px_rgba(10,110,92,0.3)] transition-all transform active:scale-[0.98]">
          Enter Simulator
        </button>
      </form>
    </div>
  );
}