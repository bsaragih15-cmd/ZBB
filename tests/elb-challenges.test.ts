import { describe, it, expect } from 'vitest'
import { buildElbChallenges } from '../src/domain/elb-challenges'
import type { Line } from '../src/domain/types'

const mk = (over: Partial<Line>): Line => ({
  budget_code: 'X', cost_block: 'Maintenance Cost', l3_activity: '', l4_equipment: '',
  qty: null, freq: null, rate_idr: null, fx: 16500, original_currency: 'IDR',
  basis_of_estimate: '', value_idr: 1e9, ...over,
})

const lines: Line[] = [
  mk({ budget_code: 'FIN-1', cost_block: 'Finance Costs', value_idr: 123.6e9 }),
  mk({ budget_code: 'DEP-1', cost_block: 'Depreciation', value_idr: 79e9 }),
  mk({ budget_code: 'MAINT-TOP', cost_block: 'Maintenance Cost', value_idr: 12e9 }),
  mk({ budget_code: 'MSA-USD', cost_block: 'Maintenance Service Agreement', value_idr: 7.5e9, original_currency: 'USD' }),
  mk({ budget_code: 'SAL-1', cost_block: 'Salary and benefits', value_idr: 4e9 }),
  mk({ budget_code: 'ZERO', cost_block: 'Maintenance Cost', value_idr: 0 }),
]

describe('buildElbChallenges', () => {
  it('ranks the largest controllable line first', () => {
    const flags = buildElbChallenges(lines)
    expect(flags[0].budget_code).toBe('MAINT-TOP')
    expect(flags[0].excess_idr).toBe(12e9)
    expect(flags[0].severity).toBe('high')
  })

  it('excludes Finance Costs, Depreciation, and zero-value lines', () => {
    const codes = buildElbChallenges(lines).map((f) => f.budget_code)
    expect(codes).not.toContain('FIN-1')
    expect(codes).not.toContain('DEP-1')
    expect(codes).not.toContain('ZERO')
  })

  it('tags USD-original lines as FX-exposed', () => {
    const usd = buildElbChallenges(lines).find((f) => f.budget_code === 'MSA-USD')
    expect(usd?.message).toContain('FX-exposed')
  })

  it('every flag carries a lump-sum / build-up message and integrity family', () => {
    const f = buildElbChallenges(lines)[0]
    expect(f.message).toMatch(/Qty . Rate build-up/)
    expect(f.family).toBe('integrity')
  })

  it('caps the list at topN', () => {
    const many: Line[] = Array.from({ length: 40 }, (_, i) =>
      mk({ budget_code: `M-${i}`, value_idr: (i + 1) * 1e9 }))
    expect(buildElbChallenges(many, 25)).toHaveLength(25)
  })
})
