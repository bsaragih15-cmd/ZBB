import { describe, it, expect } from 'vitest'
import type { Decision } from '../src/domain/types'
import { riskAdjustedSaving, summarizeRealization, LEVER_REALIZATION } from '../src/domain/realization'

const mk = (lever: Decision['lever'], saving: number): Decision => ({
  budget_code: `bc-${lever}-${saving}`,
  outcome: 'cut',
  lever,
  committed_saving_idr: saving,
  note: '',
  decided_at: '2026-01-01T00:00:00Z',
})

describe('realization model', () => {
  it('risk-adjusts a single decision by its lever probability', () => {
    expect(riskAdjustedSaving(mk('eliminate', 1_000_000_000)))
      .toBeCloseTo(1_000_000_000 * LEVER_REALIZATION.eliminate.probability)
    expect(riskAdjustedSaving(mk('renegotiate', 2_000_000_000)))
      .toBeCloseTo(2_000_000_000 * LEVER_REALIZATION.renegotiate.probability)
  })

  it('keep lever realizes nothing', () => {
    expect(riskAdjustedSaving(mk('keep', 5_000_000_000))).toBe(0)
  })

  it('summarizes committed vs risk-adjusted across decisions', () => {
    const decisions = [mk('eliminate', 1e9), mk('renegotiate', 2e9), mk('optimize', 4e9)]
    const s = summarizeRealization(decisions)
    expect(s.committed_idr).toBe(7e9)
    const expected = 1e9 * 0.95 + 2e9 * 0.55 + 4e9 * 0.8
    expect(s.risk_adjusted_idr).toBeCloseTo(expected)
    // risk-adjusted is always <= committed
    expect(s.risk_adjusted_idr).toBeLessThan(s.committed_idr)
  })

  it('groups by lever with counts', () => {
    const s = summarizeRealization([mk('eliminate', 1e9), mk('eliminate', 3e9), mk('rebuild', 2e9)])
    expect(s.by_lever.eliminate.count).toBe(2)
    expect(s.by_lever.eliminate.committed_idr).toBe(4e9)
    expect(s.by_lever.rebuild.count).toBe(1)
  })
})
