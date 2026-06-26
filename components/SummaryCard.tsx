"use client";

import React from "react";
import { Download, CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SummaryTabProps {
  inputs: SimInputs;
  results: SimResults;
  onNext: () => void;
  onPrev: () => void;
}

// Helper component for the comparison matrix rows (Mobile Optimized)
function MetricRow({
  label, valueA, valueB, unit, highlightA, highlightB,
}: {
  label: string; valueA: string | number; valueB: string | number;
  unit?: string; highlightA?: "emerald" | "danger" | "warning" | null; highlightB?: "emerald" | "danger" | "warning" | null;
}) {
  const colorMap = { emerald: "text-emerald", danger: "text-danger", warning: "text-warning" };
  
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/5">
      <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono whitespace-normal sm:whitespace-nowrap">
        {label}
      </td>
      <td className={cn("px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm font-semibold whitespace-nowrap", highlightA ? colorMap[highlightA] : "text-foreground")}>
        {valueA} {unit && <span className="ml-1 text-[10px] sm:text-xs font-normal text-muted-foreground">{unit}</span>}
      </td>
      <td className={cn("px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm font-semibold whitespace-nowrap", highlightB ? colorMap[highlightB] : "text-foreground")}>
        {valueB} {unit && <span className="ml-1 text-[10px] sm:text-xs font-normal text-muted-foreground">{unit}</span>}
      </td>
    </tr>
  );
}

/**
 * Executive Summary Dashboard
 * Consolidates dynamic math engine outputs into a pristine, client-ready proposal matrix.
 * Fully optimized for native browser PDF Export via Tailwind print utilities and Mobile Swiping.
 */
