"use client";

import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine,
} from "recharts";
import { BarChart2, Grid3X3, TrendingUp, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { SimInputs, SimResults } from "../lib/calculator";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { cn } from "../lib/utils";

interface WhyItMattersProps {
  inputs: SimInputs;
  results: SimResults;
}

// --- Predictive Data Models ---
function buildProbabilityData(maxSafeEVs: number, totalFlats: number) {
  return Array.from({ length: 21 }, (_, i) => {
    const adoption = i * 5; 
    const evUsers = Math.round((adoption / 100) * Math.max(1, totalFlats));
    const loadFactor = evUsers / Math.max(1, maxSafeEVs);
    const overloadProb = Math.min(100, Math.max(0, (loadFactor - 0.75) * 200)); 
    return { adoption, overloadProb: parseFloat(overloadProb.toFixed(1)), evUsers };
  });
}

function buildGrowthData(usableLoad: number, bgLoad: number, totalFlats: number) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 13 }, (_, i) => {
    const year = currentYear + i;
    const adoption = Math.min(80, i * 6); 
    const evUsers = (adoption / 100) * totalFlats;
    
    const evLoad33 = evUsers * (2 * 0.7); 
    const evLoad74 = evUsers * (7 * 0.7); 
    
    return {
      year,
      adoption,
      load33: parseFloat((bgLoad + evLoad33).toFixed(1)),
      load74: parseFloat((bgLoad + evLoad74).toFixed(1)),
      capacity: parseFloat(usableLoad.toFixed(1)),
    };
  });
}

// --- Custom Recharts Tooltip ---
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-xl">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 font-mono text-sm">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-foreground">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.value}{typeof p.value === "number" && p.name?.toLowerCase().includes("prob") ? "%" : " kW"}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Sub-Views ---
function ProbabilityView({ results, totalFlats }: { results: SimResults, totalFlats: number }) {
  const data = buildProbabilityData(results.maxConcurrentUsers33, totalFlats);
  const criticalAdoption = data.find((d) => d.overloadProb > 50)?.adoption;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <Card className="lg:col-span-2 p-6">
        <p className="text-xs tracking-wider uppercase text-muted-foreground mb-6 font-heading">
          Overload Probability vs EV Adoption Rate
        </p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="adoption" tickFormatter={(v) => `${v}%`} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={50} stroke="var(--color-warning)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="overloadProb" name="Overload Risk" stroke="var(--color-emerald)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "var(--color-emerald)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">Critical Threshold</p>
          <div className="flex items-baseline gap-1">
            <p className="font-mono text-4xl font-bold text-warning">{criticalAdoption ?? "—"}</p>
            <p className="text-xl font-bold text-warning">%</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">EV adoption rate at which overload risk exceeds 50%.</p>
        </Card>
        
        <Card className="p-5">
          <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">Safe Operating Window</p>
          <div className="flex items-baseline gap-1">
            <p className="font-mono text-4xl font-bold text-emerald">{Math.max(0, (criticalAdoption ?? 0) - 5)}</p>
            <p className="text-xl font-bold text-emerald">%</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Maximum community adoption with controlled grid risk.</p>
        </Card>

        <Card className="p-5 flex-1 bg-emerald/5 border-emerald/30">
          <p className="text-xs tracking-wider uppercase text-emerald font-bold mb-2">Executive Insight</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deploying AI-driven load management preserves infrastructure integrity, delaying the critical threshold by 3–5 years while avoiding strict utility penalties.
          </p>
        </Card>
      </div>
    </div>
  );
}

