import type { Fleet } from './types'

/**
 * External / market benchmark — the frontier BEYOND best-in-fleet, expressed as a
 * RANGE (low–high $/kW-yr) because external references carry real uncertainty
 * (provider, vintage, scope). Gives a two-tier, range-aware target: gap to
 * fleet-best (achievable now) + gap to the external band (stretch).
 *
 * Values are ILLUSTRATIVE — replace with your benchmark provider (IPA/Solomon
 * O&M indices, OEM LTSA norms). A user can override the table (localStorage)
 * without touching code.
 */
export interface ExternalRef { low: number; high: number; source: string }

export const EXTERNAL_LABEL = 'Illustrative top-quartile gas-CCGT O&M band — replace with your benchmark provider'

export const DEFAULT_EXTERNAL: Record<string, ExternalRef> = {
  'Maintenance Service Agreement': { low: 7.0, high: 9.0, source: 'OEM LTSA norm' },
  'Maintenance Cost': { low: 6.5, high: 9.0, source: 'top-quartile O&M' },
  'Consumable': { low: 0.9, high: 1.5, source: 'market' },
  'Salary & Allowance': { low: 3.0, high: 4.0, source: 'regional labour index' },
  'Professional Service': { low: 0.9, high: 1.5, source: 'market' },
  'Rental': { low: 0.4, high: 0.7, source: 'market' },
  'Contract Service': { low: 1.4, high: 2.2, source: 'market' },
  'Transportation': { low: 0.5, high: 0.9, source: 'market' },
  'Other Opex': { low: 2.2, high: 3.4, source: 'market' },
  'Insurance': { low: 5.0, high: 7.0, source: 'premium index' },
  'Management Fees': { low: 3.0, high: 5.0, source: 'group policy' },
}

const KEY = 'mpi-zbb-external'

export function loadExternal(): Record<string, ExternalRef> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Record<string, ExternalRef>
  } catch { /* ignore */ }
  return DEFAULT_EXTERNAL
}

export function saveExternal(e: Record<string, ExternalRef>): void {
  localStorage.setItem(KEY, JSON.stringify(e))
}

export interface UsdRange { low: number; high: number }

/** External target band for total controllable $/kW (sum of per-line low/high). */
export function externalTotalRange(e: Record<string, ExternalRef>): UsdRange {
  return Object.values(e).reduce(
    (s, r) => ({ low: s.low + r.low, high: s.high + r.high }),
    { low: 0, high: 0 },
  )
}

export interface ExternalStake {
  /** larger potential — every plant's $/kW down to the LOW (deep) external target */
  maxTot: number
  /** smaller potential — down to the HIGH (conservative) external target */
  minTot: number
  byMax: Record<string, number>
  byMin: Record<string, number>
  target: UsdRange
}

const stakeToTarget = (fleet: Fleet, target: number, cap: number) => {
  const fx = fleet.fx_2026
  const by: Record<string, number> = {}
  let tot = 0
  for (const a of fleet.assets) {
    const g = Math.max(0, a.usd_per_kw_yr - target) * a.mw * 1000 * fx * cap
    by[a.code] = g
    tot += g
  }
  return { tot, by }
}

/** Value-at-stake to the external band — a range from conservative (high) to deep (low). */
export function externalStakeRange(fleet: Fleet, e: Record<string, ExternalRef>, cap: number): ExternalStake {
  const target = externalTotalRange(e)
  const deep = stakeToTarget(fleet, target.low, cap)   // low target → larger gap
  const cons = stakeToTarget(fleet, target.high, cap)  // high target → smaller gap
  return { maxTot: deep.tot, minTot: cons.tot, byMax: deep.by, byMin: cons.by, target }
}
