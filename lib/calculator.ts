/**
 * Nevora FluxEngine - Core Calculation Library
 * Enterprise-grade mathematical engine utilizing dynamic array reduction
 * and proprietary diversity factors to model complex grid strains.
 */

// ==========================================
// 1. DYNAMIC DATA STRUCTURES
// ==========================================

export interface FlatTier {
  id: string; // Unique UUID for React rendering
  sanctionedLoad: number; // e.g., 3kW, 4kW, 5kW, 10kW
  count: number; // Number of flats in this tier
  
  // Scenario A Parameters (3.3kW)
  ev33: number; // Number of active EV users in this tier
  enh33: number; // Load enhancement required (kW)
  
  // Scenario B Parameters (7.4kW)
  ev74: number; // Number of active EV users in this tier
  enh74: number; // Load enhancement required (kW)
}

export interface CommonMeter {
  id: string;
  name: string; // e.g., "Clubhouse", "STP", "Lifts"
  load: number; // Sanctioned load for this specific meter
}

export interface SimInputs {
  // Global Infrastructure
  numTransformers: number;
  transformerKVAs: number[];
  powerFactor: number;
  buffer: number;
  sanctionedLoad: number; // Manual override field

  // Dynamic Arrays replacing static 3kW/5kW logic
  flatTiers: FlatTier[];
  commonMeters: CommonMeter[];
}

// ==========================================
// 2. ENGINE OUTPUT SCHEMA
// ==========================================

export interface SimResults {
  // Global Metrics
  totalFlats: number;
  totalKVA: number;
  usableKW: number;
  baseMaxDemand: number;
  baseActualDemand: number;
  spareCapacityKW: number;
  
  // Scenario A Outputs
  totalEVUsers33: number;
  evActualDemand33: number;
  totalSystemLoad33: number;
  capacityUsed33Pct: number;
  maxConcurrentUsers33: number;

  // Scenario B Outputs
  totalEVUsers74: number;
  evActualDemand74: number;
  totalSystemLoad74: number;
  capacityUsed74Pct: number;
  maxConcurrentUsers74: number;
}

// ==========================================
// 3. CORE MATHEMATICAL ENGINE
// ==========================================

export function calculateHeadroom(inputs: SimInputs): SimResults {
  
  // ---------------------------------------------------------
  // A. TRANSFORMER USABLE CAPACITY
  // Usable kW = sum(kVA) * PF * (1 - Buffer%)
  // ---------------------------------------------------------
  const totalKVA = inputs.transformerKVAs.reduce((sum, val) => sum + (val || 0), 0);
  const usableKW = totalKVA * inputs.powerFactor * (1 - inputs.buffer / 100);

  // ---------------------------------------------------------
  // B. BASELINE APARTMENT DEMAND
  // ---------------------------------------------------------
  
  // 1. Calculate total flats and total flat load dynamically
  const totalFlats = inputs.flatTiers.reduce((sum, tier) => sum + (tier.count || 0), 0);
  const flatLoad = inputs.flatTiers.reduce((sum, tier) => sum + ((tier.count || 0) * (tier.sanctionedLoad || 0)), 0);
  
  // 2. Calculate total common load dynamically
  const commonTotalLoad = inputs.commonMeters.reduce((sum, meter) => sum + (meter.load || 0), 0);
  
  // 3. Determine Base Demand (Manual Override vs Calculated)
  const baseMaxDemand = inputs.sanctionedLoad > 0 
    ? inputs.sanctionedLoad 
    : (flatLoad + commonTotalLoad);
    
  // Proprietary Diversity Factor: 0.5 for residential apartments
  const baseActualDemand = baseMaxDemand * 0.5;
  const spareCapacityKW = Math.max(0, usableKW - baseActualDemand);

  // ---------------------------------------------------------
  // C. SCENARIO A: 3.3 kW ARCHITECTURE
  // ---------------------------------------------------------
  
  const totalEVUsers33 = inputs.flatTiers.reduce((sum, tier) => sum + (tier.ev33 || 0), 0);

  // Proprietary Diversity Factor: 0.7 for EV Load Enhancement
  const evActualDemand33 = inputs.flatTiers.reduce((sum, tier) => {
    return sum + ((tier.ev33 || 0) * (tier.enh33 || 0) * 0.7);
  }, 0);
  
  const totalSystemLoad33 = baseActualDemand + evActualDemand33;
  const capacityUsed33Pct = usableKW > 0 ? (totalSystemLoad33 / usableKW) * 100 : 0;
  
  // Calculate max users before tripping (Weighted Average Enhancement)
  const weightedEnh33 = totalEVUsers33 > 0 
    ? inputs.flatTiers.reduce((sum, t) => sum + ((t.enh33 || 0) * (t.ev33 || 0)), 0) / totalEVUsers33 
    : 2; // Fallback to 2kW if no users entered yet
    
  const maxConcurrentUsers33 = weightedEnh33 > 0 
    ? Math.floor(spareCapacityKW / (weightedEnh33 * 0.7)) 
    : 0;

  // ---------------------------------------------------------
  // D. SCENARIO B: 7.4 kW ARCHITECTURE
  // ---------------------------------------------------------
  
  const totalEVUsers74 = inputs.flatTiers.reduce((sum, tier) => sum + (tier.ev74 || 0), 0);

  const evActualDemand74 = inputs.flatTiers.reduce((sum, tier) => {
    return sum + ((tier.ev74 || 0) * (tier.enh74 || 0) * 0.7);
  }, 0);

  const totalSystemLoad74 = baseActualDemand + evActualDemand74;
  const capacityUsed74Pct = usableKW > 0 ? (totalSystemLoad74 / usableKW) * 100 : 0;

  // Calculate max users before tripping (Weighted Average Enhancement)
  const weightedEnh74 = totalEVUsers74 > 0 
    ? inputs.flatTiers.reduce((sum, t) => sum + ((t.enh74 || 0) * (t.ev74 || 0)), 0) / totalEVUsers74 
    : 7; // Fallback to 7kW if no users entered yet
    
  const maxConcurrentUsers74 = weightedEnh74 > 0 
    ? Math.floor(spareCapacityKW / (weightedEnh74 * 0.7)) 
    : 0;

  // ---------------------------------------------------------
  // E. EXPORT MANIFEST
  // ---------------------------------------------------------
  return {
    totalFlats,
    totalKVA,
    usableKW,
    baseMaxDemand,
    baseActualDemand,
    spareCapacityKW,
    
    totalEVUsers33,
    evActualDemand33,
    totalSystemLoad33,
    capacityUsed33Pct,
    maxConcurrentUsers33,
    
    totalEVUsers74,
    evActualDemand74,
    totalSystemLoad74,
    capacityUsed74Pct,
    maxConcurrentUsers74
  };
}