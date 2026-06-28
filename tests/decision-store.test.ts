import { describe, it, expect } from 'vitest'
import { upsertDecision, totalCommittedSaving, gapToTarget } from '../src/domain/decision-store'
import type { Decision } from '../src/domain/types'

const d = (code: string, saving: number): Decision => ({
  budget_code: code, outcome: 'cut', lever: 'challenge',
  committed_saving_idr: saving, note: '', decided_at: '2026-06-28T00:00:00Z',
})

describe('decision store', () => {
  it('upserts by budget_code (no duplicates)', () => {
    let store: Decision[] = []
    store = upsertDecision(store, d('A', 1e9))
    store = upsertDecision(store, d('A', 2e9))
    expect(store).toHaveLength(1)
    expect(store[0].committed_saving_idr).toBe(2e9)
  })
  it('totals committed savings', () => {
    const store = [d('A', 1e9), d('B', 2e9)]
    expect(totalCommittedSaving(store)).toBe(3e9)
  })
  it('computes gap-to-target after savings', () => {
    expect(gapToTarget(10e9, [d('A', 4e9)])).toBe(6e9)
  })
})
