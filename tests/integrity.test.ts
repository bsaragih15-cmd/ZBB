import { describe, it, expect } from 'vitest'
import { checkIntegrity } from '../src/domain/rules/integrity'
import type { Line } from '../src/domain/types'

const base: Line = {
  budget_code: 'ELB-WTP-001', cost_block: 'Consumable',
  l3_activity: 'Water treatment', l4_equipment: 'Sodium Hypochlorite',
  qty: 120, freq: 1, rate_idr: 2_750_000, fx: 16500,
  original_currency: 'IDR', basis_of_estimate: 'vendor quote',
  value_idr: 330_000_000,
}

describe('checkIntegrity', () => {
  it('passes a clean bottom-up IDR line', () => {
    expect(checkIntegrity(base)).toEqual([])
  })
  it('flags a lump-sum line with no Qty x Rate', () => {
    const f = checkIntegrity({ ...base, qty: null, rate_idr: null })
    expect(f.some((x) => x.message.includes('lump-sum'))).toBe(true)
  })
  it('flags a USD line with no FX', () => {
    const f = checkIntegrity({ ...base, original_currency: 'USD', fx: 0 })
    expect(f.some((x) => x.message.includes('FX'))).toBe(true)
  })
  it('flags a missing basis of estimate', () => {
    const f = checkIntegrity({ ...base, basis_of_estimate: '' })
    expect(f.some((x) => x.message.includes('basis'))).toBe(true)
  })
})
