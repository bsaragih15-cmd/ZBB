import type { Line, Flag } from './types'

// Blocks excluded from the controllable-O&M challenge scope (non-cash, financing, pass-through)
const NON_CONTROLLABLE = new Set<string>([
  'Finance Costs', 'Depreciation', 'Tax', 'Taxes', 'Fuel', 'Fuel Cost', 'Fuel & Feedstock',
])

const rpBn = (idr: number) => (idr / 1e9).toFixed(2)

/**
 * ELB carries 343 P&L lines but no Qty×Rate build-up (qty/freq/rate are null in source).
 * Rather than failing every line on integrity, surface the largest CONTROLLABLE lines as
 * "booked as a lump sum — justify from basis" challenges (the M1 not-bottom-up finding),
 * ranked by rupiah at stake. USD-original lines are tagged as FX-exposed.
 */
export function buildElbChallenges(lines: Line[], topN = 25): Flag[] {
  const controllable = lines.filter(
    (l) => l.value_idr > 0 && !NON_CONTROLLABLE.has(l.cost_block)
  )
  const ranked = [...controllable].sort((a, b) => b.value_idr - a.value_idr).slice(0, topN)
  return ranked.map((l) => {
    const fxNote = l.original_currency === 'USD' ? ' (USD, FX-exposed)' : ''
    const severity = l.value_idr >= 10e9 ? 'high' : l.value_idr >= 3e9 ? 'medium' : 'low'
    const confidence = 0.5
    const excess_idr = l.value_idr
    return {
      budget_code: l.budget_code,
      family: 'integrity' as const,
      severity,
      message:
        `Rp ${rpBn(l.value_idr)} Bn in ${l.cost_block}${fxNote} is booked without a ` +
        `Qty × Rate build-up, so the number cannot be challenged from a basis`,
      baseline_label: 'bottom-up build-up standard',
      excess_idr,
      confidence,
      score: excess_idr * confidence,
    }
  })
}
