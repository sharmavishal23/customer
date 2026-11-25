# Airflo — Consignee Track & Trace Portal (UI prototype)

Clickable Next.js prototype of a track & trace portal for **consignees** (the companies receiving cargo that Airflo forwards from Amsterdam), built for the commercial review.
All data is mock data (`src/lib/data.ts`); APIs (CargoWise, FlightRadar24, trucking updates) are to be wired in later.

## Demo flow (≈10 minutes)

Sample persona: **Sanne de Vries**, Regional Logistics Manager at **Nordhaven Latin America** — a consignee group receiving parts from European suppliers at four sites (São Paulo, Mexico City, Bogotá, Santiago).

1. **Landing page** (`/`) — "Know exactly when your cargo lands." Point out arrival alerts, customs-ready documents, Latin America focus. Type `074-12345675` in the hero box → **public tracking** without login.
2. **Log in** — click *Log in* → *Fill demo login* → *Log in* → *Fill code* → *Verify*. (Shows the two-step login a customer would get.)
3. **Dashboard** — *Next arrivals* strip (local time at each site). Click through:
   - **5006** in flight to São Paulo: live aircraft position, 14 min late departure but on time ETA.
   - **5007** at transit hub São Paulo, connecting to Santiago.
   - **5010** offloaded & rebooked: red alert, old flight struck through — "no action needed".
4. **Shipment journey** — each milestone shows planned vs actual and its source (trucking partner, airline handling, live flight data). The box at the bottom explains the next step: documents go to the customs broker automatically.
5. **Shipments** (`/shipments`) — filter by site or supplier, sort, export CSV. Open **5009** (arrived Mexico City) → arrival notice is in the documents.
6. **Documents** — select a few → *Send to customs broker*.
7. **Notifications** — bell dropdown, then the inbox; switch to *Preferences* to show email/WhatsApp per event, digest, quiet hours, extra recipients (e.g. the broker).
8. **Reports** — inbound weight per month, on-time arrival vs 90% target, volume by site and by supplier, lane table.
9. **Profile** — receiving sites with customs brokers and auto-send toggle; team per site. *Edit profile* to show it's editable.
10. **Sign out** (account menu) → back on the login page.

Tip: "Reset demo profile" on the Edit profile page restores the sample data after people have clicked around.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## Pages

### Public & sign-in

| Page | Route | What it does |
| --- | --- | --- |
| Landing page | `/` | Product website: hero with AWB search, features, milestones, how it works, destinations (LatAm), FAQ |
| Log in | `/login` | Email + password, then a 6-digit verification code; "keep me logged in" |
| Forgot password | `/forgot-password` | Request reset link → choose new password (with strength rules) |
| Request access | `/request-access` | Sign-up request for existing and new customers |

**Demo login:** `sanne.devries@nordhaven.example` / `airflo2026`, then any 6-digit code (the login page has "Fill" buttons).
All portal pages require login; logged-out visitors are sent to `/login` and returned to the page they wanted afterwards.

### Customer portal (after login)

| Page | Route | What it does |
| --- | --- | --- |
| Track & Trace | `/dashboard` | Dashboard: status tiles, active shipments, live route map, milestone timeline, details, documents |
| Shipments | `/shipments` | All shipments: search, status/destination/period filters, sorting, pagination, CSV export |
| Shipment detail | `/shipments/[id]` | Full detail page per shipment (pre-rendered for every shipment) |
| Documents | `/documents` | All documents across shipments: type filters, search, preview, (bulk) download |
| Reports | `/reports` | KPIs, chargeable weight per month, on-time arrival trend, volume by destination, punctuality, lane table, export |
| Notifications | `/notifications` | Update inbox (read/unread, filters, mark all read) + preferences: channels per event, digest, quiet hours, extra recipients |
| Profile | `/profile` | Contact & company details, notification summary, team members, Airflo contacts, security |
| Edit profile | `/profile/edit` | Validated form + change password; changes persist in the browser and update the whole portal |
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

Sample data: 8 active inbound shipments plus ~60 generated historical shipments (Aug–Nov 2026), from 5 European suppliers to 4 receiving sites. "Now" is fixed at 25 Nov 2026 10:00 UTC so the demo always looks the same.

## Structure

- `src/app/*` — one folder per page (see table above)
- `src/components/AppShell.tsx` — headers (website & portal), navigation, notification bell, account menu, login guard
- `src/components/AuthLayout.tsx` — split-screen layout for login / sign-up pages
- `src/components/shipment.tsx` — shared shipment UI (timeline, details, documents, status pills…)
- `src/lib/store.tsx` — login session, profile, language and notification state (saved in the browser)
- `src/components/RouteMap.tsx` — SVG world map (d3-geo + world-atlas), great-circle route, live aircraft position
- `src/lib/data.ts` — mock shipments & milestones (shape mirrors the requirements)
- `src/lib/i18n.ts` — English / Spanish labels
