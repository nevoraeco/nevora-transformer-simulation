"use client";

import React from "react";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface TippingPointProps {
  scenario: "A" | "B";
  inputs: SimInputs;
  results: SimResults;
}

interface TipRow {
  n: number;
  evLoad: number;
  bgLoad: number;
  totalLoad: number;
  pct: number;
  status: "SAFE" | "WARNING" | "OVERLOAD";
}

// 1. Predictive Math Engine (Matches proprietary 0.7 diversity logic)
function buildTable(
  usable: number,
  bgLoad: number,
  avgEnhancement: number,
  maxRows: number
): TipRow[] {
  return Array.from({ length: maxRows + 1 }, (_, n) => {
    // Each user adds their scaled enhancement demand
    const evLoad = n * avgEnhancement;
    const totalLoad = bgLoad + evLoad;
    const pct = usable > 0 ? (totalLoad / usable) * 100 : 0;
    const status: TipRow["status"] =
      pct >= 100 ? "OVERLOAD" : pct >= 85 ? "WARNING" : "SAFE";
    
    return { n, evLoad, bgLoad, totalLoad, pct, status };
  });
}

// 2. Enterprise SVG Radial Gauge (Theme-aware)
function RadialGauge({ pct, size = 220 }: { pct: number; size?: number }) {
  const R = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, pct));
  const fill = (clamped / 100) * circ;

  const colorClass = pct >= 100 ? "stroke-danger" : pct >= 85 ? "stroke-warning" : "stroke-emerald";
  const textClass = pct >= 100 ? "fill-danger" : pct >= 85 ? "fill-warning" : "fill-emerald";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
      {/* Outer constraint ring */}
      <circle cx={cx} cy={cy} r={R + 8} fill="none" strokeWidth="1" className="stroke-border/50" />
      
      {/* Background Track */}
      <circle cx={cx} cy={cy} r={R} fill="none" strokeWidth="14" strokeLinecap="round" className="stroke-border" />
      
      {/* Dynamic Progress Arc */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        className={cn(colorClass, "transition-all duration-700 ease-out")}
        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
      />
      
      {/* Inner Hub */}
      <circle cx={cx} cy={cy} r={R - 14} className="fill-card transition-colors duration-300" />
      
      {/* Data Readout */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={size * 0.14}
        className={cn(textClass, "font-mono font-bold transition-colors duration-300")}
      >
        {clamped.toFixed(1)}%
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontSize={size * 0.05}
        letterSpacing="2"
        className="fill-muted-foreground font-mono font-semibold"
      >
        CAPACITY
      </text>
    </svg>
  );
}

/**
 * Tipping Point Orchestrator
 * Projects future grid strain based on sequential EV adoption.
 */
