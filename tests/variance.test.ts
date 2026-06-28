import { describe, it, expect } from 'vitest'
import { checkVariance } from '../src/domain/rules/variance'
import type { Line } from '../src/domain/types'

const line: Line = {
  budget_code: 'ELB-GE-LTSA', cost_block: 'Maintenance Service Agreement',
  l3_activity: 'GE LTSA', l4_equipment: 'Gas turbine', qty: 1, freq: 1,
  rate_idr: 8_970_000_000, fx: 16500, original_currency: 'USD',
  basis_of_estimate: 'contract', value_idr: 8_970_000_000,
}

describe('checkVariance', () => {
  it('flags a YoY jump beyond inflation, excess = above inflation-adjusted prior', () => {
    const f = checkVariance(line, { prior_value_idr: 8_000_000_000 }, 0.03)
    expect(f).not.toBeNull()
    expect(f!.family).toBe('variance')
    expect(f!.excess_idr / 1e9).toBeCloseTo(0.73, 1)
    expect(f!.baseline_label).toContain('prior year')
  })
  it('does not flag a line within inflation', () => {
    expect(checkVariance({ ...line, value_idr: 8_200_000_000 },
      { prior_value_idr: 8_000_000_000 }, 0.03)).toBeNull()
  })
  it('flags a brand-new line as the ZBB hook', () => {
    const f = checkVariance(line, { prior_value_idr: null }, 0.03)
    expect(f!.message).toContain('no prior-year history')
  })
})
