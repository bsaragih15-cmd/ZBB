import { describe, it, expect } from 'vitest'
import { blockUsdPerKw, buildCostMatrix, valueAtStake, valueAtStakeToFleetBest } from '../src/domain/cost-matrix'
import type { Asset } from '../src/domain/types'

const fx = 16500

function asset(code: string, mw: number, blocks: [string, number, boolean][]): Asset {
  return {
    code, full_name: code, mw, technology: 'Gas CCGT',
    controllable_om_idr: blocks.reduce((s, b) => s + b[1], 0),
    controllable_om_rp_bn: blocks.reduce((s, b) => s + b[1], 0) / 1e9,
    usd_per_kw_yr: 0, unit_scale: 1,
    cost_blocks: blocks.map(([name, value_idr, semi]) => ({
      name, value_idr, value_rp_bn: value_idr / 1e9, semi_committed: semi,
    })),
  }
}

// Two assets, one block "Maint". A: 100MW pays 33Bn ($20/kW). B: 50MW pays 8.25Bn ($10/kW=best).
const assets: Asset[] = [
  asset('A', 100, [['Maint', 33e9, false]]),
  asset('B', 50, [['Maint', 8.25e9, false]]),
]

describe('blockUsdPerKw', () => {
  it('normalises a block value to $/kW-yr', () => {
    expect(blockUsdPerKw(33e9, 100, fx)).toBeCloseTo(20, 1)
    expect(blockUsdPerKw(8.25e9, 50, fx)).toBeCloseTo(10, 1)
  })
})

describe('buildCostMatrix', () => {
  it('marks the best-in-fleet cell per block and sizes the gap at the laggard MW', () => {
    const rows = buildCostMatrix(assets, fx)
    const maint = rows.find((r) => r.block === 'Maint')!
    expect(maint.best_code).toBe('B')
    expect(maint.best_usd_per_kw).toBeCloseTo(10, 1)
    const cellA = maint.cells.find((c) => c.asset_code === 'A')!
    const cellB = maint.cells.find((c) => c.asset_code === 'B')!
    expect(cellB.is_best).toBe(true)
    expect(cellA.is_best).toBe(false)
    // A at best ($10/kW) would pay 10*100*1000*16500 = 16.5Bn; gap = 33 - 16.5 = 16.5Bn
    expect(cellA.gap_idr).toBeCloseTo(16.5e9, -6)
    expect(cellB.gap_idr).toBe(0)
    expect(maint.total_gap_idr).toBeCloseTo(16.5e9, -6)
  })

  it('covers blocks present in only some assets (missing = zero)', () => {
    const a2 = [
      asset('A', 100, [['Maint', 33e9, false], ['Salary', 10e9, false]]),
      asset('B', 50, [['Maint', 8.25e9, false]]),
    ]
    const rows = buildCostMatrix(a2, fx)
    const salary = rows.find((r) => r.block === 'Salary')!
    expect(salary.best_usd_per_kw).toBe(0) // B has no Salary -> $0 best
    expect(salary.best_code).toBe('B')
  })
})

describe('valueAtStakeToFleetBest', () => {
  it('brings each asset to the best total $/kW, scaled by capture %', () => {
    const fleet: Asset[] = [
      { ...asset('BEST', 100, [['x', 1, false]]), usd_per_kw_yr: 45 },
      { ...asset('LAG', 100, [['x', 1, false]]), usd_per_kw_yr: 58 },
    ]
    const full = valueAtStakeToFleetBest(fleet, fx, 1)
    expect(full.best_code).toBe('BEST')
    expect(full.by_asset['BEST']).toBe(0)
    // (58-45)*100*1000*16500 = 21.45Bn
    expect(full.by_asset['LAG']).toBeCloseTo(21.45e9, -6)
    expect(valueAtStakeToFleetBest(fleet, fx, 0.5).total_idr).toBeCloseTo(21.45e9 / 2, -6)
  })
})

describe('valueAtStake', () => {
  it('scales total gap by the capture percentage', () => {
    const rows = buildCostMatrix(assets, fx)
    const full = valueAtStake(rows, 1)
    expect(full.total_idr).toBeCloseTo(16.5e9, -6)
    expect(full.by_asset['A']).toBeCloseTo(16.5e9, -6)
    const half = valueAtStake(rows, 0.5)
    expect(half.total_idr).toBeCloseTo(8.25e9, -6)
    expect(half.by_block['Maint']).toBeCloseTo(8.25e9, -6)
  })
})
