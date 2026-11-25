// Records a narrated, step-by-step demo video of the portal.
//
// Usage:
//   node scripts/record-demo.mjs --base http://localhost:3200 --out ./demo-out \
//        --piper /path/to/piper --voice /path/to/en_US-lessac-high.onnx
//
// Needs: a running build of the site (e.g. `npx serve out`), Playwright + Chromium,
// ffmpeg, and the Piper text-to-speech CLI with a voice model.
// Output: demo.mp4 (voiceover + burned-in captions) and demo.srt in --out.

import { createRequire } from "node:module";
// Playwright may be installed globally (not in package.json), so resolve it with require.
const { chromium } = createRequire(import.meta.url)("playwright");
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3200");
const OUT = path.resolve(arg("out", "./demo-out"));
const PIPER = arg("piper", "piper");
const VOICE = arg("voice");
const W = 1440;
const H = 900;

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Helpers that make actions visible on screen                         */
/* ------------------------------------------------------------------ */

const CURSOR_SCRIPT = `
(() => {
  const make = () => {
    if (document.getElementById('__demo_cursor')) return;
    const c = document.createElement('div');
    c.id = '__demo_cursor';
    c.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(37,99,235,.25);border:2px solid #2563eb;box-shadow:0 2px 8px rgba(15,23,42,.25);transition:transform .12s ease, background .12s ease;';
    let pos = { x: -100, y: -100 };
    try { pos = JSON.parse(sessionStorage.getItem('__demo_pos') || 'null') || pos; } catch {}
    c.style.left = pos.x + 'px'; c.style.top = pos.y + 'px';
    document.body.appendChild(c);
    document.addEventListener('mousemove', (e) => {
      c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
      try { sessionStorage.setItem('__demo_pos', JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {}
    }, true);
    document.addEventListener('mousedown', () => { c.style.transform = 'scale(.7)'; c.style.background = 'rgba(37,99,235,.55)'; }, true);
    document.addEventListener('mouseup', () => { c.style.transform = 'scale(1)'; c.style.background = 'rgba(37,99,235,.25)'; }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', make); else make();
})();`;

let mouse = { x: W / 2, y: H / 2 };

async function moveTo(page, x, y, steps = 28) {
  await page.mouse.move(x, y, { steps });
  mouse = { x, y };
}

async function point(page, locator) {
  const el = typeof locator === "string" ? page.locator(locator).first() : locator;
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box) throw new Error(`No box for ${locator}`);
  await moveTo(page, box.x + box.width / 2, box.y + box.height / 2);
  return el;
}

async function click(page, locator, pause = 350) {
  await point(page, locator);
  await sleep(200);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
  await sleep(pause);
}

async function scrollTo(page, target, offset = 90) {
  await page.evaluate(
    ([t, off]) => {
      const top = typeof t === "number" ? t : (document.querySelector(t)?.getBoundingClientRect().top ?? 0) + window.scrollY - off;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [target, offset],
  );
  await sleep(1100);
}

async function scrollToText(page, text, offset = 110) {
  const el = page.getByText(text, { exact: false }).first();
  const y = await el.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
  await scrollTo(page, y - offset);
}

async function go(page, url) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await sleep(400);
}

