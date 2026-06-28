import { describe, it, expect } from 'vitest'
import { buildWriteBack } from '../src/domain/export'
import type { Line, Decision } from '../src/domain/types'

const lines: Line[] = [{
  budget_code: 'ELB-GE-LTSA', cost_block: 'Maintenance Service Agreement',
  l3_activity: 'GE LTSA', l4_equipment: 'Gas turbine', qty: 1, freq: 1,
  rate_idr: 8.97e9, fx: 16500, original_currency: 'USD', basis_of_estimate: 'contract',
  value_idr: 8.97e9,
}, {
  budget_code: 'ELB-CONS', cost_block: 'Consumable',
  l3_activity: 'WTP', l4_equipment: 'NaOCl', qty: null, freq: null,
  rate_idr: null, fx: 1, original_currency: 'IDR', basis_of_estimate: 'quote',
  value_idr: 2e9,
}]
const decisions: Decision[] = [{ budget_code: 'ELB-GE-LTSA', outcome: 'cut', lever: 'renegotiate',
  committed_saving_idr: 0.73e9, note: '', decided_at: '2026-06-28T00:00:00Z' }]

describe('buildWriteBack', () => {
  it('carries the Budget Code and applies the saving to the approved value', () => {
    const rows = buildWriteBack(lines, decisions)
    expect(rows[0].budget_code).toBe('ELB-GE-LTSA')
    expect(rows[0].approved_value_idr).toBeCloseTo(8.97e9 - 0.73e9, 0)
  })

  it('defaults undecided lines to keep/accept with no saving', () => {
    const rows = buildWriteBack(lines, decisions)
    const undecided = rows.find((r) => r.budget_code === 'ELB-CONS')!
    expect(undecided.outcome).toBe('accept')
    expect(undecided.lever).toBe('keep')
    expect(undecided.committed_saving_idr).toBe(0)
    expect(undecided.approved_value_idr).toBe(2e9)
  })
})
