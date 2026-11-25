// Mock data for the customer track & trace portal.
// Shape mirrors the requirements: milestones (pick-up, loaded, ETD/ATD, transit,
// ETA/ATA, offload) and shipment data (shipper, consignee, weights, shipment no., AWB).

export const NOW = new Date("2026-11-25T10:00:00Z");

export type Airport = { code: string; city: string; country: string; tz: string; coords: [number, number] };

export const AIRPORTS: Record<string, Airport> = {
  AMS: { code: "AMS", city: "Amsterdam", country: "Netherlands", tz: "Europe/Amsterdam", coords: [4.76, 52.31] },
  HKG: { code: "HKG", city: "Hong Kong", country: "Hong Kong SAR", tz: "Asia/Hong_Kong", coords: [113.91, 22.31] },
  DXB: { code: "DXB", city: "Dubai", country: "UAE", tz: "Asia/Dubai", coords: [55.36, 25.25] },
  SIN: { code: "SIN", city: "Singapore", country: "Singapore", tz: "Asia/Singapore", coords: [103.99, 1.36] },
  GRU: { code: "GRU", city: "São Paulo", country: "Brazil", tz: "America/Sao_Paulo", coords: [-46.47, -23.43] },
  MEX: { code: "MEX", city: "Mexico City", country: "Mexico", tz: "America/Mexico_City", coords: [-99.07, 19.44] },
  PVG: { code: "PVG", city: "Shanghai", country: "China", tz: "Asia/Shanghai", coords: [121.8, 31.14] },
  BOG: { code: "BOG", city: "Bogotá", country: "Colombia", tz: "America/Bogota", coords: [-74.14, 4.7] },
  JFK: { code: "JFK", city: "New York", country: "United States", tz: "America/New_York", coords: [-73.78, 40.64] },
};

export type Status = "booked" | "picked_up" | "in_flight" | "at_transit" | "arrived" | "offloaded";
export type StatusGroup = "all" | "booked" | "transit" | "arrived" | "exception";

export const STATUS_GROUP: Record<Status, Exclude<StatusGroup, "all">> = {
  booked: "booked",
  picked_up: "booked",
  in_flight: "transit",
  at_transit: "transit",
  arrived: "arrived",
  offloaded: "exception",
};

export type MilestoneKey = "pickup" | "loaded" | "departed" | "transit" | "arrived" | "offload";
export type Source = "trucking" | "airline" | "flight" | "booking";

export type Milestone = {
  key: MilestoneKey;
  at: string; // airport code where it happens
  planned?: string; // ISO UTC
  actual?: string; // ISO UTC
  source: Source;
  note?: string;
};

export type Doc = { kind: "awb" | "booking" | "invoice" | "packing" | "pod"; name: string; date: string; size: string };

export type Shipment = {
  id: string;
  awb: string;
  status: Status;
  origin: string;
  destination: string;
  via?: string;
  flights: string[];
  previousFlight?: string;
  shipper: string;
  consignee: string;
  pieces: number;
  actualWeight: number;
  chargeableWeight: number;
  commodity: string;
  reference: string;
  milestones: Milestone[];
  documents: Doc[];
};

const docs = (date: string, withPod = false): Doc[] => [
  { kind: "awb", name: "Air Waybill", date, size: "182 KB" },
  { kind: "booking", name: "Booking confirmation", date, size: "96 KB" },
  { kind: "invoice", name: "Commercial invoice", date, size: "240 KB" },
  { kind: "packing", name: "Packing list", date, size: "88 KB" },
  ...(withPod ? [{ kind: "pod" as const, name: "Proof of delivery", date, size: "310 KB" }] : []),
];

export const CUSTOMER = { name: "Nordhaven Industrial Parts B.V.", contact: "Sanne de Vries", initials: "SV" };