function HeatmapView() {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const displayHours = [0, 3, 6, 9, 12, 15, 18, 21];

  const heatColor = (pct: number) => {
    if (pct >= 90) return "bg-danger";
    if (pct >= 75) return "bg-warning";
    if (pct >= 55) return "bg-emerald";
    if (pct >= 35) return "bg-emerald/60";
    return "bg-muted/30 dark:bg-card";
  };

  const heatmapData = DAYS.map((day) =>
    HOURS.map((h) => {
      const isWeekday = day !== "Sat" && day !== "Sun";
      let base = 30 + Math.random() * 15;
      if (h >= 7 && h <= 9 && isWeekday) base += 35 + Math.random() * 20; 
      if (h >= 18 && h <= 22) base += 40 + Math.random() * 25; 
      if (h >= 23 || h <= 5) base += 20 + Math.random() * 15; 
      return Math.min(100, parseFloat(base.toFixed(0)));
    })
  );

  return (
    <Card className="p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <p className="text-xs tracking-wider uppercase text-muted-foreground font-heading">
          Weekly Peak Load Distribution
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {[
            { color: "bg-muted/30", label: "Low" },
            { color: "bg-emerald/60", label: "Moderate" },
            { color: "bg-warning", label: "Peak" },
            { color: "bg-danger", label: "Critical" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-[2px]", s.color)} />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          <div className="flex mb-2 pl-12">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-muted-foreground font-mono text-[10px] w-8">
                {displayHours.includes(h) ? `${h.toString().padStart(2, "0")}h` : ""}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1.5">
                <span className="w-10 text-right text-muted-foreground font-mono text-xs pr-2">
                  {day}
                </span>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    title={`${day} ${h}:00 — ${heatmapData[di][h]}% capacity`}
                    className={cn(
                      "w-8 h-6 rounded-[3px] transition-opacity hover:opacity-75 cursor-crosshair",
                      heatColor(heatmapData[di][h])
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-xs font-mono mt-6 border-t border-border pt-4">
        Analysis: Target automated load-shifting during evening peaks (18:00–22:00) to mitigate immediate transformer stress.
      </p>
    </Card>
  );
}

function TimelineView({ results, totalFlats }: { results: SimResults, totalFlats: number }) {
  const data = buildGrowthData(results.usableKW, results.baseActualDemand, totalFlats);
  const breakEven33 = data.find((d) => d.load33 >= d.capacity)?.year;
  const breakEven74 = data.find((d) => d.load74 >= d.capacity)?.year;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="p-6">
        <p className="text-xs tracking-wider uppercase text-muted-foreground mb-6 font-heading">
          EV Adoption Growth vs Transformer Capacity
        </p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-emerald)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-emerald)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} unit=" kW" />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={results.usableKW} stroke="var(--color-danger)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Max Usable Capacity", fill: "var(--color-danger)", fontSize: 11, position: 'insideTopLeft' }} />
              <Area type="monotone" dataKey="load33" name="Load (3.3 kW)" stroke="var(--color-emerald)" strokeWidth={2} fill="url(#gradEmerald)" />
              <Area type="monotone" dataKey="load74" name="Load (7.4 kW)" stroke="var(--color-warning)" strokeWidth={2} fill="url(#gradWarning)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-emerald/5 border-emerald/30">
          <p className="text-emerald text-xs tracking-wider uppercase mb-1">3.3 kW Breach Year</p>
          <p className="font-mono text-3xl font-bold text-emerald">{breakEven33 ?? "Post-2036"}</p>
          <p className="text-muted-foreground text-xs mt-2">Projected failure under standard 3.3 kW universal adoption.</p>
        </Card>
        <Card className="p-5 bg-warning/5 border-warning/30">
          <p className="text-warning text-xs tracking-wider uppercase mb-1">7.4 kW Breach Year</p>
          <p className="font-mono text-3xl font-bold text-warning">{breakEven74 ?? "Post-2036"}</p>
          <p className="text-muted-foreground text-xs mt-2">Accelerated failure under rapid 7.4 kW adoption.</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">Action Window</p>
          <p className="font-mono text-3xl font-bold text-foreground">
            {breakEven33 ? `${breakEven33 - currentYear} yrs` : "10+ yrs"}
          </p>
          <p className="text-muted-foreground text-xs mt-2">Time available to deploy orchestration hardware.</p>
        </Card>
      </div>
    </div>
  );
}

