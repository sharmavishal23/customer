# Airflo — Customer Track & Trace Portal (UI prototype)

Clickable Next.js prototype of a customer-facing track & trace portal, built for the commercial review.
All data is mock data (`src/lib/data.ts`); APIs (CargoWise, FlightRadar24, trucking updates) are to be wired in later.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## Pages

| Page | Route | What it does |
| --- | --- | --- |
| Track & Trace | `/` | Dashboard: status tiles, active shipments, live route map, milestone timeline, details, documents |
| Shipments | `/shipments` | All shipments: search, status/destination/period filters, sorting, pagination, CSV export |
| Shipment detail | `/shipments/[id]` | Full detail page per shipment (pre-rendered for every shipment) |
| Documents | `/documents` | All documents across shipments: type filters, search, preview, (bulk) download |
| Reports | `/reports` | KPIs, chargeable weight per month, on-time arrival trend, volume by destination, punctuality, lane table, export |
| Notifications | `/notifications` | Update inbox (read/unread, filters, mark all read) + preferences: channels per event, digest, quiet hours, extra recipients |
| Profile | `/profile` | Contact & company details, notification summary, team members, Airflo contacts, security |
| Edit profile | `/profile/edit` | Validated form; changes persist in the browser and update the whole portal |
| Public tracking | `/track` | No-login tracking for up to 5 AWBs, with sample AWBs to try |

The header has AWB/shipment search, an EN/ES language switch, a notification bell with dropdown, and an account menu.

## Requirements coverage

| Requirement (from the brief) | Where in the UI |
| --- | --- |
| Pick-up time at customer | Journey timeline · source "Trucking partner" |
| ETD / ATD, ETA / ATA | Route header (planned vs actual, delay chip), timeline, shipment list & table |
| Flight transit | Map (transit hub + aircraft position), timeline step |
| Freight loaded (should have) | Timeline step |
| Shipment offload (should have) | Red alert + timeline exception, old flight struck through, notification |
| Shipper, consignee, actual & chargeable weight, shipment no., AWB | Details card, shipments table, document preview |

Sample data: 8 active shipments plus ~60 generated historical shipments (Aug–Nov 2026). "Now" is fixed at 25 Nov 2026 10:00 UTC so the demo always looks the same.

## Structure

- `src/app/*` — one folder per page (see table above)
- `src/components/AppShell.tsx` — header, navigation, notification bell, account menu
- `src/components/shipment.tsx` — shared shipment UI (timeline, details, documents, status pills…)
- `src/lib/store.tsx` — profile, language and notification state (saved in the browser)
- `src/components/RouteMap.tsx` — SVG world map (d3-geo + world-atlas), great-circle route, live aircraft position
- `src/lib/data.ts` — mock shipments & milestones (shape mirrors the requirements)
- `src/lib/i18n.ts` — English / Spanish labels
