import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

export interface CommunityData {
  communityName: string;
  address: string;
  totalFlats: string | number;
  operatorId: string;
}

interface GateProps {
  communityData: CommunityData;
  setCommunityData: React.Dispatch<React.SetStateAction<CommunityData>>;
  onNext: () => void;
}

export default function CommunityGate({ communityData, setCommunityData, onNext }: GateProps) {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md md:mt-24 px-4 sm:px-0">
      <Card className="border-border shadow-lg transition-all duration-300">
        <CardHeader className="space-y-2 pb-8">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">
            Nevora Ecovolt
          </div>
          <CardTitle className="text-3xl font-bold leading-tight tracking-tight">
            Initialize Assessment
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field: Operator Selection */}
            <div className="space-y-2">
              <label 
                htmlFor="operatorId" 
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Authorised Operator
              </label>
              {/* Custom styled select matching the Input primitive */}
              <div className="relative">
                <select
                  id="operatorId"
                  required
                  value={communityData.operatorId}
                  onChange={(e) => setCommunityData(prev => ({ ...prev, operatorId: e.target.value }))}
                  className="flex h-10 w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground transition-all duration-200 ease-in-out focus-visible:border-emerald focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald dark:bg-card"
                >
                  <option value="" disabled>Select Operator</option>
                  <option value="Hemanth - HJ">Nihaal - NT</option>
                  <option value="Elvis - EJ">Elvis - EJ</option>
                  <option value="Nihaal - NT">Hemanth - HJ</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="communityName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Community Name
              </label>
              <Input
                id="communityName"
                required
                className="font-mono"
                placeholder="e.g. Prestige Shantiniketan"
                value={communityData.communityName}
                onChange={(e) => setCommunityData(prev => ({ ...prev, communityName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location / Address
              </label>
              <Input
                id="address"
                required
                className="font-mono"
                placeholder="e.g. Whitefield, Bengaluru"
                value={communityData.address}
                onChange={(e) => setCommunityData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="totalFlats" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total Flats
              </label>
              <Input
                id="totalFlats"
                required
                type="number"
                min="1"
                className="font-mono"
                placeholder="e.g. 150"
                value={communityData.totalFlats}
                onChange={(e) => setCommunityData(prev => ({ ...prev, totalFlats: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full font-heading font-semibold tracking-wide">
                Secure & Initialize
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}