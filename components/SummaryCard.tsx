"use client";

import React from "react";
import { Download, CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SummaryTabProps {
  inputs: SimInputs;
  results: SimResults;
  onNext: () => void;
  onPrev: () => void;
}

function MetricRow({
  label, valueA, valueB, unit, highlightA, highlightB,
}: {
  label: string; valueA: string | number; valueB: string | number;
  unit?: string; highlightA?: "emerald" | "danger" | "warning" | null; highlightB?: "emerald" | "danger" | "warning" | null;
}) {
  const colorMap = { emerald: "text-emerald", danger: "text-danger", warning: "text-warning" };
  
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/5 print:border-neutral-200">
      <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono whitespace-normal sm:whitespace-nowrap">
        {label}
      </td>
      <td className={cn("px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm font-semibold whitespace-nowrap", highlightA ? colorMap[highlightA] : "text-foreground print:text-black")}>
        {valueA} {unit && <span className="ml-1 text-[10px] sm:text-xs font-normal text-muted-foreground">{unit}</span>}
      </td>
      <td className={cn("px-4 sm:px-6 py-4 font-mono text-xs sm:text-sm font-semibold whitespace-nowrap", highlightB ? colorMap[highlightB] : "text-foreground print:text-black")}>
        {valueB} {unit && <span className="ml-1 text-[10px] sm:text-xs font-normal text-muted-foreground">{unit}</span>}
      </td>
    </tr>
  );
}

