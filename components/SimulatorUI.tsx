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

export default function SimulatorUI({ inputs, setInputs, results, communityData, onNext, onPrev }: SimulatorUIProps) {
  
  const updateInput = (key: keyof SimInputs, val: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: val === "" ? 0 : Number(val),
    }));
  };

  const handleNumTransformers = (rawVal: string) => {
    const val = rawVal === "" ? 0 : parseInt(rawVal);
    const count = Math.min(20, Math.max(0, val));
    
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
  
  const addFlatTier = () => {
    setInputs((prev) => ({
      ...prev,
      flatTiers: [
        ...prev.flatTiers,
        { 
          id: crypto.randomUUID(), sanctionedLoad: 0, count: 0, 
          bgNoEv: 0, bgEv: 0, ev33: 0, enh33: 2, ev74: 0, enh74: 7 
        }
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

  const validationStatus = (() => {
    const bgLoad = inputs.sanctionedLoad || 0;
    if (results.usableKW === 0) return "unconfigured";
    if (bgLoad > results.usableKW) return "critical";
    if (bgLoad > results.usableKW * 0.85) return "warning";
    return "safe";
  })();

  const declaredTotalFlats = Number(communityData.totalFlats) || 0;
  const flatsMismatchError = useMemo(() => {
    if (declaredTotalFlats === 0) return false;
    return results.totalFlats !== declaredTotalFlats;
  }, [results.totalFlats, declaredTotalFlats]);


  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground pointer-events-none">
                      T{idx + 1}
                    </span>
                    <Input
                      type="number" className="font-mono pl-8"
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

      {/* SECTION 02: FLAT & COMMON METERS */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">02</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-heading">
            Community Load Profile
          </CardTitle>
          <div className="flex-1 h-px bg-border ml-4" />
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Residential Flat Allocations
              </label>
              <Button variant="outline" size="sm" onClick={addFlatTier} className="h-8 gap-1 text-emerald border-emerald/30 hover:bg-emerald/10 hover:text-emerald">
                <Plus size={14} /> Add Flat Tier
              </Button>
            </div>
            
            <div className="space-y-6">
              {inputs.flatTiers.map((tier, idx) => (
                <div key={tier.id} className="relative flex flex-col gap-4 bg-card border border-border shadow-sm p-5 rounded-xl">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground tracking-widest font-semibold">Sanctioned Load (kW)</label>
                      <Input type="number" className="h-9 font-mono bg-muted/20" placeholder="e.g. 5" value={tier.sanctionedLoad || ""} onChange={(e) => updateFlatTier(tier.id, "sanctionedLoad", e.target.value)} />
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground tracking-widest font-semibold">Number of Flats</label>
                      <Input type="number" className="h-9 font-mono bg-muted/20" placeholder="e.g. 100" value={tier.count || ""} onChange={(e) => updateFlatTier(tier.id, "count", e.target.value)} />
                    </div>
                  </div>

                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Night Background Load Assumptions (per flat)</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] text-muted-foreground">Without EV active (kW)</label>
                        <Input type="number" step="0.1" className="h-8 text-xs font-mono" placeholder="0.8" value={tier.bgNoEv || ""} onChange={(e) => updateFlatTier(tier.id, "bgNoEv", e.target.value)} />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] text-muted-foreground">With EV charging (kW)</label>
                        <Input type="number" step="0.1" className="h-8 text-xs font-mono" placeholder="1.0" value={tier.bgEv || ""} onChange={(e) => updateFlatTier(tier.id, "bgEv", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeFlatTier(tier.id)} className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {inputs.flatTiers.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono text-center p-6 border border-dashed rounded-xl">No residential flats configured.</p>
              )}
            </div>

            {flatsMismatchError && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 animate-in slide-in-from-top-2">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-warning uppercase tracking-wide">Data Discrepancy</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    You initialized the assessment with <strong>{declaredTotalFlats} total flats</strong>, but the tiers above currently sum to <strong>{results.totalFlats} flats</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-CARD HIGH-FIDELITY METRICS DASHBOARD */}
      <div className="animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-3">
          {[
            { label: "Usable Transformer Capacity", val: results.usableKW.toFixed(1), unit: "kW (after PF × buffer)", color: "bg-emerald/10 border-emerald/30 text-emerald" },
            { label: "Total Connected Load", val: results.baseMaxDemand.toFixed(1), unit: "kW", color: "bg-card border-border" },
            { label: "Baseline Diversity Factor", val: results.baseDiversityFactor.toFixed(2), unit: "connected ÷ usable", color: "bg-amber/10 border-amber/30 text-amber dark:text-amber-500" },
            { label: "BESCOM Est. Peak Demand", val: results.bescomPeakDemand.toFixed(1) + "%", unit: "concurrent usage", color: "bg-card border-border" },
          ].map((metric) => (
            <Card key={metric.label} className={cn("p-5 shadow-sm", metric.color)}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">{metric.label}</p>
              <div className="text-3xl font-bold font-mono">{metric.val}</div>
              <p className="text-[10px] font-mono opacity-60 mt-1">{metric.unit}</p>
            </Card>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground italic px-2">
          ↑ BESCOM diversity factor = 1 ÷ Diversity Factor × 100. This is the maximum concurrent usage BESCOM expects at baseline — EV chargers push this above 100%, causing transformer overload.
        </p>
      </div>

      {/* SECTION 03: VALIDATION BANNER & MANUAL OVERRIDE */}
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
                  <p className="mt-0.5 text-xs text-muted-foreground">Sanctioned load is within the safe operating envelope.</p>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calculated Baseline Load (kW)</label>
              <Input type="number" disabled className="font-mono bg-muted/30" value={results.baseMaxDemand.toFixed(1)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manual Sanctioned Load Override (kW)</label>
              <Input type="number" className="font-mono" placeholder="Leave blank for auto-calc" value={inputs.sanctionedLoad || ""} onChange={(e) => updateInput("sanctionedLoad", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTIONS 04: SCENARIO ANALYSIS SUBPANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* ========================================================= */}
        {/* SCENARIO A: 3.3 kW Setup & COMBINED RESULTS */}
        {/* ========================================================= */}
        <Card className="border-emerald/30 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-emerald/10 bg-emerald/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald flex items-center gap-2 font-heading">
                <div className="h-4 w-1 bg-emerald rounded-full" /> Scenario A
              </CardTitle>
              <Badge variant="outline" className="text-emerald border-emerald/30 font-mono bg-emerald/10">3.3 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 flex-1 flex flex-col">
            {/* Input Blocks */}
            <div className="space-y-4">
              {inputs.flatTiers.map(tier => (
                <div key={`scenA-${tier.id}`} className="space-y-3 rounded-xl bg-card border border-border p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <div className="text-xs font-mono text-muted-foreground font-bold">{tier.sanctionedLoad} kW Base Tier</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{tier.count} Flats Available</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Active EVs</label>
                      <Input type="number" className="h-9 text-xs font-mono bg-background" value={tier.ev33 || ""} max={tier.count} onChange={(e) => updateFlatTier(tier.id, "ev33", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Avg Load Enhanced</label>
                      <Input type="number" step="0.1" className="h-9 text-xs font-mono bg-background border-border" value={tier.enh33 || ""} onChange={(e) => updateFlatTier(tier.id, "enh33", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-emerald tracking-wider">Total Added Load</label>
                      <div className="h-9 flex items-center px-3 text-xs font-mono bg-emerald/5 text-emerald rounded-md border border-emerald/30">
                        {((tier.ev33 || 0) * (tier.enh33 || 0)).toFixed(1)} kW
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {inputs.flatTiers.length === 0 && <p className="text-xs text-muted-foreground text-center">Define flat tiers in Section 02 to configure EV scenarios.</p>}
            </div>

            {/* THE NEW COMBINED RESULTS SUMMARY PANEL */}
            <div className="mt-auto pt-6">
              <div className="border-t border-emerald/20 pt-5">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
                  3.3 kW Scenario — Combined Results
                </h5>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Total Active EVs</span>
                    <span className="font-mono text-sm font-bold text-emerald">{results.totalEVUsers33} <span className="text-[10px] font-normal text-muted-foreground">sessions</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Capacity Utilisation</span>
                    <span className={cn("font-mono text-sm font-bold", results.capacityUsed33Pct >= 100 ? "text-danger" : "text-emerald")}>{results.capacityUsed33Pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Total System Load</span>
                    <span className="font-mono text-sm font-bold text-foreground">{results.totalSystemLoad33.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">kW</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Headroom Remaining</span>
                    <span className={cn("font-mono text-sm font-bold", (results.usableKW - results.totalSystemLoad33) < 0 ? "text-danger" : "text-foreground")}>{Math.max(0, results.usableKW - results.totalSystemLoad33).toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">kW</span></span>
                  </div>
                </div>

                <div className="w-full bg-muted/30 h-2.5 rounded-full overflow-hidden mb-4 border border-border/50">
                  <div 
                    className={cn("h-full transition-all duration-700", results.capacityUsed33Pct >= 100 ? "bg-danger" : results.capacityUsed33Pct >= 85 ? "bg-warning" : "bg-emerald")} 
                    style={{ width: `${Math.min(100, results.capacityUsed33Pct)}%` }} 
                  />
                </div>

                <div className={cn("flex items-center gap-2 p-3 rounded-lg border", results.maxConcurrentUsers33 > 0 ? "bg-emerald/5 border-emerald/20" : "bg-danger/5 border-danger/20")}>
                  {results.maxConcurrentUsers33 > 0 ? <CheckCircle size={14} className="text-emerald" /> : <AlertTriangle size={14} className="text-danger" />}
                  <p className="text-xs text-muted-foreground">
                    Total safe concurrent EV capacity: <span className={cn("font-mono font-bold text-sm", results.maxConcurrentUsers33 > 0 ? "text-emerald" : "text-danger")}>{results.maxConcurrentUsers33} <span className="text-[10px] font-normal uppercase">users</span></span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SCENARIO B: 7.4 kW Setup & COMBINED RESULTS */}
        {/* ========================================================= */}
        <Card className="border-amber/40 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-amber/10 bg-amber/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-amber flex items-center gap-2 font-heading dark:text-amber-500">
                <div className="h-4 w-1 bg-amber rounded-full" /> Scenario B
              </CardTitle>
              <Badge variant="outline" className="text-amber border-amber/30 font-mono bg-amber/10 dark:text-amber-500">7.4 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 flex-1 flex flex-col">
            {/* Input Blocks */}
            <div className="space-y-4">
              {inputs.flatTiers.map(tier => (
                <div key={`scenB-${tier.id}`} className="space-y-3 rounded-xl bg-card border border-border p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <div className="text-xs font-mono text-muted-foreground font-bold">{tier.sanctionedLoad} kW Base Tier</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{tier.count} Flats Available</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Active EVs</label>
                      <Input type="number" className="h-9 text-xs font-mono bg-background" value={tier.ev74 || ""} max={tier.count} onChange={(e) => updateFlatTier(tier.id, "ev74", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Avg Load Enhanced</label>
                      <Input type="number" step="0.1" className="h-9 text-xs font-mono bg-background border-border" value={tier.enh74 || ""} onChange={(e) => updateFlatTier(tier.id, "enh74", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-amber tracking-wider dark:text-amber-500">Total Added Load</label>
                      <div className="h-9 flex items-center px-3 text-xs font-mono bg-amber/5 text-amber rounded-md border border-amber/30 dark:text-amber-500">
                        {((tier.ev74 || 0) * (tier.enh74 || 0)).toFixed(1)} kW
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {inputs.flatTiers.length === 0 && <p className="text-xs text-muted-foreground text-center">Define flat tiers in Section 02 to configure EV scenarios.</p>}
            </div>

            {/* THE NEW COMBINED RESULTS SUMMARY PANEL */}
            <div className="mt-auto pt-6">
              <div className="border-t border-amber/20 pt-5">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
                  7.4 kW Scenario — Combined Results
                </h5>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Total Active EVs</span>
                    <span className="font-mono text-sm font-bold text-amber dark:text-amber-500">{results.totalEVUsers74} <span className="text-[10px] font-normal text-muted-foreground">sessions</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Capacity Utilisation</span>
                    <span className={cn("font-mono text-sm font-bold", results.capacityUsed74Pct >= 100 ? "text-danger" : "text-amber dark:text-amber-500")}>{results.capacityUsed74Pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Total System Load</span>
                    <span className="font-mono text-sm font-bold text-foreground">{results.totalSystemLoad74.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">kW</span></span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border/50 pb-1.5">
                    <span className="text-xs text-muted-foreground">Headroom Remaining</span>
                    <span className={cn("font-mono text-sm font-bold", (results.usableKW - results.totalSystemLoad74) < 0 ? "text-danger" : "text-foreground")}>{Math.max(0, results.usableKW - results.totalSystemLoad74).toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">kW</span></span>
                  </div>
                </div>

                <div className="w-full bg-muted/30 h-2.5 rounded-full overflow-hidden mb-4 border border-border/50">
                  <div 
                    className={cn("h-full transition-all duration-700", results.capacityUsed74Pct >= 100 ? "bg-danger" : results.capacityUsed74Pct >= 85 ? "bg-warning" : "bg-amber")} 
                    style={{ width: `${Math.min(100, results.capacityUsed74Pct)}%` }} 
                  />
                </div>

                <div className={cn("flex items-center gap-2 p-3 rounded-lg border", results.maxConcurrentUsers74 > 0 ? "bg-amber/5 border-amber/20" : "bg-danger/5 border-danger/20")}>
                  {results.maxConcurrentUsers74 > 0 ? <CheckCircle size={14} className="text-amber dark:text-amber-500" /> : <AlertTriangle size={14} className="text-danger" />}
                  <p className="text-xs text-muted-foreground">
                    Total safe concurrent EV capacity: <span className={cn("font-mono font-bold text-sm", results.maxConcurrentUsers74 > 0 ? "text-amber dark:text-amber-500" : "text-danger")}>{results.maxConcurrentUsers74} <span className="text-[10px] font-normal uppercase">users</span></span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* WIZARD PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8">
        <Button variant="ghost" onClick={onPrev} className="text-muted-foreground gap-2 w-full sm:w-auto">
          <ArrowLeft size={16} /> Back to Setup
        </Button>
        
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