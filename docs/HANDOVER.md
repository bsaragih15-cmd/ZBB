# MPI Cost Cockpit — Handover

A zero-based-budgeting (ZBB) cost-out stress-test tool for a fleet of Indonesian
gas-CCGT power plants. It benchmarks each plant's **controllable O&M (ex-fuel)** on
a **$/kW-yr** basis against the best-in-fleet peer, quantifies the rupiah **gap to
best**, and lets a finance/operations user challenge the budget down to line level —
with an AI copilot grounded in the live numbers and a one-click board pack.

> **Status:** working prototype, deployed and live. All figures are **illustrative**;
> plant identities are **anonymised** to Asset 1 / Asset 2 / Asset 3.

---

## 1. Live + repository

| | |
|---|---|
| **Live app** | Production alias `zbb-git-main-bsaragih15-2327s-projects.vercel.app` (auto-deploys from `main`) |
| **Repo** | `bsaragih15-cmd/ZBB` |
| **Hosting** | Vercel (Git integration; pushes to `main` → production, branches → previews) |
| **Backend** | Supabase project `zbb` (ref `zyjnqhkmtcqlkmejvzxx`) |
| **AI** | Anthropic Claude (`claude-opus-4-8`) via a Vercel serverless function |

---

## 2. What it does (feature map)

1. **Cross-asset cockpit** — every cost line (L3) × every plant as a $/kW-yr heatmap,
   coloured against the fleet's best. Best-in-fleet = green, the gap = red.
2. **Value-at-stake dial** — drag the ambition (capture share of the gap). Shows two
   targets: **internal** (match the best plant) and **external** (reach a market band).
3. **External market band** — an illustrative top-quartile reference *range* per line,
   showing headroom beyond your own best plant.
4. **Like-for-like benchmark** — toggle to size-normalize the gap (economies-of-scale
   elasticity), so the target is defensible for a smaller/larger plant. A comparability
   guard flags near-zero lines likely booked under another block (⚑) and excludes them.
5. **L3–L4 per asset** — drill a plant: each cost block vs the **2025 baseline**, the
   **YoY increase** the 2026 submission carries, the **accountable owner**, gap to best,
   and the L4 driver families.
6. **L5 per asset** — should-cost at line level: **Qty × Freq × Unit-rate × FX**, booked
   vs should-cost, tied to budget codes (and the IPM/SCM packages).
7. **Challenge workspace** — accept / cut / defer each line with a ZBB lever; committed
   savings export as a **write-back CSV** keyed on budget code. CSV upload of real lines
   is supported.
8. **Board pack** — a light, print-optimized exec document (headline, KPIs, cost-out by
   plant, top cost lines + owners, challenge summary). **Export PDF** via the browser
   print dialog.
9. **AI Cost Copilot** — streaming chat grounded in the live cockpit context; recommends
   challenges and drafts the questions each owner must answer. Never invents figures.

The header carries global controls: **benchmark mode** (Absolute / Like-for-like) and
**ambition** (Light 25% / Base 50% / Stretch 100%).

---

## 3. Architecture

```
React 19 + Vite 8 + TypeScript SPA  ──►  Vercel (static dist + serverless /api)
        │                                      │
        ├─ data: Supabase (assets, cost_blocks, fleet_meta, decisions, audit)
        │        fallback → bundled /public/data/*.json
        │
        └─ AI: POST /api/copilot  ──►  Anthropic Claude (streaming, Node runtime)
```

- **Data load** is anonymised at one boundary: `src/data/load.ts` → `loadFleet()` →
  `sanitizeFleet()` maps real codes to Asset 1/2/3 for *every* screen, export, the board
  pack, and the copilot — from either Supabase or the JSON fallback.
- The AI endpoint is a **Node** serverless function (`api/copilot.ts`); the API key is a
  server-only env var and is never shipped to the browser.

