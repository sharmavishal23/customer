"use client";

import { useMemo } from "react";
import { geoInterpolate, geoMercator, geoPath, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";
import { AIRPORTS, type Shipment, routeProgress } from "@/lib/data";

const W = 800;
const H = 340;

const land = feature(
  world as unknown as Topology,
  (world as unknown as Topology).objects.countries as GeometryCollection,
) as unknown as FeatureCollection<Geometry>;

export default function RouteMap({ shipment }: { shipment: Shipment }) {
  const stops = [shipment.origin, shipment.via, shipment.destination].filter(Boolean) as string[];
  const coords = stops.map((c) => AIRPORTS[c].coords);

  const model = useMemo(() => {
    // Frame the route with generous padding so short routes don't over-zoom.
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const pad = 18;
    const frame: [number, number][] = [
      [Math.min(...lons) - pad, Math.max(-60, Math.min(...lats) - pad * 0.7)],
      [Math.max(...lons) + pad, Math.min(78, Math.max(...lats) + pad * 0.7)],
    ];
    // Include great-circle midpoints so arcs that bow north stay in view.
    const extra: [number, number][] = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const ip = geoInterpolate(coords[i], coords[i + 1]);
      for (const t of [0.25, 0.5, 0.75]) extra.push(ip(t) as [number, number]);
    }
    const projection = geoMercator().fitExtent(
      [
        [24, 24],
        [W - 24, H - 24],
      ],
      { type: "MultiPoint", coordinates: [...frame, ...coords, ...extra] },
    );
    const path = geoPath(projection);

    const legs = coords.slice(0, -1).map((c, i) => ({ type: "LineString" as const, coordinates: [c, coords[i + 1]] }));
    const legLen = legs.map((l) => geoDistance(l.coordinates[0], l.coordinates[1]));
    const total = legLen.reduce((a, b) => a + b, 0);

    // Locate the aircraft along the (possibly multi-leg) route.
    let p = routeProgress(shipment);
    if (shipment.status === "at_transit" && shipment.via) p = legLen[0] / total;
    let travelled = p * total;
    let legIdx = 0;
    while (legIdx < legs.length - 1 && travelled > legLen[legIdx]) {
      travelled -= legLen[legIdx];
      legIdx++;
    }
    const t = legLen[legIdx] ? Math.min(1, travelled / legLen[legIdx]) : 0;
    const ip = geoInterpolate(legs[legIdx].coordinates[0], legs[legIdx].coordinates[1]);
    const here = projection(ip(t) as [number, number])!;
    const ahead = projection(ip(Math.min(1, t + 0.01)) as [number, number])!;
    const behind = projection(ip(Math.max(0, t - 0.01)) as [number, number])!;
    const angle = (Math.atan2(ahead[1] - behind[1], ahead[0] - behind[0]) * 180) / Math.PI;

    // Flown portion for the solid overlay line.
    const flown: [number, number][] = [];
    for (let i = 0; i < legIdx; i++) flown.push(...(legs[i].coordinates as [number, number][]));
    const steps = 40;
    for (let k = 0; k <= steps; k++) flown.push(ip((t * k) / steps) as [number, number]);

    return {
      path,
      projection,
      legs: legs.map((l) => path(l) ?? ""),
      flown: p > 0 ? (path({ type: "LineString", coordinates: flown }) ?? "") : "",
      plane: { x: here[0], y: here[1], angle },
      progress: p,
      countries: land.features.map((f, i) => ({ d: path(f) ?? "", key: i })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment.id]);

  const showPlane = shipment.status === "in_flight" || shipment.status === "at_transit";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label={`Route ${stops.join(" to ")}`}>
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef4fb" />
          <stop offset="1" stopColor="#e4edf8" />
        </linearGradient>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#d6e2f0" />
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#sea)" />
      <rect width={W} height={H} fill="url(#grid)" />
      <g>
        {model.countries.map((c) => (
          <path key={c.key} d={c.d} fill="#dbe3ec" stroke="#f8fafc" strokeWidth={0.6} />
        ))}
      </g>

      {model.legs.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2563eb" strokeOpacity={0.45} strokeWidth={2} strokeDasharray="6 6" className="route-dash" />
      ))}
      {model.flown && <path d={model.flown} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />}

      {stops.map((code, i) => {
        const [x, y] = model.projection(AIRPORTS[code].coords)!;
        const isEnd = i === stops.length - 1;
        const isVia = code === shipment.via;
        const reached = i === 0 || (isVia && model.progress >= 0.5) || (isEnd && model.progress >= 1);
        const labelLeft = x > W * 0.7;
        return (
          <g key={code}>
            {isEnd && shipment.status !== "arrived" && <circle cx={x} cy={y} r={6} fill="#2563eb" className="ping-soft" />}
            <circle cx={x} cy={y} r={isVia ? 4.5 : 6} fill={reached ? "#2563eb" : "#fff"} stroke="#2563eb" strokeWidth={2.5} />
            <g transform={`translate(${labelLeft ? x - 12 : x + 12}, ${y - 34})`} filter="url(#shadow)">
              <rect x={labelLeft ? -104 : 0} width={104} height={38} rx={8} fill="#fff" />
              <text x={labelLeft ? -94 : 10} y={16} fontSize={12} fontWeight={700} fill="#0f172a">
                {code}
                {isVia && <tspan fontWeight={500} fill="#64748b" fontSize={10}>{"  · transit"}</tspan>}
              </text>
              <text x={labelLeft ? -94 : 10} y={30} fontSize={10.5} fill="#64748b">
                {AIRPORTS[code].city}
              </text>
            </g>
          </g>
        );
      })}

      {showPlane && (
        <g transform={`translate(${model.plane.x}, ${model.plane.y}) rotate(${model.plane.angle})`} filter="url(#shadow)">
          <circle r={15} fill="#fff" />
          {/* plane glyph pointing to +x */}
          <path
            d="M9 0 L3 -1.6 L-1 -8 L-3.2 -8 L-1 -1.6 L-5.5 -1.4 L-7.5 -4 L-9 -4 L-7.8 0 L-9 4 L-7.5 4 L-5.5 1.4 L-1 1.6 L-3.2 8 L-1 8 L3 1.6 Z"
            fill="#2563eb"
          />
        </g>
      )}
    </svg>
  );
}
