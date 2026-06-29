import type { Decision, ZbbLever } from './types'

/**
 * Realization model: not every committed rupiah lands, and not at the same time.
 * Each ZBB lever carries a typical realization probability and lead time. This
 * lets the cost-out bridge show committed vs *risk-adjusted* savings — the
 * number a CFO can actually bank — instead of treating every decision as certain.
 *
 * Probabilities reflect how defensible/contractually-clean each lever is:
 * eliminating a discretionary line is near-certain; rebuilding a scope or
 * renegotiating a live contract carries execution and counterparty risk.
 */
export interface LeverProfile {
  label: string
  /** probability the committed saving is actually realized in-year (0..1) */
  probability: number
  /** typical lead time to realize, in months */
  timeline_months: number
}

export const LEVER_REALIZATION: Record<ZbbLever, LeverProfile> = {
  eliminate: { label: 'Eliminate', probability: 0.95, timeline_months: 1 },
  optimize: { label: 'Optimize', probability: 0.8, timeline_months: 3 },
  challenge: { label: 'Challenge', probability: 0.7, timeline_months: 2 },
  renegotiate: { label: 'Renegotiate', probability: 0.55, timeline_months: 6 },
  rebuild: { label: 'Rebuild', probability: 0.45, timeline_months: 9 },
  keep: { label: 'Keep', probability: 0, timeline_months: 0 },
}

/** Risk-adjusted (probability-weighted) saving for a single decision. */
export function riskAdjustedSaving(d: Decision): number {
  return d.committed_saving_idr * (LEVER_REALIZATION[d.lever]?.probability ?? 0)
}

export interface RealizationSummary {
  committed_idr: number
  risk_adjusted_idr: number
  /** committed saving grouped by lever */
  by_lever: Record<ZbbLever, { committed_idr: number; risk_adjusted_idr: number; count: number }>
}

/** Roll up committed vs risk-adjusted savings across all logged decisions. */
export function summarizeRealization(decisions: Decision[]): RealizationSummary {
  const by_lever = {} as RealizationSummary['by_lever']
  let committed_idr = 0
  let risk_adjusted_idr = 0
  for (const d of decisions) {
    const ra = riskAdjustedSaving(d)
    committed_idr += d.committed_saving_idr
    risk_adjusted_idr += ra
    const cur = by_lever[d.lever] ?? { committed_idr: 0, risk_adjusted_idr: 0, count: 0 }
    cur.committed_idr += d.committed_saving_idr
    cur.risk_adjusted_idr += ra
    cur.count += 1
    by_lever[d.lever] = cur
  }
  return { committed_idr, risk_adjusted_idr, by_lever }
}
