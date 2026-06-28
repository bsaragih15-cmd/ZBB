import { describe, it, expect } from 'vitest'
import { usdPerKwYr, normaliseToIdr, fleetTotals } from '../src/domain/index-calc'

describe('usdPerKwYr', () => {
  it('computes MEB at ~$58/kW-yr', () => {
    expect(usdPerKwYr(78.6e9, 82.1, 16500)).toBeCloseTo(58.0, 0)
  })
  it('computes MRPR at ~$45/kW-yr', () => {
    expect(usdPerKwYr(204.2e9, 275, 16500)).toBeCloseTo(45.0, 0)
  })
})

describe('normaliseToIdr', () => {
  it('scales MRPR thousands up to full IDR (not 0.2 Bn)', () => {
    expect(normaliseToIdr(204_200, 1000)).toBe(204_200_000)
    expect(normaliseToIdr(204_200, 1)).toBe(204_200)
  })
})

describe('fleetTotals', () => {
  it('sums controllable O&M and counts assets above best-in-fleet', () => {
    const assets = [
      { usd_per_kw_yr: 45.0, controllable_om_idr: 204.2e9 },
      { usd_per_kw_yr: 50.9, controllable_om_idr: 63.9e9 },
      { usd_per_kw_yr: 51.4, controllable_om_idr: 92.4e9 },
      { usd_per_kw_yr: 58.0, controllable_om_idr: 78.6e9 },
    ] as any
    const t = fleetTotals(assets)
    expect(t.total_rp_bn).toBeCloseTo(439.1, 0)
    expect(t.best_usd_per_kw_yr).toBe(45.0)
    expect(t.count_above_best).toBe(3)
  })
})
