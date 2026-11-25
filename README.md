# Airflo — Customer Track & Trace Portal (UI prototype)

Clickable Next.js prototype of a customer-facing track & trace portal, built for the commercial review.
All data is mock data (`src/lib/data.ts`); APIs (CargoWise, FlightRadar24, trucking updates) are to be wired in later.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## What's on the page

| Requirement (from the brief) | Where in the UI |
| --- | --- |
| Pick-up time at customer | Journey timeline · source "Trucking partner" |
| ETD / ATD, ETA / ATA | Route header (planned vs actual, delay chip), timeline, shipment list |
| Flight transit | Map (transit hub + aircraft position), timeline step |
| Freight loaded (should have) | Timeline step |
| Shipment offload (should have) | Red alert + timeline exception, old flight struck through |
| Shipper, consignee, actual & chargeable weight, shipment no., AWB | Shipment details card, list, document preview |

Extras: AWB / shipment search, status filter tiles, documents with preview, notification preferences (email / WhatsApp) with an automatic-updates feed, share-tracking link, EN/ES language toggle (Latin America), responsive layout.

## Structure

- `src/app/page.tsx` — portal page and UI components
- `src/components/RouteMap.tsx` — SVG world map (d3-geo + world-atlas), great-circle route, live aircraft position
- `src/lib/data.ts` — mock shipments & milestones (shape mirrors the requirements)
- `src/lib/i18n.ts` — English / Spanish labels
