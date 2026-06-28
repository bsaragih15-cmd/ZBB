import { describe, it, expect } from 'vitest'
import { checkPlausibility, DRIVER_BANDS } from '../src/domain/rules/plausibility'
import type { Line } from '../src/domain/types'

const chem: Line = {
  budget_code: 'ELB-WTP-001', cost_block: 'Consumable',
  l3_activity: 'Water treatment', l4_equipment: 'Sodium Hypochlorite',
  qty: 120, freq: 1, rate_idr: 2_750_000, fx: 16500,
  original_currency: 'IDR', basis_of_estimate: 'vendor quote', value_idr: 330_000_000,
}

describe('checkPlausibility', () => {
  it('passes a unit rate inside the band', () => {
    expect(checkPlausibility(chem)).toBeNull()
  })
  it('flags a unit rate far above the band ceiling', () => {
    const f = checkPlausibility({ ...chem, rate_idr: 20_000_000, value_idr: 2_400_000_000 })
    expect(f).not.toBeNull()
    expect(f!.family).toBe('plausibility')
    expect(f!.baseline_label).toContain('band')
  })
  it('exposes editable bands per cost block', () => {
    expect(DRIVER_BANDS['Consumable'].rate_ceiling_idr).toBeGreaterThan(0)
  })
})
