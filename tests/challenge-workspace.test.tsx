import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChallengeWorkspace } from '../src/screens/ChallengeWorkspace'
import type { Fleet, Line } from '../src/domain/types'

const fleet: Fleet = { fx_2026: 16500, best_in_fleet_code: 'DEB', assets: [] }

const mk = (over: Partial<Line>): Line => ({
  budget_code: 'X', cost_block: 'Maintenance Cost', l3_activity: '', l4_equipment: '',
  qty: null, freq: null, rate_idr: null, fx: 16500, original_currency: 'IDR',
  basis_of_estimate: '', value_idr: 1e9, ...over,
})

const lines: Line[] = [
  mk({ budget_code: 'ELB-TOP', cost_block: 'Maintenance Cost', value_idr: 12e9 }),
  mk({ budget_code: 'ELB-MID', cost_block: 'Salary and benefits', value_idr: 4e9 }),
  mk({ budget_code: 'ELB-USD', cost_block: 'Maintenance Service Agreement', value_idr: 5e9, original_currency: 'USD' }),
]

describe('ChallengeWorkspace', () => {
  beforeEach(() => localStorage.clear())

  it('renders ELB lump-sum challenges ranked by rupiah at stake', () => {
    render(<ChallengeWorkspace assetCode="ELB" lines={lines} fleet={fleet}
      decisions={[]} setDecisions={() => {}} />)
    expect(screen.getAllByText(/ELB-TOP/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/build-up/).length).toBeGreaterThan(0)
  })

  it('shows a not-sourced message for assets without line detail', () => {
    render(<ChallengeWorkspace assetCode="MEB" lines={[]} fleet={fleet}
      decisions={[]} setDecisions={() => {}} />)
    expect(screen.getByText(/not yet sourced/)).toBeInTheDocument()
  })
})