export function SummaryTab({ inputs, results, onNext, onPrev }: SummaryTabProps) {
  const headroomA = Math.max(0, results.usableKW - results.totalSystemLoad33);
  const headroomB = Math.max(0, results.usableKW - results.totalSystemLoad74);

  const statusA = results.capacityUsed33Pct >= 100 ? "OVERLOAD" : results.capacityUsed33Pct >= 85 ? "WARNING" : "SAFE";
  const statusB = results.capacityUsed74Pct >= 100 ? "OVERLOAD" : results.capacityUsed74Pct >= 85 ? "WARNING" : "SAFE";

  const colorA = statusA === "OVERLOAD" ? "danger" : statusA === "WARNING" ? "warning" : "emerald";
  const colorB = statusB === "OVERLOAD" ? "danger" : statusB === "WARNING" ? "warning" : "emerald";

  // Derive structural metrics securely from input matrix arrays
  const totalEVUsersA = results.totalEVUsers33 || 0;
  const totalEVUsersB = results.totalEVUsers74 || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-6 print:text-black">
      
      {/* SECTION 1: Executive Core Infrastructure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2 print:break-inside-avoid">
        {[
          { label: "Total Asset Transformer", value: results.totalKVA.toFixed(0), unit: "kVA", color: "text-foreground" },
          { label: "Usable Envelope (80% Load)", value: results.usableKW.toFixed(1), unit: "kW", color: "text-emerald" },
          { label: "Base Diversity Demand", value: results.baseActualDemand.toFixed(1), unit: "kW", color: "text-muted-foreground" },
          {
            label: "Max Concurrent EVs (3.3kW)",
            value: results.maxConcurrentUsers33.toString(),
            unit: "Slots",
            color: results.maxConcurrentUsers33 > 10 ? "text-emerald" : results.maxConcurrentUsers33 > 0 ? "text-warning" : "text-danger",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4 sm:p-5 print:shadow-none print:border-neutral-200">
            <p className="text-[10px] sm:text-xs tracking-wider uppercase text-muted-foreground mb-2 font-heading print:text-neutral-500">{kpi.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("font-mono text-2xl sm:text-3xl font-bold tracking-tight", kpi.color, "print:text-black")}>
                {kpi.value}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* SECTION 2: Comprehensive Structural Audit Matrix */}
      <Card className="overflow-hidden print:shadow-none print:break-inside-avoid print:border-neutral-200">
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between print:bg-white print:border-neutral-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald print:text-black" />
            <h3 className="text-xs tracking-widest uppercase font-semibold text-foreground font-heading print:text-black">
              Engineering Infrastructure Manifest
            </h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="h-8 gap-2 border-emerald/40 text-emerald hover:bg-emerald/10 hover:text-emerald print:hidden"
          >
            <Download size={14} />
            <span className="hidden sm:inline uppercase tracking-wider text-[10px] font-bold">Generate PDF Report</span>
          </Button>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide md:scrollbar-default print:overflow-visible">
          <table className="w-full min-w-[700px] text-left print:w-full print:min-w-0">
            <thead className="bg-muted/10 border-b border-border print:bg-neutral-50 print:border-neutral-200">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold text-muted-foreground font-mono print:text-neutral-600">INFRASTRUCTURE PARAMETER</th>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold font-mono whitespace-nowrap">
                  <span className="text-emerald print:text-black font-bold">SCENARIO A</span>
                  <span className="text-muted-foreground font-normal ml-2 text-[11px]">— 3.3 kW AC Standard</span>
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs tracking-wider font-semibold font-mono whitespace-nowrap">
                  <span className="text-danger print:text-black font-bold">SCENARIO B</span>
                  <span className="text-muted-foreground font-normal ml-2 text-[11px]">— 7.4 kW AC Accelerated</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <MetricRow label="Specified Charger Power Output" valueA="3.3" valueB="7.4" unit="kW / Port" />
              <MetricRow label="Aggregated Community Footprint" valueA={results.totalFlats} valueB={results.totalFlats} unit="Residential Units" />
              <MetricRow label="Active Simulated EV Fleet Size" valueA={totalEVUsersA} valueB={totalEVUsersB} unit="Connected Vehicles" />
              
              {/* Coincident Demand Telemetry Injections */}
              <MetricRow 
                label="Empirical Coincident EV Diversity Factor" 
                valueA="70.0%" 
                valueB="70.0%" 
                unit="Diversity Rule" 
              />
              
              <MetricRow label="Net EV Superimposed Load Demand" valueA={results.evActualDemand33.toFixed(1)} valueB={results.evActualDemand74.toFixed(1)} unit="kW" />
              <MetricRow label="Baseload Power Allocation (Diversified)" valueA={results.baseActualDemand.toFixed(1)} valueB={results.baseActualDemand.toFixed(1)} unit="kW" />
              <MetricRow label="Total Aggregated System Load Grid Draw" valueA={results.totalSystemLoad33.toFixed(1)} valueB={results.totalSystemLoad74.toFixed(1)} unit="kW" />
              
              <MetricRow 
                label="Maximum Authorized Substation Threshold" 
                valueA={results.usableKW.toFixed(1)} 
                valueB={results.usableKW.toFixed(1)} 
                unit="kW" highlightA="emerald" highlightB="emerald" 
              />
              <MetricRow 
                label="Substation Utilization Index" 
                valueA={`${results.capacityUsed33Pct.toFixed(1)}%`} 
                valueB={`${results.capacityUsed74Pct.toFixed(1)}%`} 
                highlightA={colorA} highlightB={colorB} 
              />
              <MetricRow 
                label="Operational Thermal Headroom Status" 
                valueA={headroomA.toFixed(1)} 
                valueB={headroomB.toFixed(1)} 
                unit="kW" 
                highlightA={headroomA > 0 ? "emerald" : "danger"} 
                highlightB={headroomB > 0 ? "emerald" : "danger"} 
              />
              <MetricRow 
                label="Statutory Safety Cap Limit" 
                valueA={results.maxConcurrentUsers33} 
                valueB={results.maxConcurrentUsers74} 
                unit="Simultaneous Safe EV Node Allocations" 
                highlightA={results.maxConcurrentUsers33 > 10 ? "emerald" : results.maxConcurrentUsers33 > 0 ? "warning" : "danger"} 
                highlightB={results.maxConcurrentUsers74 > 10 ? "emerald" : results.maxConcurrentUsers74 > 0 ? "warning" : "danger"} 
              />
            </tbody>
          </table>
        </div>

        {/* Matrix Status Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border print:border-neutral-200 print:grid-cols-2">
          {[
            { status: statusA, color: colorA, label: "Scenario A Substation State:" },
            { status: statusB, color: colorB, label: "Scenario B Substation State:" },
          ].map(({ status, color, label }, i) => (
            <div
              key={i}
              className={cn(
                "p-4 flex items-center justify-between sm:justify-start gap-4",
                i === 0 && "border-b sm:border-b-0 sm:border-r border-border print:border-neutral-200 print:border-b-0",
                color === "emerald" ? "bg-emerald/5 print:bg-neutral-50" : color === "danger" ? "bg-danger/5 print:bg-neutral-50" : "bg-warning/5 print:bg-neutral-50"
              )}
            >
              <div className="flex items-center gap-2">
                {status === "SAFE" ? (
                  <CheckCircle size={16} className="text-emerald print:text-neutral-800" />
                ) : status === "OVERLOAD" ? (
                  <XCircle size={16} className="text-danger print:text-neutral-800" />
                ) : (
                  <AlertTriangle size={16} className="text-warning print:text-neutral-800" />
                )}
                <span className="text-xs font-mono font-medium text-muted-foreground print:text-neutral-600">{label}</span>
              </div>
              <span className={cn(
                "font-mono text-xs tracking-widest font-bold",
                color === "emerald" ? "text-emerald" : color === "danger" ? "text-danger" : "text-warning",
                "print:text-black print:underline"
              )}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 3: Distribution Asset Network Inventory */}
      <Card className="p-4 sm:p-6 print:shadow-none print:break-inside-avoid print:border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs tracking-widest uppercase font-semibold text-foreground font-heading print:text-black">
            Substation Transformer Asset Topology
          </h4>
          <Badge variant="outline" className="font-mono text-[10px] uppercase border-emerald/30 text-emerald bg-emerald/5 print:text-black print:border-neutral-400">
            BESCOM Standard Match
          </Badge>
        </div>
        
        {inputs.numTransformers === 0 ? (
          <p className="text-muted-foreground text-xs font-mono bg-muted/20 p-4 rounded-lg text-center print:border print:border-neutral-200">
            No active substation transformer assets specified in network matrix.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 print:grid-cols-6 print:gap-2">
            {inputs.transformerKVAs.map((kva, i) => (
              <div key={i} className="bg-card border border-border shadow-sm rounded-lg p-3 sm:p-4 print:shadow-none print:border-neutral-200 flex flex-col items-center sm:items-start">
                <p className="text-muted-foreground text-[10px] font-mono uppercase mb-1 print:text-neutral-500">Node Asset {i + 1}</p>
                <p className="font-mono text-xl font-bold text-emerald print:text-black">
                  {kva || 0}
                  <span className="text-muted-foreground text-[10px] font-normal ml-1 font-sans">kVA</span>
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:justify-between items-center gap-2 print:border-neutral-200 print:mt-4">
          <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider print:text-neutral-500">
            Total Aggregate Transformer Operational Envelope
          </span>
          <span className="font-mono text-base font-bold text-foreground print:text-black">
            {results.totalKVA.toFixed(0)} kVA Capacity
          </span>
        </div>
      </Card>

      {/* WIZARD PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8 print:hidden">
        <Button variant="ghost" onClick={onPrev} className="text-muted-foreground gap-2 w-full sm:w-auto">
          <ArrowLeft size={16} /> Previous Page
        </Button>
        
        <Button 
          onClick={onNext} 
          className="gap-2 w-full sm:w-auto font-heading tracking-wide uppercase font-bold bg-emerald text-white hover:bg-emerald/90 shadow-emerald/20"
        >
          Proceed to Narrative Analytics <ArrowRight size={16} />
        </Button>
      </div>

    </div>
  );
}