export const SHIPMENTS: Shipment[] = [
  {
    id: "5006",
    awb: "074-12345675",
    status: "in_flight",
    origin: "AMS",
    destination: "HKG",
    flights: ["KL 887"],
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Kowloon Precision Machinery Ltd, Hong Kong",
    pieces: 42,
    actualWeight: 615,
    chargeableWeight: 702,
    commodity: "Hydraulic pump components",
    reference: "PO-88231",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-24T06:00:00Z", actual: "2026-11-24T06:10:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-24T17:00:00Z", actual: "2026-11-24T16:42:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-24T19:20:00Z", actual: "2026-11-24T19:34:00Z", source: "flight" },
      { key: "arrived", at: "HKG", planned: "2026-11-25T13:45:00Z", source: "flight", note: "ETA updated from live flight data" },
    ],
    documents: docs("2026-11-24T08:00:00Z"),
  },
  {
    id: "5007",
    awb: "176-55120384",
    status: "at_transit",
    origin: "AMS",
    destination: "SIN",
    via: "DXB",
    flights: ["EK 148", "EK 354"],
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Orchid Lane Engineering Pte Ltd, Singapore",
    pieces: 28,
    actualWeight: 403,
    chargeableWeight: 455,
    commodity: "Valve assemblies",
    reference: "PO-88207",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-23T08:00:00Z", actual: "2026-11-23T08:05:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-23T18:30:00Z", actual: "2026-11-23T18:12:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-23T21:10:00Z", actual: "2026-11-23T21:25:00Z", source: "flight" },
      { key: "transit", at: "DXB", planned: "2026-11-24T05:35:00Z", actual: "2026-11-24T05:22:00Z", source: "flight", note: "Connecting to EK 354 · departs 25 Nov 17:40 local" },
      { key: "arrived", at: "SIN", planned: "2026-11-26T05:10:00Z", source: "flight" },
    ],
    documents: docs("2026-11-23T09:00:00Z"),
  },
  {
    id: "5008",
    awb: "074-12345691",
    status: "booked",
    origin: "AMS",
    destination: "GRU",
    flights: ["KL 791"],
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Flores Engenharia Industrial Ltda, São Paulo",
    pieces: 35,
    actualWeight: 521,
    chargeableWeight: 521,
    commodity: "Gearbox spare parts",
    reference: "PO-88240",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-26T06:00:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-26T16:00:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-26T20:30:00Z", source: "flight" },
      { key: "arrived", at: "GRU", planned: "2026-11-27T08:30:00Z", source: "flight" },
    ],
    documents: docs("2026-11-24T14:00:00Z").slice(0, 3),
  },
  {
    id: "5009",
    awb: "074-12345702",
    status: "arrived",
    origin: "AMS",
    destination: "MEX",
    flights: ["KL 685"],
    shipper: "Nordhaven Industrial Parts B.V., Eindhoven",
    consignee: "Distribuidora Industrial Jardín SA de CV, Mexico City",
    pieces: 18,
    actualWeight: 260,
    chargeableWeight: 318,
    commodity: "Sensor modules",
    reference: "PO-88190",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-22T07:00:00Z", actual: "2026-11-22T07:20:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-22T13:30:00Z", actual: "2026-11-22T13:10:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-22T16:20:00Z", actual: "2026-11-22T16:31:00Z", source: "flight" },
      { key: "arrived", at: "MEX", planned: "2026-11-23T03:50:00Z", actual: "2026-11-23T03:41:00Z", source: "flight" },
    ],
    documents: docs("2026-11-22T08:00:00Z", true),
  },
  {
    id: "5010",
    awb: "074-12345713",
    status: "offloaded",
    origin: "AMS",
    destination: "PVG",
    flights: ["KL 897"],
    previousFlight: "KL 895",
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Shanghai Huaxin Automation Co., Ltd",
    pieces: 60,
    actualWeight: 1180,
    chargeableWeight: 1240,
    commodity: "Conveyor drive units",
    reference: "PO-88215",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-23T09:00:00Z", actual: "2026-11-23T09:02:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-23T15:00:00Z", actual: "2026-11-23T14:48:00Z", source: "airline" },
      { key: "offload", at: "AMS", actual: "2026-11-23T17:40:00Z", source: "airline", note: "Offloaded from KL 895 due to capacity. Rebooked on KL 897 — no action needed." },
      { key: "departed", at: "AMS", planned: "2026-11-25T18:30:00Z", source: "flight" },
      { key: "arrived", at: "PVG", planned: "2026-11-26T05:30:00Z", source: "flight" },
    ],
    documents: docs("2026-11-23T10:00:00Z"),
  },
  {
    id: "5011",
    awb: "045-90021477",
    status: "arrived",
    origin: "AMS",
    destination: "BOG",
    flights: ["AV 31"],
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Andes Maquinaria SAS, Bogotá",
    pieces: 12,
    actualWeight: 188,
    chargeableWeight: 230,
    commodity: "Bearings & seals",
    reference: "PO-88162",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-20T07:00:00Z", actual: "2026-11-20T06:55:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-20T14:00:00Z", actual: "2026-11-20T13:40:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-20T16:05:00Z", actual: "2026-11-20T16:50:00Z", source: "flight" },
      { key: "arrived", at: "BOG", planned: "2026-11-21T03:05:00Z", actual: "2026-11-21T03:38:00Z", source: "flight" },
    ],
    documents: docs("2026-11-20T08:00:00Z", true),
  },
  {
    id: "5012",
    awb: "006-33418820",
    status: "in_flight",
    origin: "AMS",
    destination: "JFK",
    flights: ["DL 47"],
    shipper: "Nordhaven Industrial Parts B.V., Eindhoven",
    consignee: "Hudson Industrial Supply Inc., New York",
    pieces: 9,
    actualWeight: 142,
    chargeableWeight: 167,
    commodity: "Control panels",
    reference: "PO-88244",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-24T13:00:00Z", actual: "2026-11-24T13:05:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-25T05:00:00Z", actual: "2026-11-25T04:52:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-25T06:55:00Z", actual: "2026-11-25T07:05:00Z", source: "flight" },
      { key: "arrived", at: "JFK", planned: "2026-11-25T15:35:00Z", source: "flight" },
    ],
    documents: docs("2026-11-24T10:00:00Z"),
  },
  {
    id: "5013",
    awb: "160-77210345",
    status: "picked_up",
    origin: "AMS",
    destination: "HKG",
    flights: ["CX 270"],
    shipper: "Nordhaven Industrial Parts B.V., Rotterdam",
    consignee: "Kowloon Precision Machinery Ltd, Hong Kong",
    pieces: 22,
    actualWeight: 336,
    chargeableWeight: 390,
    commodity: "Pump housings",
    reference: "PO-88249",
    milestones: [
      { key: "pickup", at: "AMS", planned: "2026-11-25T07:00:00Z", actual: "2026-11-25T07:12:00Z", source: "trucking" },
      { key: "loaded", at: "AMS", planned: "2026-11-25T15:30:00Z", source: "airline" },
      { key: "departed", at: "AMS", planned: "2026-11-25T19:05:00Z", source: "flight" },
      { key: "arrived", at: "HKG", planned: "2026-11-26T06:50:00Z", source: "flight" },
    ],
    documents: docs("2026-11-24T16:00:00Z").slice(0, 3),
  },
];

