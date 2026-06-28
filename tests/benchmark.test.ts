import { describe, it, expect } from 'vitest'
import { gapToBestInFleet, benchmarkFleet } from '../src/domain/benchmark'

const assets = [
  { code: 'MRPR', mw: 275, usd_per_kw_yr: 45.0, controllable_om_idr: 204.2e9 },
  { code: 'DEB', mw: 76, usd_per_kw_yr: 50.9, controllable_om_idr: 63.9e9 },
  { code: 'ELB', mw: 109, usd_per_kw_yr: 51.4, controllable_om_idr: 92.4e9 },
  { code: 'MEB', mw: 82.1, usd_per_kw_yr: 58.0, controllable_om_idr: 78.6e9 },
] as any

describe('gapToBestInFleet', () => {
  it('MEB gap to Batam best-in-fleet (DEB) is ~Rp 9-10 Bn', () => {
    const gap = gapToBestInFleet(assets[3], 50.9, 16500)
    expect(gap / 1e9).toBeGreaterThan(8.5)
    expect(gap / 1e9).toBeLessThan(10.5)
  })
  it('best-in-fleet asset has zero gap', () => {
    expect(gapToBestInFleet(assets[1], 50.9, 16500)).toBe(0)
  })
})

describe('benchmarkFleet', () => {
  it('uses the Batam peer best as the reference for Batam assets', () => {
    const r = benchmarkFleet(assets, 16500)
    const meb = r.find((a) => a.code === 'MEB')!
    expect(meb.gap_rp_bn).toBeGreaterThan(8.5)
    expect(meb.severity).toBe('high')
  })
})
