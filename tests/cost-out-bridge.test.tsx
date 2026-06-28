import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CostOutBridge } from '../src/screens/CostOutBridge'
import type { Fleet, Decision } from '../src/domain/types'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'MRPR',
  assets: [{ code: 'MEB', full_name: 'Mitra Energi Batam', mw: 82.1, technology: 'Gas CCGT',
    controllable_om_idr: 78.6e9, controllable_om_rp_bn: 78.6, usd_per_kw_yr: 58.0, unit_scale: 1, cost_blocks: [] }],
}
const decisions: Decision[] = [{ budget_code: 'ELB-X', outcome: 'cut', lever: 'challenge',
  committed_saving_idr: 4e9, note: '', decided_at: '2026-06-28T00:00:00Z' }]

describe('CostOutBridge', () => {
  it('shows committed savings total', () => {
    render(<CostOutBridge fleet={fleet} decisions={decisions} />)
    expect(screen.getByText(/4.0/)).toBeInTheDocument()
  })
})
