import { describe, it, expect } from 'vitest'
import type { Fleet } from '../src/domain/types'
import { externalTotalUsd, fleetExternalStake, DEFAULT_EXTERNAL } from '../src/domain/external-benchmark'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'MRPR',
  assets: [
    { code: 'MRPR', full_name: 'MRPR', mw: 275, technology: 'Gas CCGT', controllable_om_idr: 0, controllable_om_rp_bn: 0, usd_per_kw_yr: 45, unit_scale: 1, cost_blocks: [] },
    { code: 'ELB', full_name: 'ELB', mw: 109, technology: 'Gas CCGT', controllable_om_idr: 0, controllable_om_rp_bn: 0, usd_per_kw_yr: 51.4, unit_scale: 1, cost_blocks: [] },
  ],
}

describe('external benchmark', () => {
  it('sums per-line external $/kW into a total target', () => {
    const t = externalTotalUsd(DEFAULT_EXTERNAL)
    expect(t).toBeCloseTo(Object.values(DEFAULT_EXTERNAL).reduce((s, r) => s + r.usd, 0))
    expect(t).toBeGreaterThan(0)
  })

  it('value-at-stake to external uses the external total as the target', () => {
    const stake = fleetExternalStake(fleet, DEFAULT_EXTERNAL, 1)
    const target = externalTotalUsd(DEFAULT_EXTERNAL)
    // every plant above the external target contributes a positive gap
    const elbGap = Math.max(0, 51.4 - target) * 109 * 1000 * 16500
    expect(stake.by.ELB).toBeCloseTo(elbGap, -6)
    expect(stake.target).toBeCloseTo(target)
    expect(stake.tot).toBeGreaterThanOrEqual(stake.by.ELB)
  })

  it('reveals headroom beyond best-in-fleet when external < best', () => {
    // DEFAULT_EXTERNAL total (~$38) is below MRPR's $45 best, so even the best
    // plant carries an external gap → external stake exceeds internal-only.
    const stake = fleetExternalStake(fleet, DEFAULT_EXTERNAL, 1)
    expect(stake.by.MRPR).toBeGreaterThan(0)
  })
})