/* ------------------------------------------------------------------ */
/* The demo script: narration + actions                                */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    say: "This is the Airflo track and trace portal: a prototype built for the companies that receive cargo through Airflo. Our consignees in Latin America can see exactly when their shipments land, without emailing or calling our export team.",
    caption: "Airflo Track & Trace: built for consignees receiving cargo via Airflo",
    run: async (p) => {
      await go(p, "/");
      await moveTo(p, 380, 330);
    },
  },
  {
    say: "The public website explains what customers get: arrival alerts by email and WhatsApp, live flight tracking, and customs-ready documents that go to their broker automatically.",
    caption: "Arrival alerts · live flight tracking · customs-ready documents",
    run: async (p) => {
      await scrollTo(p, "#features", 70);
      await moveTo(p, 300, 420);
      await sleep(1800);
      await scrollToText(p, "From your supplier", 140);
    },
  },
  {
    say: "Anyone with an air waybill number can track a shipment without logging in. Let's try a sample number.",
    caption: "Public tracking: no login needed",
    run: async (p) => {
      await scrollTo(p, 0);
      await click(p, 'input[aria-label="Air Waybill number"]');
      await p.keyboard.type("074-12345675", { delay: 85 });
      await sleep(300);
      await click(p, 'form button:has-text("Track")', 900);
    },
  },
  {
    say: "The public view shows the route, the live position of the aircraft, and every milestone with its time. Commercial details, like weights and documents, stay behind the login.",
    caption: "Route, live aircraft position and milestones; details stay private",
    run: async (p) => {
      await scrollToText(p, "Air Waybill", 120);
      await moveTo(p, 900, 520);
    },
  },
  {
    say: "Now let's log in as a customer. Sanne is the regional logistics manager at Nordhaven Latin America, which receives parts from European suppliers at four sites.",
    caption: "Customer login",
    run: async (p) => {
      await go(p, "/login");
      await click(p, "text=Fill demo login");
      await click(p, 'button:has-text("Log in")', 1200);
    },
  },
  {
    say: "For extra security, the login has a second step, with a six digit code sent by WhatsApp.",
    caption: "Two-step login with a 6-digit code",
    run: async (p) => {
      await click(p, "text=Fill code");
      await click(p, 'button:has-text("Verify")', 1500);
      await p.waitForURL("**/dashboard/**");
    },
  },
  {
    say: "This is the dashboard. The tiles summarise all shipments by status, and the next arrivals strip shows what lands next at each site, in local time.",
    caption: "Dashboard: status overview and next arrivals in local time",
    run: async (p) => {
      await sleep(400);
      await point(p, 'button:has-text("In transit")');
      await sleep(900);
      await point(p, 'section:has-text("Next arrivals") button:has-text("#5006")');
      await sleep(900);
      await point(p, 'section:has-text("Next arrivals") button:has-text("#5012")');
    },
  },
  {
    say: "Shipment five zero zero six is in the air to Sao Paulo. The map shows the live position of the aircraft. It left Amsterdam fourteen minutes late, but it is still on schedule to land.",
    caption: "Shipment 5006: in flight to São Paulo, live aircraft position",
    run: async (p) => {
      await scrollTo(p, "#detail", 120);
      await point(p, 'text=14 min late');
      await sleep(1200);
      await moveTo(p, 1000, 650);
    },
  },
  {
    say: "The shipment journey covers every milestone from our requirements: collection at the supplier, loaded on the aircraft, departure, and arrival. Each step shows planned versus actual time, and where the information came from.",
    caption: "Milestones: planned vs actual, with the data source for each step",
    run: async (p) => {
      await scrollToText(p, "Shipment journey", 100);
      await point(p, "text=Collected from shipper");
      await sleep(1000);
      await point(p, "text=Trucking partner");
      await sleep(900);
      await point(p, 'text=Live flight data >> nth=1');
    },
  },
  {
    say: "Shipment five zero zero seven is connecting through Sao Paulo to Santiago, so the portal shows the transit hub and the connecting flight.",
    caption: "Shipment 5007: at the transit hub, connecting to Santiago",
    run: async (p) => {
      await scrollTo(p, 0);
      await click(p, 'section:has-text("Next arrivals") button:has-text("#5007")', 1400);
    },
  },
  {
    say: "And when cargo is offloaded, the customer sees it straight away. Shipment five zero one zero was moved to the next flight to Mexico City. The old flight number is crossed out, and the message is clear: no action needed.",
    caption: "Shipment 5010: offloaded and rebooked, with no action needed",
    run: async (p) => {
      await scrollTo(p, 0);
      await click(p, 'section:has-text("Next arrivals") button:has-text("#5010")', 1400);
      await point(p, "text=Offloaded & rebooked");
    },
  },
  {
    say: "The shipments page lists every inbound shipment. Customers can filter by receiving site or by supplier, sort any column, and export the list.",
    caption: "All shipments: filter by site or supplier, sort, export",
    run: async (p) => {
      await go(p, "/shipments");
      await point(p, 'select[aria-label="Receiving site"]');
      await p.selectOption('select[aria-label="Receiving site"]', "MEX");
      await sleep(900);
      await click(p, 'th button:has-text("Chargeable kg")', 900);
      await point(p, 'button:has-text("Export CSV")');
    },
  },
  {
    say: "Let's search for shipment five zero zero nine, which has already arrived. As soon as it lands, the arrival notice and the documents are sent to the customs broker, ready for import clearance.",
    caption: "Arrived: documents sent to the customs broker automatically",
    run: async (p) => {
      await click(p, 'input[placeholder^="Search shipment"]');
      await p.keyboard.type("5009", { delay: 110 });
      await sleep(700);
      await click(p, 'tbody tr:has-text("074-12345702")', 1200);
      await scrollToText(p, "Next step: import customs clearance", 300);
      await point(p, "text=Next step: import customs clearance");
    },
  },
  {
    say: "All documents live in one place: air waybills, invoices, packing lists, certificates of origin and arrival notices. They can be previewed, downloaded, or sent to the customs broker in one click.",
    caption: "Documents: preview, download, or send to the customs broker",
    run: async (p) => {
      await go(p, "/documents");
      await click(p, 'button[aria-label="View"]', 1600);
      await click(p, 'button[aria-label="Close"]', 500);
      await click(p, 'button[aria-label="Select"] >> nth=0', 250);
      await click(p, 'button[aria-label="Select"] >> nth=1', 250);
      await click(p, 'button:has-text("Send to customs broker")', 1200);
    },
  },
  {
    say: "Every update is pushed automatically. The bell shows the latest events, and the notifications page keeps the full history.",
    caption: "Notifications: every milestone pushed automatically",
    run: async (p) => {
      await click(p, 'header button[aria-label="Notifications"]', 1500);
      await click(p, "text=View all", 900);
    },
  },
  {
    say: "Customers choose what they hear about, and how: by email, by WhatsApp, or in the portal. They can also add their warehouse or customs broker as extra recipients.",
    caption: "Preferences: email, WhatsApp or portal, per event",
    run: async (p) => {
      await click(p, 'button:has-text("Preferences")', 700);
      await click(p, 'li:has-text("Pick-up confirmed") button:has-text("WhatsApp")', 700);
      await point(p, "text=Also send updates to");
    },
  },
  {
    say: "The reports page turns all of this into insight: inbound volume per month, on-time arrival against target, and performance per site and per supplier.",
    caption: "Reports: volumes, punctuality, sites and suppliers",
    run: async (p) => {
      await go(p, "/reports");
      await moveTo(p, 620, 560);
      await sleep(1000);
      await scrollToText(p, "Volume by site", 120);
      await moveTo(p, 760, 420);
    },
  },
  {
    say: "In the profile, Sanne manages the receiving sites and customs brokers, chooses which brokers get documents automatically, and sees who on the team has access.",
    caption: "Profile: receiving sites, customs brokers and team",
    run: async (p) => {
      await go(p, "/profile");
      await scrollToText(p, "Receiving sites & customs brokers", 100);
      await click(p, '[role="switch"] >> nth=3', 800);
      await scrollToText(p, "Team members", 120);
    },
  },
  {
    say: "The portal also works in Spanish, for our customers in Latin America.",
    caption: "Available in English and Spanish",
    run: async (p) => {
      await go(p, "/dashboard");
      await click(p, 'button[title="Language"]', 2200);
      await click(p, 'button[title="Language"]', 400);
    },
  },
  {
    say: "Everything you have seen runs on sample data today. Next, we connect CargoWise, live flight data and our trucking partners, to give every Airflo customer real-time visibility, built in house.",
    caption: "Next: connect CargoWise, live flight data and trucking partners",
    run: async (p) => {
      await click(p, 'button[aria-label="Account"]', 600);
      await click(p, "text=Sign out", 1500);
    },
  },
];