### Key files
| Path | Purpose |
|---|---|
| `src/App.tsx` | Shell, nav, global benchmark/ambition state, breadcrumbs |
| `src/data/load.ts` | Fleet load, MEB+DEB merge, **sanitizeFleet** |
| `src/data/remote.ts` | Supabase fetch/upsert |
| `src/data/line-source.ts` | L5 line resolution (uploaded → real → modeled) + CSV parse |
| `src/domain/cockpit-model.ts` | Benchmark math, matrix, value-at-stake, should-cost |
| `src/domain/cost-taxonomy.ts` | Canonical cost-line map + comparability guard |
| `src/domain/external-benchmark.ts` | External market band (range) |
| `src/domain/prior-year.ts` | Modelled 2025 baseline + YoY |
| `src/domain/owners.ts` | Cost-line owners |
| `src/domain/export.ts` | Write-back CSV |
| `src/screens/*` | LandingPage (cross-asset), AssetDrill (L3–L4), DriverWorkspace (L5), ChallengeWorkspace, BoardPack |
| `api/copilot.ts` | Streaming AI endpoint |

---

## 4. Run locally

```bash
npm install
npm run dev          # http://localhost:5173 (uses Supabase if env set, else JSON fallback)
npm run build        # tsc -b && vite build → dist/
npm test             # vitest (63 tests)
npx oxlint src       # lint
```

Without any env vars the app runs entirely on the bundled JSON + localStorage — useful
for offline demos.

### Environment variables
| Var | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | client (build) | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client (build) | publishable key — safe in the bundle; RLS enforced |
| `ANTHROPIC_API_KEY` | **server only** (Vercel) | powers `/api/copilot`; never exposed to the client |

`.env.production` ships the Supabase URL + publishable key; `.env.example` documents all three.

---

## 5. Deploy

Vercel is wired to the repo via Git integration — **push to `main` → production deploy**.
`vercel.json` sets framework `vite`, build `npm run build`, output `dist`. Set
`ANTHROPIC_API_KEY` in Vercel project env (server) for the copilot.

---

## 6. Customisation (no code, or near-zero code)

| Want to change | Where |
|---|---|
| Cost-line owners | `src/domain/owners.ts` (`COST_LINE_OWNERS`) or localStorage override |
| External benchmark band | `src/domain/external-benchmark.ts` (`DEFAULT_EXTERNAL`) |
| 2025 baseline / YoY assumptions | `src/domain/prior-year.ts` (`DEFAULT_YOY`) |
| Real L5 lines per plant | upload CSV in the Challenge tab, or seed `public/data/*.json` / Supabase |
| Plant anonymisation map | `src/data/load.ts` (`SANITIZE`) |

---

## 7. Caveats / things to source before circulation

- **Illustrative data.** Plant names anonymised; external band, 2025 baseline, and cost-line
  owners are placeholders. Replace with real references before sharing externally.
- **Modelled L5 / 2025.** Where real lines aren't loaded, L5 is back-solved from block totals
  (labelled "modeled"); the 2025 baseline is deflated from the 2026 submission by a per-block
  YoY assumption (both years at 2026 FX). Clearly disclosed in-app.
- **Reliability data** (availability / forced-outage) is not yet sourced.
- **Security.** RLS is permissive (anon read/write) per the current decision — tighten before
  putting real data behind it.

---

## 8. Roadmap / parked (high-value next steps)

- **Initiative tracker** — give each challenge a status (idea → committed → in-flight →
  realized) + due date on top of the existing owner; portfolio roll-up.
- **Realization loop** — wire the unused `actuals` table + `realization.ts` into a
  budget → target → actual glide path (does the saving land?).
- **Scenario save & compare** — light up the unused `scenarios` table.
- **Tighten RLS / auth**, source reliability data, real L5 for all plants.

---

## 9. Demo assets

In `demo/`:
- `demo-videos/zbb-cockpit-tour-1080.mp4` (+ `-4k`, `-30s-social`) — silent guided tour.
- `demo-videos/zbb-cockpit-tour-1080-narrated.mp4` (+ `-4k-narrated`) — with ElevenLabs VO.
- `audio/narration-mark.mp3` + `narration-script.md` — voiceover + script (with beat timings).
- `tooling/` — the headless-Chromium tour recorder + static server used to render the videos.
- `slides/` — the overview deck (`deck.html`, `slide-1.png`, `slide-2.png`).
