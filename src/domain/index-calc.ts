import type { Asset } from './types'

export function normaliseToIdr(raw: number, unitScale: number): number {
  return raw * unitScale
}

export function usdPerKwYr(controllableIdr: number, mw: number, fx: number): number {
  return controllableIdr / (mw * 1000) / fx
}

export interface FleetTotals {
  total_idr: number
  total_rp_bn: number
  best_usd_per_kw_yr: number
  count_above_best: number
}

export function fleetTotals(assets: Pick<Asset, 'usd_per_kw_yr' | 'controllable_om_idr'>[]): FleetTotals {
  const total_idr = assets.reduce((s, a) => s + a.controllable_om_idr, 0)
  const best = Math.min(...assets.map((a) => a.usd_per_kw_yr))
  return {
    total_idr,
    total_rp_bn: total_idr / 1e9,
    best_usd_per_kw_yr: best,
    count_above_best: assets.filter((a) => a.usd_per_kw_yr > best).length,
  }
}