function CostView() {
  const managedItems = [
    { label: "Smart EVSE Hardware (per charger)", value: "₹45k – ₹80k" },
    { label: "AI Orchestration Software (annual)", value: "₹1.2L – ₹2.4L" },
    { label: "Utility Incentive Rebates", value: "Eligible" },
    { label: "Transformer Upgrade Timeline", value: "Deferred 10+ yrs" },
    { label: "Peak Demand Penalty Reduction", value: "30–60%" },
  ];

  const doNothingItems = [
    { label: "Emergency Transformer Augmentation", value: "₹45L – ₹90L" },
    { label: "Distribution Grid Overhaul", value: "₹20L – ₹60L" },
    { label: "Utility Penalty Charges (annual)", value: "₹8L – ₹24L" },
    { label: "Resident Litigation Risk", value: "High" },
    { label: "Property Value Impact", value: "−5% to −12%" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <Card className="border-emerald/30 overflow-hidden flex flex-col">
        <div className="bg-emerald/10 border-b border-emerald/30 px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-emerald" size={20} />
            <h4 className="text-emerald tracking-widest text-sm uppercase font-bold font-heading">
              Option A — Infrastructure OS
            </h4>
          </div>
          <p className="text-muted-foreground text-xs pl-8">Proactive deployment of Nevora's load orchestration architecture.</p>
        </div>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-4 mb-8">
            {managedItems.map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-4 pb-3 border-b border-border">
                <span className="text-muted-foreground text-sm">{item.label}</span>
                <span className="font-mono text-sm font-semibold text-emerald text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto bg-emerald/10 rounded-lg p-4">
            <p className="text-emerald text-xs font-bold tracking-widest mb-2">LONG-TERM OUTCOME</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Preserves absolute asset value, guarantees policy compliance, and elevates the property to a premium, future-proofed sustainability tier.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-danger/30 overflow-hidden flex flex-col">
        <div className="bg-danger/10 border-b border-danger/30 px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-danger" size={20} />
            <h4 className="text-danger tracking-widest text-sm uppercase font-bold font-heading">
              Option B — Unmanaged Grid
            </h4>
          </div>
          <p className="text-muted-foreground text-xs pl-8">Deferred action resulting in eventual hardware failure.</p>
        </div>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-4 mb-8">
            {doNothingItems.map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-4 pb-3 border-b border-border">
                <span className="text-muted-foreground text-sm">{item.label}</span>
                <span className="font-mono text-sm font-semibold text-danger text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto bg-danger/10 rounded-lg p-4">
            <p className="text-danger text-xs font-bold tracking-widest mb-2">LONG-TERM OUTCOME</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Forces catastrophic capital expenditure, triggers severe BESCOM regulatory penalties, and actively damages the community's premium market positioning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WhyItMattersTab({ inputs, results }: WhyItMattersProps) {
  const totalFlats = (inputs.flats3kw || 0) + (inputs.flats5kw || 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="probability" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
          <TabsTrigger value="probability" className="gap-2">
            <BarChart2 size={16} /> <span className="hidden sm:inline font-heading tracking-wider">Probability</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-2">
            <Grid3X3 size={16} /> <span className="hidden sm:inline font-heading tracking-wider">Heatmap</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <TrendingUp size={16} /> <span className="hidden sm:inline font-heading tracking-wider">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="gap-2">
            <DollarSign size={16} /> <span className="hidden sm:inline font-heading tracking-wider">Cost</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="probability" className="mt-0">
          <ProbabilityView results={results} totalFlats={totalFlats} />
        </TabsContent>
        <TabsContent value="heatmap" className="mt-0">
          <HeatmapView />
        </TabsContent>
        <TabsContent value="timeline" className="mt-0">
          <TimelineView results={results} totalFlats={totalFlats} />
        </TabsContent>
        <TabsContent value="cost" className="mt-0">
          <CostView />
        </TabsContent>
      </Tabs>
    </div>
  );
}