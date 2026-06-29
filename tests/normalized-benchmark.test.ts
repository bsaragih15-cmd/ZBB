import { describe, it, expect } from 'vitest'
import type { Fleet } from '../src/domain/types'
import { normalizedBenchUsd, fleetBestStake, buildCockpitMatrix, SCALE_ELASTICITY } from '../src/domain/cockpit-model'

const mkAsset = (code: string, mw: number, usd: number, blocks: [string, number][]) => ({
  code, full_name: code, mw, technology: 'Gas CCGT', controllable_om_idr: 0,
  controllable_om_rp_bn: 0, usd_per_kw_yr: usd, unit_scale: 1,
  cost_blocks: blocks.map(([name, v]) => ({ name, value_idr: v, value_rp_bn: v / 1e9, semi_committed: false })),
})

describe('normalized (size-fair) benchmarking', () => {
  it('absolute mode returns the raw best $/kW', () => {
    expect(normalizedBenchUsd(45, 275, 100, 'absolute')).toBe(45)
  })

  it('relaxes the benchmark upward for plants smaller than best', () => {
    const bench = normalizedBenchUsd(45, 275, 100, 'normalized')
    expect(bench).toBeGreaterThan(45)
    expect(bench).toBeCloseTo(45 * Math.pow(275 / 100, SCALE_ELASTICITY))
  })

  it('never tightens the benchmark for plants >= best size (factor floored at 1)', () => {
    expect(normalizedBenchUsd(45, 100, 275, 'normalized')).toBe(45)
    expect(normalizedBenchUsd(45, 275, 275, 'normalized')).toBe(45)
  })

  it('normalized fleet stake is smaller than absolute (size advantage removed)', () => {
    const fleet: Fleet = {
      fx_2026: 16500, best_in_fleet_code: 'BIG',
      assets: [
        mkAsset('BIG', 275, 45, [['Maintenance Cost', 0]]),
        mkAsset('SMALL', 100, 55, [['Maintenance Cost', 0]]),
      ],
    }
    const abs = fleetBestStake(fleet, 1, 'absolute').tot
    const norm = fleetBestStake(fleet, 1, 'normalized').tot
    expect(norm).toBeGreaterThan(0)
    expect(norm).toBeLessThan(abs)
  })

  it('matrix exposes per-cell bench_usd and shrinks gaps under normalization', () => {
    const fleet: Fleet = {
      fx_2026: 16500, best_in_fleet_code: 'BIG',
      assets: [
        mkAsset('BIG', 275, 45, [['Maintenance Cost', 12_000_000_000]]),
        mkAsset('SMALL', 100, 55, [['Maintenance Cost', 9_000_000_000]]),
      ],
    }
    const abs = buildCockpitMatrix(fleet, 'absolute')[0]
    const norm = buildCockpitMatrix(fleet, 'normalized')[0]
    expect(norm.cells[0]).toHaveProperty('bench_usd')
    expect(norm.total_gap_idr).toBeLessThanOrEqual(abs.total_gap_idr)
  })
})
