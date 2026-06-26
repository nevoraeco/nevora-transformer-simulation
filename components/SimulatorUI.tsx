"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle, XCircle, Zap, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { SimInputs, SimResults, FlatTier, CommonMeter } from "../lib/calculator";
import { CommunityData } from "./CommunityGate";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SimulatorUIProps {
  inputs: SimInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimInputs>>;
  results: SimResults;
  communityData: CommunityData;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Enterprise Simulator Dashboard (Infinite Tier Architecture)
 * Provides dynamic array manipulation for bespoke real estate profiling
 * with strict mathematical validation and wizard pagination.
 */
export default function SimulatorUI({ inputs, setInputs, results, communityData, onNext, onPrev }: SimulatorUIProps) {
  
  // ---------------------------------------------------------
  // A. STATE MUTATION HANDLERS (Global Settings)
  // ---------------------------------------------------------
  const updateInput = (key: keyof SimInputs, val: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: val === "" ? 0 : Number(val),
    }));
  };

  const handleNumTransformers = (rawVal: string) => {
    const val = rawVal === "" ? 0 : parseInt(rawVal);
    const count = Math.min(20, Math.max(0, val)); // Hard cap at 20
    
    setInputs((prev) => {
      const newKVAs = [...prev.transformerKVAs];
      while (newKVAs.length < count) newKVAs.push(0);
      if (newKVAs.length > count) newKVAs.splice(count);
      return { ...prev, numTransformers: count, transformerKVAs: newKVAs };
    });
  };

  const updateKVA = (index: number, rawVal: string) => {
    setInputs((prev) => {
      const newKVAs = [...prev.transformerKVAs];
      newKVAs[index] = rawVal === "" ? 0 : Number(rawVal);
      return { ...prev, transformerKVAs: newKVAs };
    });
  };

  // ---------------------------------------------------------
  // B. STATE MUTATION HANDLERS (Dynamic Arrays)
  // ---------------------------------------------------------
  
  // -- Flat Tiers --
  const addFlatTier = () => {
    setInputs((prev) => ({
      ...prev,
      flatTiers: [
        ...prev.flatTiers,
        { id: crypto.randomUUID(), sanctionedLoad: 0, count: 0, ev33: 0, enh33: 2, ev74: 0, enh74: 7 }
      ]
    }));
  };

  const updateFlatTier = (id: string, field: keyof FlatTier, val: string | number) => {
    const numVal = val === "" ? 0 : Number(val);
    setInputs((prev) => ({
      ...prev,
      flatTiers: prev.flatTiers.map(t => t.id === id ? { ...t, [field]: numVal } : t)
    }));
  };

  const removeFlatTier = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      flatTiers: prev.flatTiers.filter(t => t.id !== id)
    }));
  };

  // -- Common Meters --
  const addCommonMeter = () => {
    setInputs((prev) => ({
      ...prev,
      commonMeters: [
        ...prev.commonMeters,
        { id: crypto.randomUUID(), name: `Meter ${prev.commonMeters.length + 1}`, load: 0 }
      ]
    }));
  };

  const updateCommonMeter = (id: string, field: keyof CommonMeter, val: string | number) => {
    setInputs((prev) => ({
      ...prev,
      commonMeters: prev.commonMeters.map(m => m.id === id ? { ...m, [field]: field === 'load' ? Number(val || 0) : val } : m)
    }));
  };

  const removeCommonMeter = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      commonMeters: prev.commonMeters.filter(m => m.id !== id)
    }));
  };

  // ---------------------------------------------------------
  // C. MATHEMATICAL VALIDATION
  // ---------------------------------------------------------
  const validationStatus = (() => {
    const bgLoad = inputs.sanctionedLoad || 0;
    if (results.usableKW === 0) return "unconfigured";
    if (bgLoad > results.usableKW) return "critical";
    if (bgLoad > results.usableKW * 0.85) return "warning";
    return "safe";
  })();

  // Validation: Check if dynamically entered flats equal the total flats defined in Phase 1
  const declaredTotalFlats = Number(communityData.totalFlats) || 0;
  const flatsMismatchError = useMemo(() => {
    if (declaredTotalFlats === 0) return false;
    return results.totalFlats !== declaredTotalFlats;
  }, [results.totalFlats, declaredTotalFlats]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 01: TRANSFORMER CONFIG */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">01</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-heading">
            Transformer Infrastructure Setup
          </CardTitle>
          <div className="flex-1 h-px bg-border ml-4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                No. of Transformers (Max 20)
              </label>
              <Input
                type="number" min="0" max="20" className="font-mono"
                value={inputs.numTransformers || ""}
                onChange={(e) => handleNumTransformers(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Power Factor
              </label>
              <Input
                type="number" step="0.01" className="font-mono"
                value={inputs.powerFactor || ""}
                onChange={(e) => updateInput("powerFactor", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Safety Buffer (%)
              </label>
              <Input
                type="number" className="font-mono"
                value={inputs.buffer || ""}
                onChange={(e) => updateInput("buffer", e.target.value)}
              />
            </div>
          </div>

          {inputs.numTransformers > 0 && (
            <div className="pt-4 border-t border-border/50">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">
                Individual Transformer Ratings (kVA)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {inputs.transformerKVAs.map((kva, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
                      T{idx + 1}
                    </span>
                    <Input
                      type="number" className="font-mono pl-9"
                      value={kva || ""} placeholder="kVA"
                      onChange={(e) => updateKVA(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 02: FLAT & COMMON METERS (DYNAMIC ARRAYS) */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">02</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-heading">
            Community Load Profile
          </CardTitle>
          <div className="flex-1 h-px bg-border ml-4" />
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Flat Tiers Dynamic Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Residential Flat Allocations
              </label>
              <Button variant="outline" size="sm" onClick={addFlatTier} className="h-8 gap-1 text-emerald border-emerald/30 hover:bg-emerald/10 hover:text-emerald">
                <Plus size={14} /> Add Flat Tier
              </Button>
            </div>
            
            <div className="space-y-3">
              {inputs.flatTiers.map((tier, idx) => (
                <div key={tier.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/20 border border-border p-3 rounded-lg">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Sanctioned Load (kW)</label>
                    <Input type="number" className="h-9 font-mono" placeholder="e.g. 5" value={tier.sanctionedLoad || ""} onChange={(e) => updateFlatTier(tier.id, "sanctionedLoad", e.target.value)} />
                  </div>
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Number of Flats</label>
                    <Input type="number" className="h-9 font-mono" placeholder="e.g. 100" value={tier.count || ""} onChange={(e) => updateFlatTier(tier.id, "count", e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFlatTier(tier.id)} className="h-9 w-9 text-muted-foreground hover:text-danger hover:bg-danger/10 sm:mt-5 self-end sm:self-auto shrink-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {inputs.flatTiers.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono text-center p-4 border border-dashed rounded">No residential flats configured.</p>
              )}
            </div>

            {/* Strict Validation Banner for Flat Count */}
            {flatsMismatchError && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 animate-in slide-in-from-top-2">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-warning uppercase tracking-wide">Data Discrepancy</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    You initialized the assessment with <strong>{declaredTotalFlats} total flats</strong>, but the tiers above currently sum to <strong>{results.totalFlats} flats</strong>. Please correct the allocations to proceed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Common Meters Dynamic Builder */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Common Area Meters
              </label>
              <Button variant="outline" size="sm" onClick={addCommonMeter} className="h-8 gap-1 text-emerald border-emerald/30 hover:bg-emerald/10 hover:text-emerald">
                <Plus size={14} /> Add Meter
              </Button>
            </div>
            
            <div className="space-y-3">
              {inputs.commonMeters.map((meter, idx) => (
                <div key={meter.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/20 border border-border p-3 rounded-lg">
                  <div className="flex-[2] w-full space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Meter Designation</label>
                    <Input type="text" className="h-9 font-mono" placeholder="e.g. STP / Clubhouse" value={meter.name} onChange={(e) => updateCommonMeter(meter.id, "name", e.target.value)} />
                  </div>
                  <div className="flex-[1] w-full space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Load (kW)</label>
                    <Input type="number" className="h-9 font-mono" placeholder="0" value={meter.load || ""} onChange={(e) => updateCommonMeter(meter.id, "load", e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCommonMeter(meter.id)} className="h-9 w-9 text-muted-foreground hover:text-danger hover:bg-danger/10 sm:mt-5 self-end sm:self-auto shrink-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {inputs.commonMeters.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono text-center p-4 border border-dashed rounded">No common area meters configured.</p>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* SECTION 03: VALIDATION BANNER & SYSTEM LOAD */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">03</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-heading">
            System Sanctioned Load
          </CardTitle>
          <div className="flex-1 h-px bg-border ml-4" />
        </CardHeader>
        <CardContent>
          
          <div className="mb-8">
            {validationStatus === "safe" && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald/30 bg-emerald/10 p-4">
                <CheckCircle size={18} className="text-emerald shrink-0" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-emerald">SYSTEM VALIDATED — ADEQUATE HEADROOM</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Sanctioned load is within the safe operating envelope. Usable Capacity: <span className="font-mono text-emerald">{results.usableKW.toFixed(1)} kW</span>.
                  </p>
                </div>
              </div>
            )}
            {validationStatus === "warning" && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
                <AlertTriangle size={18} className="text-warning shrink-0" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-warning">CAUTION — APPROACHING CAPACITY LIMIT</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Sanctioned load is above the 85% operational threshold.</p>
                </div>
              </div>
            )}
            {validationStatus === "critical" && (
              <div className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4">
                <XCircle size={18} className="text-danger shrink-0" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-danger">CRITICAL — EXCEEDS USABLE CAPACITY</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Declared load exceeds safe usable capacity. Transformer is undersized.</p>
                </div>
              </div>
            )}
            {validationStatus === "unconfigured" && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <Zap size={18} className="text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">Configure transformer parameters above to enable validation.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Calculated Baseline Load (kW)
              </label>
              <Input type="number" disabled className="font-mono bg-muted/30" value={results.baseMaxDemand.toFixed(1)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Manual Sanctioned Load Override (kW)
              </label>
              <Input
                type="number" className="font-mono"
                placeholder="Leave blank for auto-calc"
                value={inputs.sanctionedLoad || ""}
                onChange={(e) => updateInput("sanctionedLoad", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTIONS 04: SCENARIO ANALYSIS SUBPANELS (DYNAMIC ARRAYS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SCENARIO A: 3.3 kW Setup */}
        <Card className="border-emerald/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-emerald flex items-center gap-2 font-heading">
                <div className="h-4 w-1 bg-emerald rounded-full" /> Scenario A
              </CardTitle>
              <Badge variant="outline" className="text-emerald border-emerald/30 font-mono">3.3 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.flatTiers.map(tier => (
              <div key={`scenA-${tier.id}`} className="space-y-2 rounded-lg bg-emerald/5 p-4 border border-emerald/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-mono text-muted-foreground font-bold">{tier.sanctionedLoad} kW Base Tier</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{tier.count} Flats Available</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                    <Input type="number" className="h-8 text-xs font-mono bg-background" value={tier.ev33 || ""} max={tier.count} onChange={(e) => updateFlatTier(tier.id, "ev33", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-emerald block mb-1">Add Load (kW)</label>
                    <Input type="number" step="0.1" className="h-8 text-xs font-mono bg-background border-emerald/50 focus-visible:ring-emerald" value={tier.enh33 || ""} onChange={(e) => updateFlatTier(tier.id, "enh33", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            {inputs.flatTiers.length === 0 && <p className="text-xs text-muted-foreground text-center">Define flat tiers in Section 02 to configure EV scenarios.</p>}
          </CardContent>
        </Card>

        {/* SCENARIO B: 7.4 kW Setup */}
        <Card className="border-warning/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-warning flex items-center gap-2 font-heading">
                <div className="h-4 w-1 bg-warning rounded-full" /> Scenario B
              </CardTitle>
              <Badge variant="outline" className="text-warning border-warning/30 font-mono">7.4 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.flatTiers.map(tier => (
              <div key={`scenB-${tier.id}`} className="space-y-2 rounded-lg bg-warning/5 p-4 border border-warning/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-mono text-muted-foreground font-bold">{tier.sanctionedLoad} kW Base Tier</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{tier.count} Flats Available</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                    <Input type="number" className="h-8 text-xs font-mono bg-background" value={tier.ev74 || ""} max={tier.count} onChange={(e) => updateFlatTier(tier.id, "ev74", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-warning block mb-1">Add Load (kW)</label>
                    <Input type="number" step="0.1" className="h-8 text-xs font-mono bg-background border-warning/50 focus-visible:ring-warning" value={tier.enh74 || ""} onChange={(e) => updateFlatTier(tier.id, "enh74", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            {inputs.flatTiers.length === 0 && <p className="text-xs text-muted-foreground text-center">Define flat tiers in Section 02 to configure EV scenarios.</p>}
          </CardContent>
        </Card>

      </div>

      {/* WIZARD PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8">
        <Button variant="ghost" onClick={onPrev} className="text-muted-foreground gap-2 w-full sm:w-auto">
          <ArrowLeft size={16} /> Back to Setup
        </Button>
        
        {/* Disable progression if math validation fails */}
        <Button 
          onClick={onNext} 
          disabled={flatsMismatchError}
          className={cn(
            "gap-2 w-full sm:w-auto font-heading tracking-wide uppercase font-bold",
            flatsMismatchError ? "bg-muted text-muted-foreground" : "bg-emerald text-white hover:bg-emerald/90 shadow-emerald/20"
          )}
        >
          {flatsMismatchError ? 'Fix Math to Continue' : 'Next: 3.3 kW Scenario'} <ArrowRight size={16} />
        </Button>
      </div>

    </div>
  );
}