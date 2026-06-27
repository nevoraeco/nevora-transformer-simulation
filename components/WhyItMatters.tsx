"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  BarChart2,
  Grid3X3,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  UploadCloud,
  AlertCircle,
  Info,
} from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface WhyItMattersProps {
  inputs: SimInputs;
  results: SimResults;
  onPrev: () => void;
  onGenerate: () => void;
}

// ---------------------------------------------------------
// DATA GENERATORS
// ---------------------------------------------------------
function buildProbabilityData(maxSafeEVs: number, totalFlats: number) {
  const secureMaxSafe = Math.max(1, maxSafeEVs);
  const secureTotalFlats = Math.max(1, totalFlats);
  
  return Array.from({ length: 21 }, (_, i) => {
    const adoption = i * 5;
    const evUsers = Math.round((adoption / 100) * secureTotalFlats);
    const loadFactor = evUsers / secureMaxSafe;
    const overloadProb = 100 / (1 + Math.exp(-12 * (loadFactor - 0.85)));
    
    return {
      adoption,
      overloadProb: parseFloat(
        Math.min(100, Math.max(0, overloadProb)).toFixed(1)
      ),
      evUsers,
    };
  });
}

function buildGrowthData(
  usableLoad: number,
  bgLoad: number,
  totalFlats: number,
  avgEnh33: number,
  avgEnh74: number
) {
  const currentYear = new Date().getFullYear();
  const secureUsableLoad = Math.max(1, usableLoad);
  
  return Array.from({ length: 13 }, (_, i) => {
    const year = currentYear + i;
    const adoption = Math.min(90, 90 / (1 + Math.exp(-0.4 * (i - 4))));
    const evUsers = (adoption / 100) * totalFlats;

    // Mathematical Baseline sync
    const evLoad33 = evUsers * avgEnh33;
    const evLoad74 = evUsers * avgEnh74;

    return {
      year,
      adoption: parseFloat(adoption.toFixed(1)),
      load33: parseFloat(
        Math.min(secureUsableLoad * 1.4, bgLoad + evLoad33).toFixed(1)
      ),
      load74: parseFloat(
        Math.min(secureUsableLoad * 1.8, bgLoad + evLoad74).toFixed(1)
      ),
      capacity: parseFloat(secureUsableLoad.toFixed(1)),
    };
  });
}

function generateDeterministicHeatmap(
  baseDemand: number,
  usableKW: number,
  evDemand: number
) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const secureUsable = Math.max(1, usableKW);
  
  return DAYS.map((day, dayIndex) => {
    const isWeekend = day === "Sat" || day === "Sun";
    
    return Array.from({ length: 24 }, (_, hour) => {
      let diurnalFactor = 0.35;
      
      if (hour >= 6 && hour <= 9) {
        diurnalFactor = isWeekend ? 0.45 : 0.75;
      } else if (hour >= 10 && hour <= 16) {
        diurnalFactor = isWeekend ? 0.6 : 0.4;
      } else if (hour >= 18 && hour <= 22) {
        diurnalFactor = isWeekend ? 0.85 : 0.9;
      } else if (hour >= 23 || hour <= 5) {
        diurnalFactor = 0.25;
      }
      
      const rawBaseLoad = baseDemand * (diurnalFactor + (dayIndex * 0.02 - 0.06));
      let evChargingFactor = 0.05;
      
      if (hour >= 20 || hour <= 3) {
        evChargingFactor = hour >= 22 || hour <= 1 ? 0.85 : 0.4;
      } else if (hour >= 8 && hour <= 11) {
        evChargingFactor = isWeekend ? 0.3 : 0.1;
      }
      
      const rawEvLoad = evDemand * evChargingFactor;
      const capacityUtilizationIndex =
        ((rawBaseLoad + rawEvLoad) / secureUsable) * 100;
        
      return Math.min(
        100,
        parseFloat(Math.max(5, capacityUtilizationIndex).toFixed(0))
      );
    });
  });
}

