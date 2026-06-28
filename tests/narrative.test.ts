import { describe, it, expect } from 'vitest'
import { narrate, challengeQuestion } from '../src/domain/ai/narrative'
import type { Flag } from '../src/domain/types'

const flag: Flag = {
  budget_code: 'ELB-GE-LTSA', family: 'variance', severity: 'high',
  message: 'YoY +12% vs prior, above 3% inflation',
  baseline_label: 'prior year + inflation', excess_idr: 730_000_000,
  confidence: 0.9, score: 657_000_000,
}

describe('AI layer', () => {
  it('narrates a flag with its baseline and excess rupiah', () => {
    const n = narrate(flag)
    expect(n).toContain('prior year + inflation')
    expect(n).toContain('0.73')
  })
  it('drafts a pointed challenge question', () => {
    expect(challengeQuestion(flag)).toMatch(/\?$/)
  })
})
