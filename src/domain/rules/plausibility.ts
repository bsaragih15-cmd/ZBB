import type { Line, Flag } from '../types'

export const DRIVER_BANDS: Record<string, { rate_floor_idr: number; rate_ceiling_idr: number }> = {
  'Consumable': { rate_floor_idr: 10_000, rate_ceiling_idr: 10_000_000 },
  'Maintenance Cost': { rate_floor_idr: 100_000, rate_ceiling_idr: 5_000_000_000 },
  'Maintenance Service Agreement': { rate_floor_idr: 1_000_000, rate_ceiling_idr: 20_000_000_000 },
  'Salary & Allowance': { rate_floor_idr: 5_000_000, rate_ceiling_idr: 200_000_000 },
}

export function checkPlausibility(line: Line): Flag | null {
  const band = DRIVER_BANDS[line.cost_block]
  if (!band || line.rate_idr == null) return null
  if (line.rate_idr <= band.rate_ceiling_idr && line.rate_idr >= band.rate_floor_idr) return null
  const overBy = line.rate_idr > band.rate_ceiling_idr
    ? line.rate_idr - band.rate_ceiling_idr
    : band.rate_floor_idr - line.rate_idr
  const excess = overBy * (line.qty ?? 1) * (line.freq ?? 1)
  return {
    budget_code: line.budget_code, family: 'plausibility',
    severity: 'medium',
    message: `unit rate ${line.rate_idr.toLocaleString()} outside plausible band for ${line.cost_block}`,
    baseline_label: `plausibility band (${band.rate_floor_idr.toLocaleString()}-${band.rate_ceiling_idr.toLocaleString()})`,
    excess_idr: Math.max(0, excess), confidence: 0.7, score: 0,
  }
}