/* ------------------------------------------------------------------ */
/* 1. Voiceover                                                        */
/* ------------------------------------------------------------------ */

const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

console.log("Generating voiceover…");
STEPS.forEach((s, i) => {
  s.wav = path.join(OUT, `vo-${String(i).padStart(2, "0")}.wav`);
  const r = spawnSync(PIPER, ["-m", VOICE, "-f", s.wav, "--length-scale", "1.02", "--sentence-silence", "0.25"], { input: s.say });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  s.dur = probe(s.wav);
});

/* ------------------------------------------------------------------ */
/* 2. Screen recording                                                 */
/* ------------------------------------------------------------------ */

console.log("Recording…");
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: OUT, size: { width: W, height: H } } });
await context.addInitScript(CURSOR_SCRIPT);
const page = await context.newPage();
page.setDefaultTimeout(8000);
const t0 = Date.now();
const LEAD = 0.35; // seconds of action before the voice starts

for (const [i, s] of STEPS.entries()) {
  s.start = (Date.now() - t0) / 1000;
  const minEnd = Date.now() + (LEAD + s.dur + 0.6) * 1000;
  try {
    await s.run(page);
  } catch (e) {
    console.warn(`Step ${i} action failed: ${e.message}`);
  }
  const rest = minEnd - Date.now();
  if (rest > 0) await sleep(rest);
  console.log(`  step ${i + 1}/${STEPS.length} at ${s.start.toFixed(1)}s`);
}
await sleep(800);
const total = (Date.now() - t0) / 1000;
const video = await page.video().path();
await context.close();
await browser.close();

