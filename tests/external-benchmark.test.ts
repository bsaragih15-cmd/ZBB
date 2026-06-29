import { describe, it, expect } from 'vitest'
import type { Fleet } from '../src/domain/types'
import { externalTotalRange, externalStakeRange, DEFAULT_EXTERNAL } from '../src/domain/external-benchmark'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'MRPR',
  assets: [
    { code: 'MRPR', full_name: 'MRPR', mw: 275, technology: 'Gas CCGT', controllable_om_idr: 0, controllable_om_rp_bn: 0, usd_per_kw_yr: 45, unit_scale: 1, cost_blocks: [] },
    { code: 'ELB', full_name: 'ELB', mw: 109, technology: 'Gas CCGT', controllable_om_idr: 0, controllable_om_rp_bn: 0, usd_per_kw_yr: 51.4, unit_scale: 1, cost_blocks: [] },
  ],
}

describe('external benchmark (range)', () => {
  it('sums per-line low/high into a total band with low < high', () => {
    const t = externalTotalRange(DEFAULT_EXTERNAL)
    expect(t.low).toBeLessThan(t.high)
    expect(t.low).toBeCloseTo(Object.values(DEFAULT_EXTERNAL).reduce((s, r) => s + r.low, 0))
    expect(t.high).toBeCloseTo(Object.values(DEFAULT_EXTERNAL).reduce((s, r) => s + r.high, 0))
  })

  it('stake range: deeper (low) target yields more potential than conservative (high)', () => {
    const s = externalStakeRange(fleet, DEFAULT_EXTERNAL, 1)
    expect(s.maxTot).toBeGreaterThanOrEqual(s.minTot)
    expect(s.target.low).toBeLessThan(s.target.high)
    // ELB at $51.4 exceeds both ends → positive gap at both
    const elbDeep = Math.max(0, 51.4 - s.target.low) * 109 * 1000 * 16500
    expect(s.byMax.ELB).toBeCloseTo(elbDeep, -6)
  })

  it('reveals headroom beyond best-in-fleet (external low < $45 best)', () => {
    const s = externalStakeRange(fleet, DEFAULT_EXTERNAL, 1)
    expect(s.byMax.MRPR).toBeGreaterThan(0) // even the best plant has external headroom
  })
})
