import type { Asset, CostBlock } from './types'

/**
 * Cross-plant comparability. Raw cost blocks are NOT apples-to-apples: plants
 * book the same activity under different blocks (e.g. MEB folds its LTSA into
 * Maintenance Cost so its "Maintenance Service Agreement" is 0; MRPR books
 * almost nothing under "Consumable"). Benchmarking a misclassified near-zero as
 * "best" produces a fictitious gap for everyone else.
 *
 * Two defenses:
 *   1. CANONICAL — roll sibling blocks up to a canonical category so classification
 *      differences cancel within the group (used for like-for-like rollups).
 *   2. COMPARABILITY_FLOOR — within a line, a plant whose $/kW is an implausibly
 *      small fraction of the fleet median is treated as "likely classified
 *      elsewhere": excluded from setting the benchmark and flagged, not counted
 *      as the efficient frontier.
 */
export const CANONICAL: Record<string, string> = {
  'Maintenance Service Agreement': 'Maintenance & materials',
  'Maintenance Cost': 'Maintenance & materials',
  'Consumable': 'Maintenance & materials',
  'Salary & Allowance': 'People',
  'Professional Service': 'Contracted services',
  'Contract Service': 'Contracted services',
  'Rental': 'Contracted services',
  'Transportation': 'Contracted services',
  'Other Opex': 'Other opex',
  'Insurance': 'Insurance',
  'Management Fees': 'Management fees',
}

export const canonicalCategory = (block: string): string => CANONICAL[block] ?? 'Other opex'

/** A plant booking < 15% of the fleet median $/kW for a line is "classified elsewhere". */
export const COMPARABILITY_FLOOR = 0.15

/** Roll an asset's raw cost blocks up to canonical categories (classification-robust). */
export function canonicalBlocks(asset: Asset): CostBlock[] {
  const by = new Map<string, CostBlock>()
  for (const b of asset.cost_blocks) {
    const cat = canonicalCategory(b.name)
    const cur = by.get(cat) ?? { name: cat, value_idr: 0, value_rp_bn: 0, semi_committed: false }
    cur.value_idr += b.value_idr
    cur.value_rp_bn = cur.value_idr / 1e9
    cur.semi_committed = cur.semi_committed || b.semi_committed
    by.set(cat, cur)
  }
  return [...by.values()]
}

/** Median of a numeric list (0 for empty). */
export function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