/* ------------------------------------------------------------------ */
/* 3. Captions + mux                                                   */
/* ------------------------------------------------------------------ */

const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`;
};

// Full narration as subtitles (sidecar .srt), split into readable chunks.
let srt = "";
let n = 1;
for (const s of STEPS) {
  const sentences = s.say.match(/[^.!?]+[.!?]+/g) ?? [s.say];
  const words = s.say.split(/\s+/).length;
  let t = s.start + LEAD;
  for (const sen of sentences) {
    const d = (sen.split(/\s+/).length / words) * s.dur;
    srt += `${n++}\n${ts(t)} --> ${ts(t + d)}\n${sen.trim()}\n\n`;
    t += d;
  }
}
fs.writeFileSync(path.join(OUT, "demo.srt"), srt);

// Short on-screen step titles (burned in).
let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Step,DejaVu Sans,26,&H00FFFFFF,&H00FFFFFF,&H00000000,&HC0172A0F,1,0,0,0,100,100,0,0,3,14,0,2,80,80,36,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
const assTs = (sec) => {
  const cs = Math.max(0, Math.round(sec * 100));
  return `${Math.floor(cs / 360000)}:${String(Math.floor((cs % 360000) / 6000)).padStart(2, "0")}:${String(Math.floor((cs % 6000) / 100)).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
};
STEPS.forEach((s, i) => {
  const end = i + 1 < STEPS.length ? STEPS[i + 1].start : total;
  ass += `Dialogue: 0,${assTs(s.start + 0.2)},${assTs(end - 0.1)},Step,,0,0,0,,${i + 1}/${STEPS.length}  ·  ${s.caption}\n`;
});
const assFile = path.join(OUT, "steps.ass");
fs.writeFileSync(assFile, ass);

console.log("Mixing video and voiceover…");
const inputs = ["-y", "-i", video];
STEPS.forEach((s) => inputs.push("-i", s.wav));
const delays = STEPS.map((s, i) => `[${i + 1}:a]adelay=${Math.round((s.start + LEAD) * 1000)}:all=1[a${i}]`).join(";");
const mix = `${STEPS.map((_, i) => `[a${i}]`).join("")}amix=inputs=${STEPS.length}:normalize=0:dropout_transition=0,apad=whole_dur=${total.toFixed(2)}[aout]`;
const filter = `${delays};${mix};[0:v]ass='${assFile.replace(/'/g, "\\'")}'[vout]`;
const mp4 = path.join(OUT, "airflo-portal-demo.mp4");
execFileSync(
  "ffmpeg",
  [...inputs, "-filter_complex", filter, "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25", "-c:a", "aac", "-b:a", "160k", "-t", total.toFixed(2), "-movflags", "+faststart", mp4],
  { stdio: "inherit" },
);
console.log(`\nDone: ${mp4} (${total.toFixed(0)}s)`);