export function SummaryTab({ inputs, results, onNext, onPrev }: SummaryTabProps) {
  
  // Calculate Headroom
  const headroomA = Math.max(0, results.usableKW - results.totalSystemLoad33);
  const headroomB = Math.max(0, results.usableKW - results.totalSystemLoad74);

  // Status mapping based on calculated percentages
  const statusA = results.capacityUsed33Pct >= 100 ? "OVERLOAD" : results.capacityUsed33Pct >= 85 ? "WARNING" : "SAFE";
  const statusB = results.capacityUsed74Pct >= 100 ? "OVERLOAD" : results.capacityUsed74Pct >= 85 ? "WARNING" : "SAFE";

  const colorA = statusA === "OVERLOAD" ? "danger" : statusA === "WARNING" ? "warning" : "emerald";
  const colorB = statusB === "OVERLOAD" ? "danger" : statusB === "WARNING" ? "warning" : "emerald";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-8">
      
      {/* SECTION 1: Executive KPIs (Graceful Mobile Degradation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:break-inside-avoid">
        {[
          { label: "Total Rated Capacity", value: results.totalKVA.toFixed(0), unit: "kVA", color: "text-foreground" },
          { label: "Usable Load Envelope", value: results.usableKW.toFixed(1), unit: "kW", color: "text-emerald" },
          { label: "Background Demand", value: results.baseActualDemand.toFixed(1), unit: "kW", color: "text-muted-foreground" },
          {
            label: "Safe EV Capacity (3.3 kW)",
            value: results.maxConcurrentUsers33.toString(),
            unit: "users",
            color: results.maxConcurrentUsers33 > 10 ? "text-emerald" : results.maxConcurrentUsers33 > 0 ? "text-warning" : "text-danger",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4 sm:p-5 print:shadow-none print:border-border">
            <p className="text-[10px] sm:text-xs tracking-wider uppercase text-muted-foreground mb-2">{kpi.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("font-mono text-2xl sm:text-3xl font-bold", kpi.color)}>
                {kpi.value}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* SECTION 2: A vs B Comparison Matrix */}
      <Card className="overflow-hidden print:shadow-none print:break-inside-avoid print:border-border">
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between">
          <h3 className="text-xs tracking-widest uppercase font-semibold text-foreground font-heading">
            Scenario Comparison Manifest
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="h-8 gap-2 border-emerald/40 text-emerald hover:bg-emerald/10 hover:text-emerald dark:hover:text-emerald print:hidden"
          >
            <Download size={14} />
            <span className="hidden sm:inline uppercase tracking-wider text-[10px] font-bold">Export PDF</span>
          </Button>
        </div>

        {/* Mobile Edge-to-Edge Swipe Container */}
        <div className="w-full overflow-x-auto scrollbar-hide md:scrollbar-default print:overflow-visible">
          <table className="w-full min-w-[700px] text-left print:w-full">
            <thead className="bg-muted/10 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold text-muted-foreground font-mono">PARAMETER</th>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold font-mono whitespace-nowrap">
                  <span className="text-emerald">SCENARIO A</span>
                  <span className="text-muted-foreground font-normal ml-2">— 3.3 kW</span>
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold font-mono whitespace-nowrap">
                  <span className="text-danger">SCENARIO B</span>
                  <span className="text-muted-foreground font-normal ml-2">— 7.4 kW</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <MetricRow label="Charger Power Rating" valueA="3.3" valueB="7.4" unit="kW / EV" />
              
              {/* Aggregated Engine Data */}
              <MetricRow label="Total Residential Flats" valueA={results.totalFlats} valueB={results.totalFlats} unit="units" />
              <MetricRow label="Simultaneous Active EVs" valueA={results.totalEVUsers33} valueB={results.totalEVUsers74} unit="sessions" />
              
              <MetricRow label="EV Charging Load" valueA={results.evActualDemand33.toFixed(1)} valueB={results.evActualDemand74.toFixed(1)} unit="kW" />
              <MetricRow label="Background Community Load" valueA={results.baseActualDemand.toFixed(1)} valueB={results.baseActualDemand.toFixed(1)} unit="kW" />
              <MetricRow label="Total Combined Load" valueA={results.totalSystemLoad33.toFixed(1)} valueB={results.totalSystemLoad74.toFixed(1)} unit="kW" />
              <MetricRow 
                label="Usable Capacity" 
                valueA={results.usableKW.toFixed(1)} 
                valueB={results.usableKW.toFixed(1)} 
                unit="kW" highlightA="emerald" highlightB="emerald" 
              />
              <MetricRow 
                label="Capacity Utilisation" 
                valueA={`${results.capacityUsed33Pct.toFixed(1)}%`} 
                valueB={`${results.capacityUsed74Pct.toFixed(1)}%`} 
                highlightA={colorA} highlightB={colorB} 
              />
              <MetricRow 
                label="Available Headroom" 
                valueA={headroomA.toFixed(1)} 
                valueB={headroomB.toFixed(1)} 
                unit="kW" 
                highlightA={headroomA > 0 ? "emerald" : "danger"} 
                highlightB={headroomB > 0 ? "emerald" : "danger"} 
              />
              <MetricRow 
                label="Max Safe EV Sessions" 
                valueA={results.maxConcurrentUsers33} 
                valueB={results.maxConcurrentUsers74} 
                unit="EVs" 
                highlightA={results.maxConcurrentUsers33 > 10 ? "emerald" : results.maxConcurrentUsers33 > 0 ? "warning" : "danger"} 
                highlightB={results.maxConcurrentUsers74 > 10 ? "emerald" : results.maxConcurrentUsers74 > 0 ? "warning" : "danger"} 
              />
            </tbody>
          </table>
        </div>

        {/* Matrix Status Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border">
          {[
            { status: statusA, color: colorA },
            { status: statusB, color: colorB },
          ].map(({ status, color }, i) => (
            <div
              key={i}
              className={cn(
                "p-4 flex items-center justify-center sm:justify-start gap-2",
                i === 0 && "border-b sm:border-b-0 sm:border-r border-border",
                color === "emerald" ? "bg-emerald/5" : color === "danger" ? "bg-danger/5" : "bg-warning/5"
              )}
            >
              {status === "SAFE" ? (
                <CheckCircle size={18} className="text-emerald" />
              ) : status === "OVERLOAD" ? (
                <XCircle size={18} className="text-danger" />
              ) : (
                <AlertTriangle size={18} className="text-warning" />
              )}
              <span className={cn(
                "font-mono text-xs tracking-widest font-semibold",
                color === "emerald" ? "text-emerald" : color === "danger" ? "text-danger" : "text-warning"
              )}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 3: Transformer Infrastructure Manifest */}
      <Card className="p-4 sm:p-6 print:shadow-none print:break-inside-avoid print:border-border">
        <h4 className="text-xs tracking-widest uppercase font-semibold text-foreground mb-4 sm:mb-6 font-heading">
          Transformer Asset Registry
        </h4>
        
        {inputs.numTransformers === 0 ? (
          <p className="text-muted-foreground text-xs sm:text-sm font-mono bg-muted/20 p-4 rounded-lg text-center sm:text-left">
            No infrastructure assets configured.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {inputs.transformerKVAs.map((kva, i) => (
              <div key={i} className="bg-card border border-border shadow-sm rounded-lg p-3 sm:p-4 print:shadow-none flex flex-col items-center sm:items-start">
                <p className="text-muted-foreground text-[10px] sm:text-xs font-mono uppercase mb-1 sm:mb-2 text-center sm:text-left w-full">Tr {i + 1}</p>
                <p className="font-mono text-xl sm:text-2xl font-bold text-emerald">
                  {kva || 0}
                  <span className="text-muted-foreground text-[10px] sm:text-xs font-normal ml-1">kVA</span>
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <span className="text-muted-foreground text-[10px] sm:text-xs font-mono uppercase tracking-wider text-center sm:text-left">
            Total Rated System Capacity
          </span>
          <span className="font-mono text-lg sm:text-xl font-bold text-foreground">
            {results.totalKVA.toFixed(0)} kVA
          </span>
        </div>
      </Card>

      {/* WIZARD PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8 print:hidden">
        <Button variant="ghost" onClick={onPrev} className="text-muted-foreground gap-2 w-full sm:w-auto">
          <ArrowLeft size={16} /> Previous
        </Button>
        
        <Button 
          onClick={onNext} 
          className="gap-2 w-full sm:w-auto font-heading tracking-wide uppercase font-bold bg-emerald text-white hover:bg-emerald/90 shadow-emerald/20"
        >
          Next: Why It Matters <ArrowRight size={16} />
        </Button>
      </div>

    </div>
  );
}