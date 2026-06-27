/**
 * Nevora FluxEngine - Core Calculation Library
 * Enterprise-grade mathematical engine.
 * Decoupled from Administrative Sanctioned Load. Grounded in Physical Hardware Limits.
 */

export interface FlatTier {
  id: string;
  sanctionedLoad: number;
  count: number;
  bgNoEv: number;
  bgEv: number;
  ev33: number;
  enh33: number;
  ev74: number;
  enh74: number;
}

export interface CommonMeter {
  id: string;
  name: string;
  load: number;
}

export interface SimInputs {
  numTransformers: number;
  transformerKVAs: number[];
  powerFactor: number;
  buffer: number;
  sanctionedLoad: number;
  flatTiers: FlatTier[];
  commonMeters: CommonMeter[];
}

export interface SimResults {
  totalFlats: number;
  totalKVA: number;
  usableKW: number;
  baseMaxDemand: number;
  baseActualDemand: number;
  spareCapacityKW: number;
  baseDiversityFactor: number;
  bescomPeakDemand: number;

  totalEVUsers33: number;
  evActualDemand33: number;
  totalSystemLoad33: number;
  capacityUsed33Pct: number;
  maxConcurrentUsers33: number;

  totalEVUsers74: number;
  evActualDemand74: number;
  totalSystemLoad74: number;
  capacityUsed74Pct: number;
  maxConcurrentUsers74: number;
}

export function calculateHeadroom(inputs: SimInputs): SimResults {
  // ---------------------------------------------------------
  // A. TRANSFORMER USABLE CAPACITY
  // ---------------------------------------------------------
  const totalKVA = inputs.transformerKVAs.reduce((sum, val) => sum + (val || 0), 0);
  const usableKW = totalKVA * inputs.powerFactor * (1 - inputs.buffer / 100);

  // ---------------------------------------------------------
  // B. BASELINE APARTMENT DEMAND & BESCOM METRICS
  // ---------------------------------------------------------
  const totalFlats = inputs.flatTiers.reduce((sum, tier) => sum + (tier.count || 0), 0);
  const flatLoad = inputs.flatTiers.reduce(
    (sum, tier) => sum + (tier.count || 0) * (tier.sanctionedLoad || 0),
    0
  );
  const commonTotalLoad = inputs.commonMeters.reduce(
    (sum, meter) => sum + (meter.load || 0),
    0
  );

  const baseMaxDemand =
    inputs.sanctionedLoad > 0 ? inputs.sanctionedLoad : flatLoad + commonTotalLoad;

  const baseDiversityFactor = usableKW > 0 ? baseMaxDemand / usableKW : 0;
  const bescomPeakDemand = baseDiversityFactor > 0 ? (1 / baseDiversityFactor) * 100 : 0;

  const baseActualDemand =
    inputs.flatTiers.reduce((sum, tier) => {
      return sum + (tier.count || 0) * (tier.bgNoEv || 0);
    }, 0) + commonTotalLoad;

  // Absolute Baseline Headroom (Before any EVs are plugged in)
  const spareCapacityKW = Math.max(0, usableKW - baseActualDemand);

  // ---------------------------------------------------------
  // C. SCENARIO A: 3.3 kW ARCHITECTURE
  // ---------------------------------------------------------
  const totalEVUsers33 = inputs.flatTiers.reduce((sum, tier) => sum + (tier.ev33 || 0), 0);

  // Pure Physical Hardware Draw (3.3 kW)
  const evActualDemand33 = inputs.flatTiers.reduce((sum, tier) => {
    return sum + (tier.ev33 || 0) * 3.3;
  }, 0);

  const bgLoad33 =
    inputs.flatTiers.reduce((sum, tier) => {
      const evs = Math.min(tier.count || 0, tier.ev33 || 0);
      const nonEvs = Math.max(0, (tier.count || 0) - evs);
      return sum + nonEvs * (tier.bgNoEv || 0) + evs * (tier.bgEv || 0);
    }, 0) + commonTotalLoad;

  const totalSystemLoad33 = bgLoad33 + evActualDemand33;
  const capacityUsed33Pct = usableKW > 0 ? (totalSystemLoad33 / usableKW) * 100 : 0;

  const fallbackNet33 =
    inputs.flatTiers.length > 0
      ? 3.3 + (inputs.flatTiers[0].bgEv - inputs.flatTiers[0].bgNoEv)
      : 3.5;

  const weightedNetAdded33 =
    totalEVUsers33 > 0
      ? inputs.flatTiers.reduce((sum, t) => {
          const netAdded = 3.3 + ((t.bgEv || 0) - (t.bgNoEv || 0));
          return sum + netAdded * (t.ev33 || 0);
        }, 0) / totalEVUsers33
      : fallbackNet33;

  // Total Safe EVs = Baseline Headroom / Net Physical Strain
  const maxConcurrentUsers33 =
    weightedNetAdded33 > 0 ? Math.floor(spareCapacityKW / weightedNetAdded33) : 0;

  // ---------------------------------------------------------
  // D. SCENARIO B: 7.4 kW ARCHITECTURE
  // ---------------------------------------------------------
  const totalEVUsers74 = inputs.flatTiers.reduce((sum, tier) => sum + (tier.ev74 || 0), 0);

  // Pure Physical Hardware Draw (7.4 kW)
  const evActualDemand74 = inputs.flatTiers.reduce((sum, tier) => {
    return sum + (tier.ev74 || 0) * 7.4;
  }, 0);

  const bgLoad74 =
    inputs.flatTiers.reduce((sum, tier) => {
      const evs = Math.min(tier.count || 0, tier.ev74 || 0);
      const nonEvs = Math.max(0, (tier.count || 0) - evs);
      return sum + nonEvs * (tier.bgNoEv || 0) + evs * (tier.bgEv || 0);
    }, 0) + commonTotalLoad;

  const totalSystemLoad74 = bgLoad74 + evActualDemand74;
  const capacityUsed74Pct = usableKW > 0 ? (totalSystemLoad74 / usableKW) * 100 : 0;

  const fallbackNet74 =
    inputs.flatTiers.length > 0
      ? 7.4 + (inputs.flatTiers[0].bgEv - inputs.flatTiers[0].bgNoEv)
      : 7.6;

  const weightedNetAdded74 =
    totalEVUsers74 > 0
      ? inputs.flatTiers.reduce((sum, t) => {
          const netAdded = 7.4 + ((t.bgEv || 0) - (t.bgNoEv || 0));
          return sum + netAdded * (t.ev74 || 0);
        }, 0) / totalEVUsers74
      : fallbackNet74;

  const maxConcurrentUsers74 =
    weightedNetAdded74 > 0 ? Math.floor(spareCapacityKW / weightedNetAdded74) : 0;

  return {
    totalFlats,
    totalKVA,
    usableKW,
    baseMaxDemand,
    baseActualDemand,
    spareCapacityKW,
    baseDiversityFactor,
    bescomPeakDemand,

    totalEVUsers33,
    evActualDemand33,
    totalSystemLoad33,
    capacityUsed33Pct,
    maxConcurrentUsers33,

    totalEVUsers74,
    evActualDemand74,
    totalSystemLoad74,
    capacityUsed74Pct,
    maxConcurrentUsers74,
  };
}