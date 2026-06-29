/**
 * Prior-year (2025) baseline for the L3 cost blocks, so the L3–L4 view can show
 * both last year's $/kW-yr and the increase the 2026 submission carries.
 *
 * The dataset holds only the 2026 submission, so the default 2025 baseline is
 * MODELLED by deflating each block's 2026 value with a per-block YoY assumption
 * (contract escalation / FX / commodity differ by block, so the increase column
 * is meaningful rather than a flat constant). Values are ILLUSTRATIVE — upload
 * real 2025 actuals to replace. Both years are valued at the 2026 FX so the $/kW
 * columns are FX-neutral (real-terms) and directly comparable.
 */
export const PRIOR_YEAR = 2025
export const SUBMITTED_YEAR = 2026
export const PRIOR_LABEL =
  'Modelled 2025 baseline (illustrative per-block YoY) — upload 2025 actuals to replace'

/** Assumed YoY increase the 2026 submission carries over 2025, by cost block. */
export const DEFAULT_YOY: Record<string, number> = {
  'Maintenance Service Agreement': 0.04, // LTSA escalation clause
  'Maintenance Cost': 0.09,
  Consumable: 0.12, // FX + commodity
  'Salary & Allowance': 0.07,
  'Professional Service': 0.06,
  Rental: 0.03,
  'Contract Service': 0.08,
  Transportation: 0.1,
  'Other Opex': 0.06,
  Insurance: 0.15, // hard insurance market
  'Management Fees': 0.05,
}

export const FALLBACK_YOY = 0.07

const KEY = 'mpi-zbb-prior-yoy'

export function loadYoY(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* ignore */ }
  return DEFAULT_YOY
}

export function saveYoY(y: Record<string, number>): void {
  localStorage.setItem(KEY, JSON.stringify(y))
}

export function yoyFor(block: string, y: Record<string, number> = DEFAULT_YOY): number {
  return y[block] ?? FALLBACK_YOY
}

/** Modelled 2025 IDR for a block given its 2026 submission. */
export function priorIdr(
  block: string,
  submitted2026Idr: number,
  y: Record<string, number> = DEFAULT_YOY,
): number {
  return submitted2026Idr / (1 + yoyFor(block, y))
}

export interface YoyDelta {
  prior_idr: number
  delta_idr: number
  pct: number
}

/** 2025 baseline + the increase (Rp and %) the 2026 submission represents. */
export function yoyDelta(
  block: string,
  submitted2026Idr: number,
  y: Record<string, number> = DEFAULT_YOY,
): YoyDelta {
  const prior_idr = priorIdr(block, submitted2026Idr, y)
  const delta_idr = submitted2026Idr - prior_idr
  const pct = prior_idr > 0 ? submitted2026Idr / prior_idr - 1 : 0
  return { prior_idr, delta_idr, pct }
}
