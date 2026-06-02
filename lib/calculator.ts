export interface SimInputs {
  numTransformers: number;
  transformerKVAs: number[]; // <-- Changed to array
  powerFactor: number;
  buffer: number;
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
  usable: number;
  connected: number;
  divBase: number;
  bescom: number;
  new33_3: number;
  new33_5: number;
  total33: number;
  div33: number;
  peak33: number;
  tfpct33: number;
  headroom33: number;
  maxExtra33: number;
  new74_3: number;
  new74_5: number;
  total74: number;
  div74: number;
  peak74: number;
  tfpct74: number;
  headroom74: number;
  maxExtra74: number;
}

export function calculateHeadroom(inputs: SimInputs): SimResults {
  const {
    transformerKVAs, powerFactor, buffer,
    flats3kw, flats5kw, commonMeters, commonLoad,
    bg3noev, bg3ev, bg5noev, bg5ev,
    enh33_3kw, ev33_3kw, enh33_5kw, ev33_5kw,
    enh74_3kw, ev74_3kw, enh74_5kw, ev74_5kw
  } = inputs;

  // Base: Sum all individual transformer capacities
  const totalKVA = transformerKVAs.reduce((sum, current) => sum + current, 0);
  const usable = totalKVA * powerFactor * (1 - (buffer / 100));
  
  const common = commonMeters * commonLoad;
  const connected = (flats3kw * 3) + (flats5kw * 5) + common;
  const divBase = usable > 0 ? connected / usable : 0;
  const bescom = divBase > 0 ? (1 / divBase) * 100 : 0;

  // 3.3 kW Scenario
  const new33_3 = 3 + enh33_3kw;
  const new33_5 = 5 + enh33_5kw;
  const evLoad33 = (ev33_3kw * (3.3 + bg3ev)) + (ev33_5kw * (3.3 + bg5ev));
  const bgLoad33 = ((flats3kw - ev33_3kw) * bg3noev) + ((flats5kw - ev33_5kw) * bg5noev);
  const total33 = evLoad33 + bgLoad33 + common;
  const div33 = usable > 0 ? total33 / usable : 0;
  const peak33 = div33 > 0 ? (1 / div33) * 100 : 0;
  const tfpct33 = usable > 0 ? (total33 / usable) * 100 : 0;
  const headroom33 = usable - total33;
  const headroomKw33 = usable - bgLoad33 - common;
  const maxExtra33 = Math.max(0, Math.floor(headroomKw33 / (3.3 + bg3ev)));

  // 7.4 kW Scenario
  const new74_3 = 3 + enh74_3kw;
  const new74_5 = 5 + enh74_5kw;
  const evLoad74 = (ev74_3kw * (7.4 + bg3ev)) + (ev74_5kw * (7.4 + bg5ev));
  const bgLoad74 = ((flats3kw - ev74_3kw) * bg3noev) + ((flats5kw - ev74_5kw) * bg5noev);
  const total74 = evLoad74 + bgLoad74 + common;
  const div74 = usable > 0 ? total74 / usable : 0;
  const peak74 = div74 > 0 ? (1 / div74) * 100 : 0;
  const tfpct74 = usable > 0 ? (total74 / usable) * 100 : 0;
  const headroom74 = usable - total74;
  const headroomKw74 = usable - bgLoad74 - common;
  const maxExtra74 = Math.max(0, Math.floor(headroomKw74 / (7.4 + bg3ev)));

  return {
    usable, connected, divBase, bescom,
    new33_3, new33_5, total33, div33, peak33, tfpct33, headroom33, maxExtra33,
    new74_3, new74_5, total74, div74, peak74, tfpct74, headroom74, maxExtra74
  };
}