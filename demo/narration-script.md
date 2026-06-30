# MPI Cost Cockpit — voiceover script (ElevenLabs)

Timed to the refreshed ~68s guided tour (`demo-videos/zbb-cockpit-tour-1080.mp4`).
~190 words ≈ 66–68s at a calm, confident pace.

> The plant identities are anonymised to **Asset 1 / Asset 2 / Asset 3** throughout
> the tour. This cut adds the external market band, cost-line owners + the 2025→2026
> increase, and a board-pack finale.
>
> **Narrated cuts shipped:** `demo-videos/zbb-cockpit-tour-1080-narrated.mp4` and
> `-4k-narrated.mp4`, with `demo/audio/narration-mark.mp3` (ElevenLabs “Mark —
> Natural Conversations”). The tour is **re-recorded on a timeline anchored to the
> VO** (`record-tour.cjs`: each beat fires at the sentence-start times below, derived
> from the audio's silence gaps), so the narrated cuts play at native speed and the
> captions land with the narration. The silent cuts stay the tighter ~68s edit.
> If you regenerate the VO, re-detect the gaps and update the `at()` times.

## Suggested ElevenLabs settings
- **Voice:** a calm, professional narrator. **Model:** Eleven Multilingual v2.
- **Stability** ~45–55 · **Similarity** ~75 · **Style** ~0–15 · Speaker boost on.

## Pronunciation guide (say it this way)
- **IPM** → “eye-pee-em” · **SCM** → “ess-see-em” · **O&M** → “oh and em”
- **$/kW-yr** → “dollars per kilowatt-year” · **YoY** → “year on year”
- **L3 / L4 / L5** → “level three / four / five” · **Rp** → read the number (“…billion rupiah”)

---

## Plain script (paste into ElevenLabs)

This is the MPI Cost Cockpit — a zero-based budgeting tool that stress-tests an entire fleet of power plants.

It benchmarks every plant's controllable oh-and-em against the best in the fleet. Two of three run above Asset One's forty-five dollars per kilowatt-year — and each cost line is also held against an external market band, so you see the headroom beyond your own best plant.

Switch to like-for-like, and the benchmark normalizes for plant size — stripping the scale advantage out of the gap. Then dial the ambition, and the value-at-stake updates live.

Drill any plant. At level three and four, every cost block is shown against last year, the increase it carries, and a named, accountable owner.

Down to level five — every line as quantity, times frequency, times unit rate, times exchange rate; booked against a should-cost benchmark.

Then challenge it. Log each call — accept, cut, or defer with a zero-based lever — and export the committed savings straight to the eye-pee-em and ess-see-em trackers, keyed on budget code.

Ask the Copilot — it reasons over the real numbers and gives you the challenge questions for each owner.

And in one click, a board-ready pack — the cost summary, the gaps by plant and by line, and what's been challenged — exported to PDF.

Benchmark, challenge, and budget — zero-based, end to end. The MPI Cost Cockpit.

---

## Timed segments — beat anchors (`record-tour.cjs` `at()` times, from the VO's silence gaps)

| Start | Scene | Line |
|---|---|---|
| 0:00 | Intro | This is the MPI Cost Cockpit — a zero-based budgeting tool that stress-tests an entire fleet of power plants. |
| 0:07 | Cross-asset | It benchmarks every plant's controllable oh-and-em against the best in the fleet. Two of three run above Asset One's forty-five dollars per kilowatt-year. |
| 0:17 | External band | And each cost line is also held against an external market band, so you see the headroom beyond your own best plant. |
| 0:24 | Like-for-like | Switch to like-for-like, and the benchmark normalizes for plant size — stripping the scale advantage out of the gap. |
| 0:32 | Ambition | Then dial the ambition, and the value-at-stake updates live. |
| 0:38 | L3–L4 | Drill any plant. At level three and four, every cost block is shown against last year, the increase it carries, and a named, accountable owner. |
| 0:46 | L5 | Down to level five — every line as quantity, times frequency, times unit rate, times exchange rate; booked against a should-cost benchmark. |
| 0:56 | Challenge | Then challenge it. Log each call — accept, cut, or defer with a zero-based lever — and export the committed savings to the eye-pee-em and ess-see-em trackers, keyed on budget code. |
| 1:10 | Copilot | Ask the Copilot — it reasons over the real numbers and gives you the challenge questions for each owner. |
| 1:17 | Board pack | And in one click, a board-ready pack — the cost summary, the gaps by plant and by line, and what's been challenged — exported to PDF. |
| 1:27 | Outro | Benchmark, challenge, and budget — zero-based, end to end. The MPI Cost Cockpit. |