// ---------------------------------------------------------
// UI COMPONENTS
// ---------------------------------------------------------
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl z-50">
      <p className="text-xs font-mono font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((p: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between gap-8 font-mono text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-neutral-400">{p.name}:</span>
            </div>
            <span
              className="font-bold tracking-tight"
              style={{ color: p.color }}
            >
              {p.value}
              {typeof p.value === "number" &&
              p.name?.toLowerCase().includes("risk")
                ? "%"
                : " kW"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function ProbabilityView({
  results,
  totalFlats,
}: {
  results: SimResults;
  totalFlats: number;
}) {
  const data = buildProbabilityData(results.maxConcurrentUsers33, totalFlats);
  const criticalAdoption = data.find((d) => d.overloadProb > 50)?.adoption;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-400">
      
      <Card className="lg:col-span-2 p-5 sm:p-6 shadow-sm border-border bg-card">
        <div className="flex flex-col gap-1 mb-6">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-mono font-semibold">
            Stochastic Assessment Analytics
          </p>
          <h4 className="text-sm font-semibold tracking-tight font-heading">
            Grid Crash Overload Risk vs Community Adoption Trajectory
          </h4>
        </div>
        <div className="h-[260px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="adoption"
                tickFormatter={(v) => `${v}%`}
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={50}
                stroke="var(--color-warning)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="overloadProb"
                name="System Overload Risk"
                stroke="var(--color-emerald)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 0,
                  fill: "var(--color-emerald)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-5 bg-card border-border shadow-sm">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-mono font-medium">
            Critical Threshold
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-warning">
              {criticalAdoption ?? "—"}
            </p>
            <p className="text-sm font-semibold text-warning font-mono">%</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Community EV ownership level where coincidental uncoordinated charging
            poses an imminent asset failure risk.
          </p>
        </Card>

        <Card className="p-5 bg-card border-border shadow-sm">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-mono font-medium">
            Safe Operating Envelope
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-emerald">
              {Math.max(0, (criticalAdoption ?? 15) - 5)}
            </p>
            <p className="text-sm font-semibold text-emerald font-mono">%</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Maximum secure long-term fleet bounds matching standard static grid
            constraints without smart tier isolation.
          </p>
        </Card>

        <Card className="p-5 flex-1 bg-emerald/5 border-emerald/20 border flex gap-3 items-start">
          <Info size={16} className="text-emerald shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs tracking-wider uppercase text-emerald font-bold font-mono">
              Orchestration Vector
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrating real-time system diversity parameters shifts compliance
              bounds, completely absorbing baseline peaks without requesting
              transformer infrastructure augmentations.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeatmapView({ results }: { results: SimResults }) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const displayHours = [0, 4, 8, 12, 16, 20];
  
  const heatColor = (pct: number) => {
    if (pct >= 85) return "bg-danger shadow-sm border border-danger/30";
    if (pct >= 70) return "bg-warning/90 border border-warning/20";
    if (pct >= 45) return "bg-emerald/90";
    if (pct >= 25) return "bg-emerald/50";
    return "bg-muted/40 dark:bg-neutral-900";
  };
  
  const heatmapData = generateDeterministicHeatmap(
    results.baseActualDemand || 100,
    results.usableKW || 200,
    results.evActualDemand33 || 50
  );

  return (
    <Card className="p-5 sm:p-6 shadow-sm border-border bg-card overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-mono font-semibold">
            Chronological Utilization Topography
          </p>
          <h4 className="text-sm font-semibold tracking-tight font-heading">
            Weekly 24-Hour Distribution Load Profile Matrix
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-mono">
          {[
            { color: "bg-muted/40 dark:bg-neutral-900", label: "Idle (<25%)" },
            { color: "bg-emerald/50", label: "Nominal" },
            { color: "bg-emerald/90", label: "Optimal" },
            { color: "bg-warning/90", label: "Peak Surge" },
            { color: "bg-danger", label: "Critical Risk" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div
                className={cn("w-2.5 h-2.5 rounded-[2px]", s.color)}
              />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full overflow-x-auto scrollbar-hide md:scrollbar-default pb-2">
        <div className="min-w-[720px]">
          <div className="flex mb-2 pl-12">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-muted-foreground font-mono text-[10px] font-medium"
              >
                {displayHours.includes(h)
                  ? `${h.toString().padStart(2, "0")}h`
                  : ""}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1.5">
                <span className="w-10 text-right text-muted-foreground font-mono text-xs font-semibold pr-2">
                  {day}
                </span>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    title={`${day} @ ${h
                      .toString()
                      .padStart(2, "0")}:00 — System Load Index: ${
                      heatmapData[di][h]
                    }%`}
                    className={cn(
                      "flex-1 h-6 rounded-[3px] transition-all duration-200 hover:scale-105 hover:z-10 cursor-crosshair",
                      heatColor(heatmapData[di][h])
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-border/60 flex items-start gap-2.5">
        <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
        <p className="text-muted-foreground font-mono text-[11px] leading-relaxed">
          System Diagnostics: Identified recurring peak capacity stress between
          18h and 22h. Automating grid-throttling profiles during these intervals
          guarantees asset preservation.
        </p>
      </div>
    </Card>
  );
}

function TimelineView({
  inputs,
  results,
  totalFlats,
}: {
  inputs: SimInputs;
  results: SimResults;
  totalFlats: number;
}) {
  const totalEVUsers33 = inputs.flatTiers.reduce(
    (sum, t) => sum + (t.ev33 || 0),
    0
  );
  const avgEnh33 =
    totalEVUsers33 > 0
      ? inputs.flatTiers.reduce(
          (sum, t) => sum + (t.enh33 || 0) * (t.ev33 || 0),
          0
        ) / totalEVUsers33
      : 3.3;
      
  const totalEVUsers74 = inputs.flatTiers.reduce(
    (sum, t) => sum + (t.ev74 || 0),
    0
  );
  const avgEnh74 =
    totalEVUsers74 > 0
      ? inputs.flatTiers.reduce(
          (sum, t) => sum + (t.enh74 || 0) * (t.ev74 || 0),
          0
        ) / totalEVUsers74
      : 7.4;

  const data = buildGrowthData(
    results.usableKW,
    results.baseActualDemand,
    totalFlats,
    avgEnh33,
    avgEnh74
  );
  
  const breakEven33 = data.find((d) => d.load33 >= d.capacity)?.year;
  const breakEven74 = data.find((d) => d.load74 >= d.capacity)?.year;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <Card className="p-5 sm:p-6 shadow-sm border-border bg-card">
        <div className="flex flex-col gap-1 mb-6">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground font-mono font-semibold">
            Macro-Temporal Capacity Horizon
          </p>
          <h4 className="text-sm font-semibold tracking-tight font-heading">
            Decadal Infrastructure Failure Projections & Threshold Intersections
          </h4>
        </div>
        
        <div className="h-[260px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
            >
              <defs>
                <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-emerald)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-emerald)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-warning)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-warning)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
                unit=" kW"
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={results.usableKW}
                stroke="var(--color-danger)"
                strokeDasharray="5 4"
                strokeWidth={2}
                label={{
                  value: "Transformer Safety Cap",
                  fill: "var(--color-danger)",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  position: "insideTopLeft",
                  dy: 4,
                }}
              />
              <Area
                type="monotone"
                dataKey="load33"
                name="Scenario A (3.3 kW Curve)"
                stroke="var(--color-emerald)"
                strokeWidth={2}
                fill="url(#gradEmerald)"
              />
              <Area
                type="monotone"
                dataKey="load74"
                name="Scenario B (7.4 kW Curve)"
                stroke="var(--color-warning)"
                strokeWidth={2}
                fill="url(#gradWarning)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-emerald/5 border border-emerald/20 shadow-sm">
          <p className="text-emerald text-[10px] tracking-widest uppercase font-mono font-semibold">
            Scenario A Breakeven Window
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-emerald mt-1">
            {breakEven33 ?? "Post-2038"}
          </p>
          <p className="text-muted-foreground text-[11px] mt-1.5">
            Projected infrastructure ceiling breach year under uniform standard
            nodes.
          </p>
        </Card>

        <Card className="p-4 bg-warning/5 border border-warning/20 shadow-sm">
          <p className="text-warning text-[10px] tracking-widest uppercase font-mono font-semibold">
            Scenario B Critical Threat
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-warning mt-1">
            {breakEven74 ?? "Post-2038"}
          </p>
          <p className="text-muted-foreground text-[11px] mt-1.5">
            Accelerated asset breach triggered by high-velocity unmetered
            chargers.
          </p>
        </Card>

        <Card className="p-4 bg-card border-border shadow-sm">
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase font-mono font-semibold">
            Mitigation Runway
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {breakEven33 ? `${breakEven33 - currentYear} Seasons` : "12+ Years"}
          </p>
          <p className="text-muted-foreground text-[11px] mt-1.5">
            Available operational buffer window to deploy software management layer.
          </p>
        </Card>
      </div>
    </div>
  );
}

function CostView() {
  const managedItems = [
    {
      label: "Smart Energy Management Interface Nodes",
      value: "₹45,000 – ₹80,000",
    },
    {
      label: "Core AI Balancer Suite License (Annual)",
      value: "₹1,20,000 – ₹2,40,000",
    },
    {
      label: "State Grid Infrastructure Regulatory Incentives",
      value: "Fully Eligible",
    },
    {
      label: "Physical Substation Augmentation Cost",
      value: "Deferred 10+ Years",
    },
    {
      label: "Peak Power Surcharge Penalty Slashes",
      value: "35% – 60% Savings",
    },
  ];
  
  const doNothingItems = [
    {
      label: "Complete Transformer Physical Augmentation",
      value: "₹45,00,000 – ₹90,00,000",
    },
    {
      label: "Primary Distribution Panelboard Overhaul",
      value: "₹20,00,000 – ₹60,00,000",
    },
    {
      label: "Maximum Demand Surcharge Penalty Fees (Annual)",
      value: "₹8,00,000 – ₹24,00,000",
    },
    {
      label: "Resident Association Regulatory Litigation Risk",
      value: "Critical Exposure",
    },
    {
      label: "Premium Asset Value Real Estate Depreciation",
      value: "-5% to -12% Impact",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-400">
      
      <Card className="border border-emerald/20 bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="bg-emerald/5 border-b border-emerald/20 px-5 py-4">
          <div className="flex items-center gap-2.5 mb-1">
            <CheckCircle className="text-emerald shrink-0" size={18} />
            <h4 className="text-emerald tracking-wider text-xs uppercase font-bold font-mono">
              Strategy Alpha: Orchestrated Load Network
            </h4>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Proactive implementation of dynamic algorithmic energy management
            parameters.
          </p>
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="space-y-3.5 mb-6">
            {managedItems.map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-start gap-4 pb-2.5 border-b border-border/60"
              >
                <span className="text-muted-foreground text-xs">{item.label}</span>
                <span className="font-mono text-xs font-bold text-emerald text-right shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto bg-emerald/5 border border-emerald/10 rounded-xl p-4">
            <p className="text-emerald text-[10px] font-bold tracking-widest font-mono mb-1">
              STRUCTURAL ADVANTAGE
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Maintains aggregate load vectors securely below safety trip ceilings,
              eliminates statutory penalty vectors, and secures property valuation
              indices.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-danger/20 bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="bg-danger/5 border-b border-danger/20 px-5 py-4">
          <div className="flex items-center gap-2.5 mb-1">
            <XCircle className="text-danger shrink-0" size={18} />
            <h4 className="text-danger tracking-wider text-xs uppercase font-bold font-mono">
              Strategy Beta: Static System Architecture
            </h4>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Deferred policy framework resulting in eventual localized substation
            insulation breakdowns.
          </p>
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="space-y-3.5 mb-6">
            {doNothingItems.map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-start gap-4 pb-2.5 border-b border-border/60"
              >
                <span className="text-muted-foreground text-xs">{item.label}</span>
                <span className="font-mono text-xs font-bold text-danger text-right shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto bg-danger/5 border border-danger/10 rounded-xl p-4">
            <p className="text-danger text-[10px] font-bold tracking-widest font-mono mb-1">
              CAPITAL RISKS
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Triggers catastrophic sub-station breakdown expenditures, imposes
              severe utility billing line surcharges, and damages premium property
              validation benchmarks.
            </p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

export function WhyItMattersTab({
  inputs,
  results,
  onPrev,
  onGenerate,
}: WhyItMattersProps) {
  const [mounted, setMounted] = useState(false);
  const totalFlats = results.totalFlats || 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-2xl" />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="probability" className="w-full">
        
        {/* Navigation Wrapper */}
        <div className="w-full overflow-x-auto scrollbar-hide pb-2 mb-4">
          <TabsList className="flex w-max min-w-full lg:grid lg:grid-cols-4 bg-muted/20 p-1 rounded-xl">
            <TabsTrigger
              value="probability"
              className="gap-2 px-5 py-2 flex-1 min-w-[130px] rounded-lg transition-all"
            >
              <BarChart2 size={14} />{" "}
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Risk Engine
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="gap-2 px-5 py-2 flex-1 min-w-[130px] rounded-lg transition-all"
            >
              <Grid3X3 size={14} />{" "}
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Load Topography
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="gap-2 px-5 py-2 flex-1 min-w-[130px] rounded-lg transition-all"
            >
              <TrendingUp size={14} />{" "}
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Growth Curve
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="cost"
              className="gap-2 px-5 py-2 flex-1 min-w-[130px] rounded-lg transition-all"
            >
              <DollarSign size={14} />{" "}
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Capital Audit
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Viewports */}
        <TabsContent
          value="probability"
          className="mt-0 outline-none border-0 focus-visible:ring-0"
        >
          <ProbabilityView results={results} totalFlats={totalFlats} />
        </TabsContent>
        <TabsContent
          value="heatmap"
          className="mt-0 outline-none border-0 focus-visible:ring-0"
        >
          <HeatmapView results={results} />
        </TabsContent>
        <TabsContent
          value="timeline"
          className="mt-0 outline-none border-0 focus-visible:ring-0"
        >
          <TimelineView
            inputs={inputs}
            results={results}
            totalFlats={totalFlats}
          />
        </TabsContent>
        <TabsContent
          value="cost"
          className="mt-0 outline-none border-0 focus-visible:ring-0"
        >
          <CostView />
        </TabsContent>
        
      </Tabs>

      {/* WIZARD COMPLETION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border mt-8 print:hidden">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-muted-foreground gap-2 w-full sm:w-auto font-mono text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Back to Manifest
        </Button>

        <Button
          onClick={onGenerate}
          className="gap-2 w-full sm:w-auto font-heading tracking-widest uppercase font-bold bg-emerald text-white hover:bg-emerald/90 shadow-lg shadow-emerald/10 px-6 h-11"
        >
          <UploadCloud size={15} strokeWidth={2.5} /> Finalize Executive Proposal
        </Button>
      </div>
    </div>
  );
}