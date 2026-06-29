import type { Fleet } from './types'

/**
 * External / market benchmark — the frontier BEYOND best-in-fleet. Internal
 * benchmarking caps ambition at "the best plant we already own"; an external
 * top-quartile reference shows the additional gap to the market frontier, giving
 * a two-tier target: gap-to-fleet-best (achievable now) + gap-to-external (stretch).
 *
 * Values are $/kW-yr per cost line and are ILLUSTRATIVE — replace with your
 * benchmark provider (e.g. IPA/Solomon O&M indices, OEM LTSA norms). A user can
 * override the table (stored in localStorage) without touching code.
 */
export interface ExternalRef { usd: number; source: string }

export const EXTERNAL_LABEL = 'Illustrative top-quartile gas-CCGT O&M — replace with your benchmark provider'

export const DEFAULT_EXTERNAL: Record<string, ExternalRef> = {
  'Maintenance Service Agreement': { usd: 8.0, source: 'OEM LTSA norm' },
  'Maintenance Cost': { usd: 8.0, source: 'top-quartile O&M' },
  'Consumable': { usd: 1.2, source: 'market' },
  'Salary & Allowance': { usd: 3.5, source: 'regional labour index' },
  'Professional Service': { usd: 1.2, source: 'market' },
  'Rental': { usd: 0.5, source: 'market' },
  'Contract Service': { usd: 1.8, source: 'market' },
  'Transportation': { usd: 0.7, source: 'market' },
  'Other Opex': { usd: 2.8, source: 'market' },
  'Insurance': { usd: 6.0, source: 'premium index' },
  'Management Fees': { usd: 4.0, source: 'group policy' },
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

/** External target for total controllable $/kW (sum of per-line external $/kW). */
export const externalTotalUsd = (e: Record<string, ExternalRef>): number =>
  Object.values(e).reduce((s, r) => s + r.usd, 0)

export interface ExternalStake { tot: number; by: Record<string, number>; target: number }

/** Value-at-stake to the external frontier: each plant's total $/kW down to the external target. */
export function fleetExternalStake(fleet: Fleet, e: Record<string, ExternalRef>, cap: number): ExternalStake {
  const fx = fleet.fx_2026
  const target = externalTotalUsd(e)
  const by: Record<string, number> = {}
  let tot = 0
  for (const a of fleet.assets) {
    const g = Math.max(0, a.usd_per_kw_yr - target) * a.mw * 1000 * fx * cap
    by[a.code] = g
    tot += g
  }
  return { tot, by, target }
}
