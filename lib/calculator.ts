export interface SimInputs {
  numTransformers: number;
  transformerKVAs: number[];
  powerFactor: number;
  buffer: number;
  sanctionedLoad: number;
  flats3kw: number;
  flats5kw: number;
  commonMeters: number;
  commonLoad: number;
  bg3noev: number;
  bg3ev: number;
  bg5noev: number;
  bg5ev: number;
  enh33_3kw: number;
  ev33_3kw: number;
  enh33_5kw: number;
  ev33_5kw: number;
  enh74_3kw: number;
  ev74_3kw: number;
  enh74_5kw: number;
  ev74_5kw: number;
}

export interface SimResults {
  totalKVA: number;
  usable: number;
  connected: number;
  divBase: number;
  bescom: number;
  total33: number;
  peak33: number;
  tfpct33: number;
  headroom33: number;
  maxExtra33: number;
  total74: number;
  peak74: number;
  tfpct74: number;
  headroom74: number;
  maxExtra74: number;
}

export function calculateHeadroom(inputs: SimInputs): SimResults {
  const totalKVA = inputs.transformerKVAs.reduce((sum, val) => sum + val, 0);
  const usable = totalKVA * inputs.powerFactor * (1 - inputs.buffer / 100);

  // If user entered a manual overarching sanctioned load, use it; otherwise compute from units
  const connected = inputs.sanctionedLoad > 0 
    ? inputs.sanctionedLoad 
    : (inputs.flats3kw * 3) + (inputs.flats5kw * 5);

  const totalFlats = inputs.flats3kw + inputs.flats5kw;
  
  // Diversity factor curve logic
  let divBase = 2.0;
  if (totalFlats > 100) divBase = 3.2;
  else if (totalFlats > 50) divBase = 2.8;
  else if (totalFlats > 20) divBase = 2.4;

  const commonLoadSum = inputs.commonMeters * inputs.commonLoad;
  const baselineDemandkW = divBase > 0 ? (connected / divBase) + commonLoadSum : commonLoadSum;
  const bescom = usable > 0 ? (baselineDemandkW / usable) * 100 : 0;

  // SCENARIO A: 3.3 kW Calculations with Load Enhancement additions
  const evTotalUsers33 = inputs.ev33_3kw + inputs.ev33_5kw;
  // Background loads + charger drawing limits + user designated extra load enhancements
  const load33_3kw = inputs.ev33_3kw * (3.3 + inputs.bg3ev + inputs.enh33_3kw);
  const load33_5kw = inputs.ev33_5kw * (3.3 + inputs.bg5ev + inputs.enh33_5kw);
  const bgRemain33 = ((inputs.flats3kw - inputs.ev33_3kw) * inputs.bg3noev) + ((inputs.flats5kw - inputs.ev33_5kw) * inputs.bg5noev);
  const total33 = load33_3kw + load33_5kw + bgRemain33 + commonLoadSum;
  
  const tfpct33 = usable > 0 ? (total33 / usable) * 100 : 0;
  const peak33 = tfpct33;
  const headroom33 = Math.max(0, usable - total33);

  // Maximum Concurrent Users calculation loop
  let maxExtra33 = 0;
  for (let n = 1; n <= 500; n++) {
    const share3 = evTotalUsers33 > 0 ? (inputs.ev33_3kw / evTotalUsers33) : 0.5;
    const share5 = evTotalUsers33 > 0 ? (inputs.ev33_5kw / evTotalUsers33) : 0.5;
    const currentSimLoad = (n * share3 * (3.3 + inputs.bg3ev + inputs.enh33_3kw)) + 
                           (n * share5 * (3.3 + inputs.bg5ev + inputs.enh33_5kw)) + 
                           (((inputs.flats3kw - (n * share3)) * inputs.bg3noev)) +
                           (((inputs.flats5kw - (n * share5)) * inputs.bg5noev)) + commonLoadSum;
    if (currentSimLoad > usable) {
      maxExtra33 = n - 1;
      break;
    }
    maxExtra33 = n;
  }

  // SCENARIO B: 7.4 kW Calculations with Load Enhancement additions
  const evTotalUsers74 = inputs.ev74_3kw + inputs.ev74_5kw;
  const load74_3kw = inputs.ev74_3kw * (7.4 + inputs.bg3ev + inputs.enh74_3kw);
  const load74_5kw = inputs.ev74_5kw * (7.4 + inputs.bg5ev + inputs.enh74_5kw);
  const bgRemain74 = ((inputs.flats3kw - inputs.ev74_3kw) * inputs.bg3noev) + ((inputs.flats5kw - inputs.ev74_5kw) * inputs.bg5noev);
  const total74 = load74_3kw + load74_5kw + bgRemain74 + commonLoadSum;

  const tfpct74 = usable > 0 ? (total74 / usable) * 100 : 0;
  const peak74 = tfpct74;
  const headroom74 = Math.max(0, usable - total74);

  let maxExtra74 = 0;
  for (let n = 1; n <= 500; n++) {
    const share3 = evTotalUsers74 > 0 ? (inputs.ev74_3kw / evTotalUsers74) : 0.5;
    const share5 = evTotalUsers74 > 0 ? (inputs.ev74_5kw / evTotalUsers74) : 0.5;
    const currentSimLoad = (n * share3 * (7.4 + inputs.bg3ev + inputs.enh74_3kw)) + 
                           (n * share5 * (7.4 + inputs.bg5ev + inputs.enh74_5kw)) + 
                           (((inputs.flats3kw - (n * share3)) * inputs.bg3noev)) +
                           (((inputs.flats5kw - (n * share5)) * inputs.bg5noev)) + commonLoadSum;
    if (currentSimLoad > usable) {
      maxExtra74 = n - 1;
      break;
    }
    maxExtra74 = n;
  }

  return {
    totalKVA, usable, connected, divBase, bescom,
    total33, peak33, tfpct33, headroom33, maxExtra33: Math.max(0, maxExtra33),
    total74, peak74, tfpct74, headroom74, maxExtra74: Math.max(0, maxExtra74)
  };
}