// ---------- helpers ----------

export const ms = (s: Shipment, key: MilestoneKey) => s.milestones.find((m) => m.key === key);

export const etd = (s: Shipment) => ms(s, "departed");
export const eta = (s: Shipment) => ms(s, "arrived");

/** 0..1 position of the shipment along its route (for the map). */
export function routeProgress(s: Shipment): number {
  const dep = etd(s);
  const arr = eta(s);
  if (s.status === "arrived") return 1;
  if (!dep?.actual || !arr) return 0;
  if (s.status === "at_transit") return 0.5;
  const start = new Date(dep.actual).getTime();
  const end = new Date(arr.actual ?? arr.planned!).getTime();
  return Math.min(0.98, Math.max(0.02, (NOW.getTime() - start) / (end - start)));
}

/** Delay in minutes between planned and actual (positive = late). */
export function delayMinutes(m?: Milestone): number | null {
  if (!m?.planned || !m.actual) return null;
  return Math.round((new Date(m.actual).getTime() - new Date(m.planned).getTime()) / 60000);
}

export function formatTime(iso: string | undefined, code: string, opts: { date?: boolean } = { date: true }) {
  if (!iso) return "—";
  const tz = AIRPORTS[code]?.tz ?? "UTC";
  const d = new Date(iso);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(d);
  if (!opts.date) return time;
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: tz }).format(d);
  return `${date} ${time}`;
}

export function relative(iso: string) {
  const diff = new Date(iso).getTime() - NOW.getTime();
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 3600000);
  const m = Math.round((abs % 3600000) / 60000);
  const d = Math.floor(h / 24);
  const span = d >= 1 ? `${d}d ${h % 24}h` : h >= 1 ? `${h}h ${m}m` : `${m}m`;
  return diff >= 0 ? `in ${span}` : `${span} ago`;
}
