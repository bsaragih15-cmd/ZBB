import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChallengeWorkspace } from '../src/screens/ChallengeWorkspace'
import type { Line } from '../src/domain/types'

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

const noop = () => {}

describe('ChallengeWorkspace', () => {
  beforeEach(() => localStorage.clear())

  it('renders challenges ranked by rupiah at stake with the source badge', () => {
    render(<ChallengeWorkspace assetCode="ELB" lines={lines} source="real"
      decisions={[]} setDecisions={noop} onUpload={noop} onClear={noop} />)
    expect(screen.getAllByText(/ELB-TOP/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/build-up/).length).toBeGreaterThan(0)
    expect(screen.getByText(/real sourced lines/)).toBeInTheDocument()
  })

  it('labels modeled lines as modeled and offers upload + export', () => {
    render(<ChallengeWorkspace assetCode="MEB+DEB" lines={lines} source="modeled"
      decisions={[]} setDecisions={noop} onUpload={noop} onClear={noop} />)
    expect(screen.getByText(/modeled should-cost lines/)).toBeInTheDocument()
    expect(screen.getByText(/upload real lines/)).toBeInTheDocument()
    expect(screen.getByText(/export write-back/)).toBeInTheDocument()
  })
})
