import { describe, it, expect } from 'vitest'
import { priorIdr, yoyDelta, yoyFor, DEFAULT_YOY, FALLBACK_YOY } from '../src/domain/prior-year'

describe('prior-year (2025) baseline', () => {
  it('deflates the 2026 submission by the per-block YoY', () => {
    const v2026 = 1_120_000_000
    const prior = priorIdr('Consumable', v2026) // 12% YoY
    expect(prior).toBeCloseTo(v2026 / 1.12, 0)
  })

  it('unknown blocks fall back to the default YoY', () => {
    expect(yoyFor('Nonexistent Block')).toBe(FALLBACK_YOY)
    expect(yoyFor('Insurance')).toBe(DEFAULT_YOY['Insurance'])
  })

  it('yoyDelta returns a positive increase matching the block YoY', () => {
    const v2026 = 2_000_000_000
    const d = yoyDelta('Salary & Allowance', v2026) // 7%
    expect(d.pct).toBeCloseTo(0.07, 5)
    expect(d.delta_idr).toBeCloseTo(v2026 - d.prior_idr, 0)
    expect(d.delta_idr).toBeGreaterThan(0)
  })
})
