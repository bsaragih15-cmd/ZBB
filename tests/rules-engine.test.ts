import { describe, it, expect } from 'vitest'
import { score } from '../src/domain/scoring'
import { runRules } from '../src/domain/rules'
import type { Line } from '../src/domain/types'

describe('score', () => {
  it('is excess_idr * confidence', () => {
    expect(score({ excess_idr: 1e9, confidence: 0.9 } as any)).toBeCloseTo(0.9e9, 0)
  })
})

describe('runRules', () => {
  const clean: Line = {
    budget_code: 'ELB-WTP-001', cost_block: 'Consumable', l3_activity: 'WTP',
    l4_equipment: 'NaOCl', qty: 120, freq: 1, rate_idr: 2_750_000, fx: 16500,
    original_currency: 'IDR', basis_of_estimate: 'quote', value_idr: 330_000_000,
  }
  const lump: Line = { ...clean, budget_code: 'ELB-X', qty: null, rate_idr: null }

  it('separates integrity failures from the scored challenge list', () => {
    const r = runRules([clean, lump], { history: {}, inflation: 0.03 })
    expect(r.integrityFailures.some((f) => f.budget_code === 'ELB-X')).toBe(true)
    expect(r.challenges.every((f) => f.family !== 'integrity')).toBe(true)
  })

  it('sorts challenges by score descending', () => {
    const big: Line = { ...clean, budget_code: 'ELB-BIG', qty: 1, freq: 1, rate_idr: 12e9, value_idr: 12e9 }
    const r = runRules([clean, big], {
      history: { 'ELB-BIG': { prior_value_idr: 8e9 }, 'ELB-WTP-001': { prior_value_idr: 300_000_000 } },
      inflation: 0.03,
    })
    expect(r.challenges[0].budget_code).toBe('ELB-BIG')
  })
})
