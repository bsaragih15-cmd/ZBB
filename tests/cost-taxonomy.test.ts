import { describe, it, expect } from 'vitest'
import type { Asset, Fleet } from '../src/domain/types'
import { canonicalBlocks, canonicalCategory } from '../src/domain/cost-taxonomy'
import { buildCockpitMatrix } from '../src/domain/cockpit-model'

const mkAsset = (code: string, mw: number, blocks: [string, number][]): Asset => ({
  code, full_name: code, mw, technology: 'Gas CCGT', controllable_om_idr: 0,
  controllable_om_rp_bn: 0, usd_per_kw_yr: 0, unit_scale: 1,
  cost_blocks: blocks.map(([name, v]) => ({ name, value_idr: v, value_rp_bn: v / 1e9, semi_committed: name === 'Insurance' })),
})

describe('canonical taxonomy', () => {
  it('rolls sibling blocks into canonical categories', () => {
    expect(canonicalCategory('Maintenance Service Agreement')).toBe('Maintenance & materials')
    expect(canonicalCategory('Consumable')).toBe('Maintenance & materials')
    const a = mkAsset('X', 100, [['Maintenance Service Agreement', 2e9], ['Maintenance Cost', 3e9], ['Consumable', 1e9], ['Salary & Allowance', 5e9]])
    const canon = canonicalBlocks(a)
    const maint = canon.find((b) => b.name === 'Maintenance & materials')!
    expect(maint.value_idr).toBe(6e9) // 2 + 3 + 1
    expect(canon.find((b) => b.name === 'People')!.value_idr).toBe(5e9)
  })
})

describe('comparability guard in buildCockpitMatrix', () => {
  it('excludes a misclassified near-zero plant from setting the benchmark and flags it', () => {
    const fleet: Fleet = {
      fx_2026: 16500, best_in_fleet_code: 'B',
      assets: [
        mkAsset('A', 100, [['Consumable', 5e9]]),   // $3.03/kW
        mkAsset('B', 100, [['Consumable', 4e9]]),   // $2.42/kW  ← true best
        mkAsset('C', 100, [['Consumable', 0.1e9]]), // $0.06/kW  ← misclassified
      ],
    }
    const row = buildCockpitMatrix(fleet)[0]
    const cells = Object.fromEntries(row.cells.map((c) => [c.code, c]))
    expect(cells.C.is_outlier).toBe(true)
    expect(cells.C.is_best).toBe(false)
    expect(row.best_code).toBe('B')              // not C
    expect(cells.B.is_best).toBe(true)
    // A's gap is measured vs B (~2.42), not vs the misclassified 0.06
    expect(cells.A.gap_idr).toBeGreaterThan(0)
    expect(cells.A.gap_idr).toBeLessThan(5e9)
  })
})
