export interface SimInputs {
  numTransformers: number;
  transformerKVAs: number[];
  powerFactor: number;
  buffer: number;
  
  // Base Infrastructure
  flats3kw: number;
  flats5kw: number;
  commonMeters: number;
  commonLoad: number; // Avg load per common meter
  sanctionedLoad: number; // Manual override field

  // Scenario A: 3.3kW System
  ev33_3kw: number;
  enh33_3kw: number; // e.g., 2kW load enhancement
  ev33_5kw: number;
  enh33_5kw: number; // e.g., 2kW load enhancement

  // Scenario B: 7.4kW System
  ev74_3kw: number;
  enh74_3kw: number; // e.g., 7kW load enhancement
  ev74_5kw: number;
  enh74_5kw: number; // e.g., 7kW load enhancement
}

export interface SimResults {
  totalKVA: number;
  usableKW: number;
  baseMaxDemand: number;
  baseActualDemand: number;
  spareCapacityKW: number;
  
  // Scenario A Outputs
  evActualDemand33: number;
  totalSystemLoad33: number;
  capacityUsed33Pct: number;
  maxConcurrentUsers33: number;

  // Scenario B Outputs
  evActualDemand74: number;
  totalSystemLoad74: number;
  capacityUsed74Pct: number;
  maxConcurrentUsers74: number;
}

export function calculateHeadroom(inputs: SimInputs): SimResults {
  // 1. TRANSFORMER USABLE CAPACITY (Matches Sheet: kVA * PF * Safety Buffer)
  const totalKVA = inputs.transformerKVAs.reduce((sum, val) => sum + val, 0);
  const usableKW = totalKVA * inputs.powerFactor * (1 - inputs.buffer / 100);

  // 2. BASELINE APARTMENT DEMAND
  const flatLoad = (inputs.flats3kw * 3) + (inputs.flats5kw * 5);
  const commonTotalLoad = inputs.commonMeters * inputs.commonLoad;
  
  const baseMaxDemand = inputs.sanctionedLoad > 0 
    ? inputs.sanctionedLoad 
    : (flatLoad + commonTotalLoad);
    
  // Proprietary Diversity Factor: 0.5 for apartments
  const baseActualDemand = baseMaxDemand * 0.5;
  const spareCapacityKW = Math.max(0, usableKW - baseActualDemand);

  // 3. SCENARIO A: 3.3 kW ARCHITECTURE
  // Proprietary Diversity Factor: 0.7 for EV Load Enhancement
  const evDemand33_3kw = inputs.ev33_3kw * inputs.enh33_3kw * 0.7;
  const evDemand33_5kw = inputs.ev33_5kw * inputs.enh33_5kw * 0.7;
  const evActualDemand33 = evDemand33_3kw + evDemand33_5kw;
  
  const totalSystemLoad33 = baseActualDemand + evActualDemand33;
  const capacityUsed33Pct = usableKW > 0 ? (totalSystemLoad33 / usableKW) * 100 : 0;
  
  // Calculate max users before tripping (using the 3kW flat enhancement as baseline reference)
  // Fallback to 2kW if user left enhancement at 0 to prevent Infinity errors
  const avgEnhancementDemand33 = (inputs.enh33_3kw || 2) * 0.7;
  const maxConcurrentUsers33 = avgEnhancementDemand33 > 0 
    ? Math.floor(spareCapacityKW / avgEnhancementDemand33) 
    : 0;

  // 4. SCENARIO B: 7.4 kW ARCHITECTURE
  const evDemand74_3kw = inputs.ev74_3kw * inputs.enh74_3kw * 0.7;
  const evDemand74_5kw = inputs.ev74_5kw * inputs.enh74_5kw * 0.7;
  const evActualDemand74 = evDemand74_3kw + evDemand74_5kw;

  const totalSystemLoad74 = baseActualDemand + evActualDemand74;
  const capacityUsed74Pct = usableKW > 0 ? (totalSystemLoad74 / usableKW) * 100 : 0;

  // Fallback to 7kW if user left enhancement at 0
  const avgEnhancementDemand74 = (inputs.enh74_3kw || 7) * 0.7;
  const maxConcurrentUsers74 = avgEnhancementDemand74 > 0 
    ? Math.floor(spareCapacityKW / avgEnhancementDemand74) 
    : 0;

  return {
    totalKVA,
    usableKW,
    baseMaxDemand,
    baseActualDemand,
    spareCapacityKW,
    evActualDemand33,
    totalSystemLoad33,
    capacityUsed33Pct,
    maxConcurrentUsers33,
    evActualDemand74,
    totalSystemLoad74,
    capacityUsed74Pct,
    maxConcurrentUsers74
  };
}