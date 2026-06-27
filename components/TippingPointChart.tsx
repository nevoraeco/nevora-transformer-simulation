"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface TippingPointProps {
  scenario: "A" | "B";
  inputs: SimInputs;
  results: SimResults;
  onNext: () => void;
  onPrev: () => void;
}

interface TipRow {
  n: number;
  evLoad: number;
  bgLoad: number;
  totalLoad: number;
  pct: number;
  status: "SAFE" | "WARNING" | "OVERLOAD";
}

function buildTable(
  usable: number,
  bgLoad: number,
  netAddedPerEV: number,
  chargerKW: number,
  maxRows: number
): TipRow[] {
  return Array.from({ length: maxRows + 1 }, (_, n) => {
    const addedLoad = n * netAddedPerEV;
    const totalLoad = bgLoad + addedLoad;
    
    // Split purely for visual matrix parsing
    const evLoadEstimate = n * chargerKW;
    const dynamicBgLoad = totalLoad - evLoadEstimate;

    const pct = usable > 0 ? (totalLoad / usable) * 100 : 0;
    const status: TipRow["status"] =
      pct >= 100 ? "OVERLOAD" : pct >= 85 ? "WARNING" : "SAFE";

    return {
      n,
      evLoad: evLoadEstimate,
      bgLoad: dynamicBgLoad,
      totalLoad,
      pct,
      status,
    };
  });
}

function RadialGauge({ pct, size = 220 }: { pct: number; size?: number }) {
  const R = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, pct));
  const fill = (clamped / 100) * circ;

  const colorClass =
    pct >= 100
      ? "stroke-danger"
      : pct >= 85
      ? "stroke-warning"
      : "stroke-emerald";

  const textClass =
    pct >= 100
      ? "fill-danger"
      : pct >= 85
      ? "fill-warning"
      : "fill-emerald";

  return (
    <div className="flex justify-center w-full max-w-[240px] mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto drop-shadow-sm"
      >
        <circle
          cx={cx}
          cy={cy}
          r={R + 8}
          fill="none"
          strokeWidth="1"
          className="stroke-border/50"
        />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-border"
        />
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
        />
        <circle
          cx={cx}
          cy={cy}
          r={R - 14}
          className="fill-card transition-colors duration-300"
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={size * 0.14}
          className={cn(
            textClass,
            "font-mono font-bold transition-colors duration-300"
          )}
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
    </div>
  );
}

