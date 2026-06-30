# MPI Cost Cockpit — Slide Design Brief

A design handover for iterating the **overview deck** (2 slides). It contains everything
needed to redesign the visuals without touching the product: purpose, audience, brand
tokens, assets, and a slide-by-slide content spec. Treat the current `slide-1.png` /
`slide-2.png` as **v0 reference**, not a constraint — feel free to rethink layout,
hierarchy, and motion.

---

## 1. Purpose & audience

- **What the deck is:** a 1–2 slide explainer for the **MPI Cost Cockpit** — a zero-based
  budgeting / cost-out tool for a fleet of gas-CCGT power plants.
- **Audience:** executives / finance leadership and prospective internal users. They should
  grasp *what it is, what it does, and that it has AI* in ~60 seconds of looking.
- **Use:** dropped into a larger pitch/handover deck, and exported as PNG. Could also become
  an animated build later.
- **Tone:** confident, precise, "analyst-grade." Dense but legible. Not playful.

## 2. Format & constraints

- **Canvas:** 1920 × 1080 (16:9), exported @2x.
- **Theme:** dark (matches the product). Light variant optional if a printed version is needed.
- **Data is illustrative** and plant identities are **anonymised to Asset 1 / Asset 2 / Asset 3** —
  keep it that way in any screenshot or mock.
- Keep it to **2 slides** unless a third genuinely helps (e.g. splitting "capabilities" from "AI").

## 3. Brand tokens (from the product, `src/index.css`)

| Token | Hex | Use |
|---|---|---|
| bg | `#060a09` | slide background (with a faint teal radial top-left) |
| panel | `#0c1311` / panel-2 `#0f1815` | cards, callout boxes |
| border | `rgba(125,180,168,.16)` | hairlines |
| **teal** | `#2DD4BF` / bright `#5EEAD4` | primary accent, "best", pins, highlights |
| gold | `#E8B339` | the "gap" / money-at-stake |
| green | `#34D399` | best-in-fleet positive |
| red | `#F8716A` | the gap / over-benchmark |
| blue | `#5B9BF5` | external market band |
| amber | `#E0A93B` | warnings / YoY increases |
| text | `#DDE7E4` | body |
| muted | `#6E7E79` / `#4d5a56` | secondary text, mono labels |

- **Type:** **Inter** (400/600/700/800) for display & body; **mono** (ui-monospace / JetBrains
  Mono / Menlo) for kickers, labels, code-ish tags, numbers in tables.
- **Motifs:** rounded 12–16px cards; thin teal hairlines; small mono "kicker" labels in caps with
  wide letter-spacing; a glowing teal square as the brand glyph; number values in gold/teal.

## 4. Assets in this folder

| File | What it is |
|---|---|
| `deck.html` | **Editable source** of the current v0 deck (self-contained HTML/CSS; two `.slide` divs). |
| `slide-1.png`, `slide-2.png` | Rendered v0 slides (@2x). |
| `shot-cross.png` | Clean app screenshot — **cross-asset cockpit** (hero). Shows cards, dial, heatmap, owners, copilot. |
| `shot-l3l4.png` | **L3–L4 drill** — 2025 vs 2026, Δ vs '25, owners, gap. |
| `shot-l5.png` | **L5 should-cost** — Qty × Freq × Rate × FX driver lines, budget codes. |
| `shot-board.png` | **Board pack** — exec PDF view. |

To re-render after editing `deck.html`: open it at 1920×1080 and screenshot each `.slide`
(the repo's `demo/tooling` has a headless-Chromium setup that does exactly this).

## 5. Slide-by-slide content spec

> Copy below is approved messaging — reword lightly for fit, keep the meaning and the numbers.

### Slide 1 — "What it is" (annotated snapshot)
- **Kicker:** ZERO-BASED BUDGETING · COST-OUT STRESS-TEST
- **Title:** "Benchmark every plant's controllable O&M to **best-in-fleet**, quantify the
  **gap to best**, and challenge it — line by line." (teal = best-in-fleet, gold = gap to best)
- **Subtitle:** "One cockpit for the 2026 O&M budget across a gas-CCGT fleet: where the money
  sits, how far each plant is from the best, and how much is freed by closing the gap.
  Numbers illustrative; plant names anonymised."
- **Visual:** the `shot-cross.png` snapshot with **5 numbered callouts**:
  1. **Benchmark heatmap ($/kW-yr)** — every cost line × plant, coloured vs fleet best.
  2. **Value-at-stake dial** — ambition slider; internal (match best plant) vs external (market band).
  3. **External market band** — top-quartile reference range per line.
  4. **Accountable owners** — a named owner per cost line.
  5. **AI Cost Copilot** — recommended challenges + grounded chat.
- **Plus:** a small highlight on **Like-for-like / size-normalized** benchmarking.
- **Design intent to improve:** the callout pins ↔ legend pairing could be stronger (connector
  lines, or zoom-insets of each feature instead of pins on a shrunk screenshot). The hero
  screenshot is portrait and gets cropped — consider device-framed crops or feature insets.

### Slide 2 — "Capabilities & AI"
- **Kicker:** CAPABILITIES & AI
- **Title:** "From fleet benchmark to a **board-ready pack** — drill, challenge, and decide at
  budget granularity."
- **The flow (5 steps):** 01 Cross-asset → 02 L3–L4 drill → 03 L5 should-cost → 04 Challenge → 05 Board pack
  (one line each — see `deck.html` for the copy).
- **Two screenshots:** `shot-l5.png` ("L5 should-cost — driver-based, bottom-up, tied to budget
  codes") and `shot-board.png` ("Board pack — exec-ready, exports to PDF").
- **Three cards:** AI Cost Copilot · Shared & backed (Supabase, audit log, Vercel) · Defensible
  benchmarks (best-in-fleet, size-normalized, should-cost, external band, owners).
- **Footer:** "Live on Vercel · React + Supabase · AI by Claude (claude-opus-4-8)".

## 6. Must-keep messages (don't lose these in a redesign)
1. It's a **benchmark → gap-to-best → challenge** workflow, at **line-level granularity (L3→L5)**.
2. **Two targets:** internal (best-in-fleet) and external (market band).
3. **Governance:** every line has an **accountable owner**.
4. **AI Copilot is grounded** in the real numbers (it doesn't invent figures).
5. **Board-ready output** in one click.

## 7. Open design questions (good candidates to iterate)
- Pins-on-screenshot vs. **feature insets / zoom crops** vs. an **isometric device mock**?
- Is the cross-asset hero the best single image, or lead with the **heatmap close-up**?
- Should "AI" get its **own slide** (a 3rd slide) given it's a differentiator?
- Light/print variant for leave-behinds?
- Add a one-line **outcome metric** (e.g., "Rp 36.6 Bn fleet gap identified") as a hero stat?