export function TippingPointChart({ scenario, inputs, results }: TippingPointProps) {
  
  // Dynamic variables mapped to the selected scenario
  const isA = scenario === "A";
  const chargerKW = isA ? 3.3 : 7.4;
  const currentPct = isA ? results.capacityUsed33Pct : results.capacityUsed74Pct;
  const currentTotal = isA ? results.totalSystemLoad33 : results.totalSystemLoad74;
  const headroomEVs = isA ? results.maxConcurrentUsers33 : results.maxConcurrentUsers74;
  
  // Calculate average enhancement per user based on inputs (fallback to baseline if 0)
  const avgEnhancement = isA 
    ? (inputs.enh33_3kw || 2) * 0.7 
    : (inputs.enh74_3kw || 7) * 0.7;

  // Generate predictive table rows
  const totalFlats = (inputs.flats3kw || 0) + (inputs.flats5kw || 0);
  const maxRows = Math.max(50, totalFlats + 5);
  const rows = buildTable(results.usableKW, results.baseActualDemand, avgEnhancement, maxRows);

  const tippingRow = rows.find((r) => r.status === "OVERLOAD");
  const tippingPoint = tippingRow ? tippingRow.n : null;

  const isOverload = currentPct >= 100;
  const isWarning = currentPct >= 85 && currentPct < 100;

  // Semantic mappings
  const accentColorClass = isA ? "bg-emerald" : "bg-danger";
  const accentTextClass = isA ? "text-emerald" : "text-danger";
  const scenLabel = isA ? "Scenario A — 3.3 kW AC Charging" : "Scenario B — 7.4 kW AC Charging";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top section: Visualizations & Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radial Gauge Panel */}
        <Card className="flex flex-col items-center justify-center p-6">
          <div className="flex items-center gap-2 mb-6 self-start">
            <div className={cn("h-4 w-1 rounded-full", accentColorClass)} />
            <h3 className={cn("text-xs font-semibold uppercase tracking-widest font-heading", accentTextClass)}>
              {scenLabel}
            </h3>
          </div>

          <RadialGauge pct={currentPct} size={240} />

          <div className="mt-8 grid grid-cols-3 gap-4 w-full">
            <div className="text-center">
              <p className="text-xs tracking-wider text-muted-foreground mb-1">USABLE</p>
              <p className="font-mono text-sm font-semibold">{results.usableKW.toFixed(1)} kW</p>
            </div>
            <div className="text-center">
              <p className="text-xs tracking-wider text-muted-foreground mb-1">TOTAL LOAD</p>
              <p className="font-mono text-sm font-semibold">{currentTotal.toFixed(1)} kW</p>
            </div>
            <div className="text-center">
              <p className="text-xs tracking-wider text-muted-foreground mb-1">HEADROOM</p>
              <p className={cn("font-mono text-sm font-semibold", isOverload ? "text-danger" : "text-emerald")}>
                {Math.max(0, results.usableKW - currentTotal).toFixed(1)} kW
              </p>
            </div>
          </div>
        </Card>

        {/* Status & Analytics Panels */}
        <div className="flex flex-col gap-4">
          
          {/* Main Status Banner */}
          <Card className={cn(
            "flex-1 border p-6 transition-colors duration-300",
            isOverload ? "bg-danger/10 border-danger/30" 
              : isWarning ? "bg-warning/10 border-warning/30" 
              : "bg-emerald/10 border-emerald/30"
          )}>
            <div className="flex items-start gap-3">
              {isOverload ? (
                <XCircle className="text-danger shrink-0 mt-0.5" size={24} />
              ) : isWarning ? (
                <AlertTriangle className="text-warning shrink-0 mt-0.5" size={24} />
              ) : (
                <CheckCircle className="text-emerald shrink-0 mt-0.5" size={24} />
              )}
              <div>
                <p className={cn(
                  "font-heading font-semibold text-base tracking-wide",
                  isOverload ? "text-danger" : isWarning ? "text-warning" : "text-emerald"
                )}>
                  {isOverload ? "TRANSFORMER OVERLOAD ACTIVE" 
                    : isWarning ? "APPROACHING CRITICAL THRESHOLD" 
                    : "SYSTEM OPERATING SAFELY"}
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {isOverload ? "Current EV charging demand exceeds usable transformer capacity. Immediate load management required."
                    : isWarning ? "Operating above the 85% safety threshold. Limited additional EV capacity available."
                    : "The transformer infrastructure can accommodate current EV charging demand with headroom intact."}
                </p>
              </div>
            </div>
          </Card>

          {/* Tipping Point Stat Block */}
          <Card className="p-5 border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-muted-foreground" />
              <span className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">Tipping Point Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Max Safe EVs</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-mono text-3xl font-bold text-emerald">{headroomEVs}</p>
                  <p className="text-xs font-mono text-muted-foreground">users</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Overload At</p>
                <div className="flex items-baseline gap-2">
                  <p className={cn("font-mono text-3xl font-bold", tippingPoint !== null ? "text-danger" : "text-muted-foreground")}>
                    {tippingPoint !== null ? tippingPoint : "—"}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">users</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Charger Spec Block */}
          <Card className="p-5 border-border bg-gray-50/50 dark:bg-obsidian">
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-semibold mb-2">Active Charger Specification</p>
            <div className="flex items-baseline gap-2">
              <span className={cn("font-mono text-2xl font-bold", accentTextClass)}>
                {chargerKW}
              </span>
              <span className="text-sm text-muted-foreground">kW per EV session</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {isA ? "Mode 2 / Mode 3 — Standard AC" : "Mode 3 — Fast AC (IEC 62196)"}
            </p>
          </Card>
        </div>
      </div>

      {/* Data Grid Section */}
      <Card className="overflow-hidden border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
          <h4 className="text-xs tracking-widest uppercase font-semibold font-heading">
            Incremental Load Simulation Matrix
          </h4>
          <Badge variant="secondary" className="font-mono">{chargerKW} kW per EV</Badge>
        </div>

        <div className="overflow-auto max-h-[450px] scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50/95 dark:bg-[#121318]/95 backdrop-blur-sm border-b border-border z-10">
              <tr>
                {["EV USERS", "EV LOAD (kW)", "BACKGROUND (kW)", "TOTAL LOAD (kW)", "% CAPACITY", "STATUS"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs tracking-wider font-semibold text-muted-foreground uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOver = row.status === "OVERLOAD";
                const isWarn = row.status === "WARNING";
                
                return (
                  <tr
                    key={row.n}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-gray-50 dark:hover:bg-obsidian-surface/50",
                      isOver ? "bg-danger/5 dark:bg-danger/10" : isWarn ? "bg-warning/5 dark:bg-warning/10" : ""
                    )}
                  >
                    <td className="px-6 py-3 font-mono font-semibold">{row.n}</td>
                    <td className="px-6 py-3 font-mono text-muted-foreground">{row.evLoad.toFixed(1)}</td>
                    <td className="px-6 py-3 font-mono text-muted-foreground">{row.bgLoad.toFixed(1)}</td>
                    <td className="px-6 py-3 font-mono">{row.totalLoad.toFixed(1)}</td>
                    <td className={cn("px-6 py-3 font-mono font-semibold", isOver ? "text-danger" : isWarn ? "text-warning" : "text-emerald")}>
                      {row.pct.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isOver ? "bg-danger" : isWarn ? "bg-warning" : "bg-emerald")} />
                        <span className={cn("font-mono text-xs tracking-wider font-semibold", isOver ? "text-danger" : isWarn ? "text-warning" : "text-emerald")}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}