export function TippingPointChart({
  scenario,
  inputs,
  results,
  onNext,
  onPrev,
}: TippingPointProps) {
  const isA = scenario === "A";
  const chargerKW = isA ? 3.3 : 7.4;
  const currentPct = isA ? results.capacityUsed33Pct : results.capacityUsed74Pct;
  const currentTotal = isA ? results.totalSystemLoad33 : results.totalSystemLoad74;
  const headroomEVs = isA
    ? results.maxConcurrentUsers33
    : results.maxConcurrentUsers74;
  const totalEVUsers = isA ? results.totalEVUsers33 : results.totalEVUsers74;

  // Math Sync: Physical limits mapped directly into the generation loop
  const netAddedPerEV = isA
    ? totalEVUsers > 0
      ? inputs.flatTiers.reduce(
          (sum, t) =>
            sum + (3.3 + ((t.bgEv || 0) - (t.bgNoEv || 0))) * (t.ev33 || 0),
          0
        ) / totalEVUsers
      : 3.5
    : totalEVUsers > 0
    ? inputs.flatTiers.reduce(
        (sum, t) =>
          sum + (7.4 + ((t.bgEv || 0) - (t.bgNoEv || 0))) * (t.ev74 || 0),
        0
      ) / totalEVUsers
    : 7.6;

  const maxRows = Math.max(0, results.totalFlats);
  const rows = buildTable(
    results.usableKW,
    results.baseActualDemand,
    netAddedPerEV,
    chargerKW,
    maxRows
  );

  const tippingRow = rows.find((r) => r.status === "OVERLOAD");
  const tippingPoint = tippingRow ? tippingRow.n : null;

  const isOverload = currentPct >= 100;
  const isWarning = currentPct >= 85 && currentPct < 100;
  
  const accentColorClass = isA ? "bg-emerald" : "bg-danger";
  const accentTextClass = isA ? "text-emerald" : "text-danger";
  const scenLabel = isA
    ? "Scenario A — 3.3 kW AC Charging"
    : "Scenario B — 7.4 kW AC Charging";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Visualizations & Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radial Gauge Panel */}
        <Card className="flex flex-col items-center justify-center p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 self-start w-full">
            <div
              className={cn("h-4 w-1 rounded-full shrink-0", accentColorClass)}
            />
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-widest font-heading truncate",
                accentTextClass
              )}
            >
              {scenLabel}
            </h3>
          </div>
          
          <RadialGauge pct={currentPct} size={240} />
          
          <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 w-full">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs tracking-wider text-muted-foreground mb-1">
                USABLE
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold">
                {results.usableKW.toFixed(1)} kW
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs tracking-wider text-muted-foreground mb-1">
                TOTAL LOAD
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold">
                {currentTotal.toFixed(1)} kW
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs tracking-wider text-muted-foreground mb-1">
                HEADROOM
              </p>
              <p
                className={cn(
                  "font-mono text-xs sm:text-sm font-semibold",
                  isOverload ? "text-danger" : "text-emerald"
                )}
              >
                {Math.max(0, results.usableKW - currentTotal).toFixed(1)} kW
              </p>
            </div>
          </div>
        </Card>

        {/* Analytics Panels */}
        <div className="flex flex-col gap-4">
          <Card
            className={cn(
              "flex-1 shadow-sm border p-5 sm:p-6 transition-colors duration-300",
              isOverload
                ? "bg-danger/10 border-danger/30"
                : isWarning
                ? "bg-warning/10 border-warning/30"
                : "bg-emerald/10 border-emerald/30"
            )}
          >
            <div className="flex items-start gap-3">
              {isOverload ? (
                <XCircle className="text-danger shrink-0 mt-0.5" size={24} />
              ) : isWarning ? (
                <AlertTriangle
                  className="text-warning shrink-0 mt-0.5"
                  size={24}
                />
              ) : (
                <CheckCircle
                  className="text-emerald shrink-0 mt-0.5"
                  size={24}
                />
              )}
              <div>
                <p
                  className={cn(
                    "font-heading font-semibold text-sm sm:text-base tracking-wide",
                    isOverload
                      ? "text-danger"
                      : isWarning
                      ? "text-warning"
                      : "text-emerald"
                  )}
                >
                  {isOverload
                    ? "TRANSFORMER OVERLOAD"
                    : isWarning
                    ? "APPROACHING THRESHOLD"
                    : "SYSTEM OPERATING SAFELY"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {isOverload
                    ? "Current EV charging demand exceeds usable capacity. Immediate load management required."
                    : isWarning
                    ? "Operating above the 85% safety threshold. Limited additional EV capacity available."
                    : "The transformer infrastructure can accommodate current EV charging demand with headroom intact."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp
                size={16}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-semibold truncate">
                Tipping Point Analysis
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  Total Safe EVs
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald">
                    {headroomEVs}
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                    users
                  </p>
                </div>
              </div>
              <div className="pt-1 sm:pt-0 pl-0 sm:pl-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  Overload At
                </p>
                <div className="flex items-baseline gap-2">
                  <p
                    className={cn(
                      "font-mono text-2xl sm:text-3xl font-bold",
                      tippingPoint !== null ? "text-danger" : "text-muted-foreground"
                    )}
                  >
                    {tippingPoint !== null ? tippingPoint : "—"}
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                    users
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-border bg-gray-50/50 dark:bg-card shadow-sm">
            <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-semibold mb-2">
              Active Charger Specification
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "font-mono text-xl sm:text-2xl font-bold",
                  accentTextClass
                )}
              >
                {chargerKW}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                kW per EV session
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1">
              {isA
                ? "Mode 2 / Mode 3 — Standard AC"
                : "Mode 3 — Fast AC (IEC 62196)"}
            </p>
          </Card>
        </div>
      </div>

      {/* MATRIX GRID */}
      <Card className="overflow-hidden border-border shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs tracking-widest uppercase font-semibold font-heading">
            Net Physical Load Matrix
          </h4>
          <Badge variant="secondary" className="font-mono w-fit">
            {chargerKW} kW per EV
          </Badge>
        </div>
        
        <div className="w-full overflow-x-auto scrollbar-hide md:scrollbar-default pb-2">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="sticky top-0 bg-gray-50/95 dark:bg-[#121318]/95 backdrop-blur-sm border-b border-border z-10">
              <tr>
                {[
                  "EV USERS",
                  "EV HARDWARE DRAW",
                  "APARTMENT LOAD",
                  "TOTAL COMBINED",
                  "% CAPACITY",
                  "STATUS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 sm:px-6 py-3 text-xs tracking-wider font-semibold text-muted-foreground uppercase whitespace-nowrap"
                  >
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
                      "border-b border-border/50 transition-colors hover:bg-gray-50 dark:hover:bg-muted/10",
                      isOver
                        ? "bg-danger/5 dark:bg-danger/10"
                        : isWarn
                        ? "bg-warning/5 dark:bg-warning/10"
                        : ""
                    )}
                  >
                    <td className="px-4 sm:px-6 py-3 font-mono font-semibold">
                      {row.n}
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-muted-foreground whitespace-nowrap">
                      {row.evLoad.toFixed(1)} kW
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-muted-foreground whitespace-nowrap">
                      {row.bgLoad.toFixed(1)} kW
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-mono whitespace-nowrap">
                      {row.totalLoad.toFixed(1)} kW
                    </td>
                    <td
                      className={cn(
                        "px-4 sm:px-6 py-3 font-mono font-semibold",
                        isOver
                          ? "text-danger"
                          : isWarn
                          ? "text-warning"
                          : "text-emerald"
                      )}
                    >
                      {row.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isOver
                              ? "bg-danger"
                              : isWarn
                              ? "bg-warning"
                              : "bg-emerald"
                          )}
                        />
                        <span
                          className={cn(
                            "font-mono text-[10px] sm:text-xs tracking-wider font-semibold",
                            isOver
                              ? "text-danger"
                              : isWarn
                              ? "text-warning"
                              : "text-emerald"
                          )}
                        >
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

      {/* WIZARD PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-muted-foreground gap-2 w-full sm:w-auto"
        >
          <ArrowLeft size={16} /> Previous
        </Button>
        <Button
          onClick={onNext}
          className="gap-2 w-full sm:w-auto font-heading tracking-wide uppercase font-bold bg-emerald text-white hover:bg-emerald/90 shadow-emerald/20"
        >
          {isA ? "Next: 7.4 kW Scenario" : "Next: Executive Summary"}{" "}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}