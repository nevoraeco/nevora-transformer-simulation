"use client";

import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface SimulatorUIProps {
  inputs: SimInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimInputs>>;
  results: SimResults;
}

/**
 * Enterprise Simulator Dashboard
 * Connects the mathematical engine to the atomic UI primitives,
 * offering a flawless, theme-aware configuration interface.
 */
export default function SimulatorUI({ inputs, setInputs, results }: SimulatorUIProps) {
  
  // High-performance state updater
  const updateInput = (key: keyof SimInputs, val: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: val === "" ? 0 : Number(val),
    }));
  };

  // Safe handler for dynamic transformer array
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

  // Status computation for UI banners
  const validationStatus = (() => {
    const bgLoad = inputs.sanctionedLoad || 0;
    if (results.usableKW === 0) return "unconfigured";
    if (bgLoad > results.usableKW) return "critical";
    if (bgLoad > results.usableKW * 0.85) return "warning";
    return "safe";
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 01: TRANSFORMER CONFIG */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">01</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
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
                type="number"
                min="0"
                max="20"
                className="font-mono"
                value={inputs.numTransformers || ""}
                onChange={(e) => handleNumTransformers(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Power Factor
              </label>
              <Input
                type="number"
                step="0.01"
                className="font-mono"
                value={inputs.powerFactor || ""}
                onChange={(e) => updateInput("powerFactor", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Safety Buffer (%)
              </label>
              <Input
                type="number"
                className="font-mono"
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
                      type="number"
                      className="font-mono pl-9"
                      value={kva || ""}
                      onChange={(e) => updateKVA(idx, e.target.value)}
                      placeholder="kVA"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 02: VALIDATION BANNER & SANCTIONED LOAD */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Badge variant="outline" className="text-emerald border-emerald/40 font-mono">02</Badge>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
            Sanctioned Load Metrics
          </CardTitle>
          <div className="flex-1 h-px bg-border ml-4" />
        </CardHeader>
        <CardContent>
          
          {/* Dynamic Validation Banners */}
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
                Manual Sanctioned Load (kW)
              </label>
              <Input
                type="number"
                className="font-mono"
                placeholder="Leave blank for auto-calc"
                value={inputs.sanctionedLoad || ""}
                onChange={(e) => updateInput("sanctionedLoad", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Meters</label>
                <Input
                  type="number"
                  className="font-mono"
                  value={inputs.commonMeters || ""}
                  onChange={(e) => updateInput("commonMeters", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Load (kW)</label>
                <Input
                  type="number"
                  className="font-mono"
                  value={inputs.commonLoad || ""}
                  onChange={(e) => updateInput("commonLoad", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTIONS 03 & 04: SCENARIO ANALYSIS SUBPANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SCENARIO A: 3.3 kW Setup */}
        <Card className="border-emerald/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-emerald flex items-center gap-2">
                <div className="h-4 w-1 bg-emerald rounded-full" />
                Scenario A
              </CardTitle>
              <Badge variant="outline" className="text-emerald border-emerald/30 font-mono">3.3 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 3 kW Flats */}
            <div className="space-y-2 rounded-lg bg-gray-50/50 dark:bg-obsidian-surface p-4 border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-3">Standard Block (3 kW Base)</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Total Flats</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.flats3kw || ""} onChange={(e) => updateInput("flats3kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.ev33_3kw || ""} max={inputs.flats3kw} onChange={(e) => updateInput("ev33_3kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald block mb-1">Add Load (kW)</label>
                  <Input type="number" step="0.1" className="h-8 text-xs font-mono border-emerald/50 focus-visible:ring-emerald" value={inputs.enh33_3kw || ""} onChange={(e) => updateInput("enh33_3kw", e.target.value)} />
                </div>
              </div>
            </div>
            
            {/* 5 kW Flats */}
            <div className="space-y-2 rounded-lg bg-gray-50/50 dark:bg-obsidian-surface p-4 border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-3">Premium Block (5 kW Base)</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Total Flats</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.flats5kw || ""} onChange={(e) => updateInput("flats5kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.ev33_5kw || ""} max={inputs.flats5kw} onChange={(e) => updateInput("ev33_5kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald block mb-1">Add Load (kW)</label>
                  <Input type="number" step="0.1" className="h-8 text-xs font-mono border-emerald/50 focus-visible:ring-emerald" value={inputs.enh33_5kw || ""} onChange={(e) => updateInput("enh33_5kw", e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SCENARIO B: 7.4 kW Setup */}
        <Card className="border-danger/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-danger flex items-center gap-2">
                <div className="h-4 w-1 bg-danger rounded-full" />
                Scenario B
              </CardTitle>
              <Badge variant="outline" className="text-danger border-danger/30 font-mono">7.4 kW / EV</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 3 kW Flats */}
            <div className="space-y-2 rounded-lg bg-gray-50/50 dark:bg-obsidian-surface p-4 border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-3">Standard Block (3 kW Base)</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Total Flats</label>
                  <Input type="number" disabled className="h-8 text-xs font-mono bg-gray-100 dark:bg-card/50" value={inputs.flats3kw || ""} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.ev74_3kw || ""} max={inputs.flats3kw} onChange={(e) => updateInput("ev74_3kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-danger block mb-1">Add Load (kW)</label>
                  <Input type="number" step="0.1" className="h-8 text-xs font-mono border-danger/50 focus-visible:ring-danger" value={inputs.enh74_3kw || ""} onChange={(e) => updateInput("enh74_3kw", e.target.value)} />
                </div>
              </div>
            </div>

            {/* 5 kW Flats */}
            <div className="space-y-2 rounded-lg bg-gray-50/50 dark:bg-obsidian-surface p-4 border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-3">Premium Block (5 kW Base)</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Total Flats</label>
                  <Input type="number" disabled className="h-8 text-xs font-mono bg-gray-100 dark:bg-card/50" value={inputs.flats5kw || ""} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1">Active EVs</label>
                  <Input type="number" className="h-8 text-xs font-mono" value={inputs.ev74_5kw || ""} max={inputs.flats5kw} onChange={(e) => updateInput("ev74_5kw", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-danger block mb-1">Add Load (kW)</label>
                  <Input type="number" step="0.1" className="h-8 text-xs font-mono border-danger/50 focus-visible:ring-danger" value={inputs.enh74_5kw || ""} onChange={(e) => updateInput("enh74_5kw", e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}