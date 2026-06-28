import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingPage } from '../src/screens/LandingPage'
import type { Fleet } from '../src/domain/types'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'MRPR',
  assets: [
    { code: 'MEB', full_name: 'Mitra Energi Batam', mw: 82.1, technology: 'Gas CCGT',
      controllable_om_idr: 78.6e9, controllable_om_rp_bn: 78.6, usd_per_kw_yr: 58.0, unit_scale: 1,
      cost_blocks: [
        { name: 'Salary & Allowance', value_idr: 29.3e9, value_rp_bn: 29.3, semi_committed: false },
        { name: 'Maintenance Cost', value_idr: 17.3e9, value_rp_bn: 17.3, semi_committed: false },
      ] },
    { code: 'MRPR', full_name: 'Medco Ratch Power Riau', mw: 275, technology: 'Gas CCGT',
      controllable_om_idr: 204.2e9, controllable_om_rp_bn: 204.2, usd_per_kw_yr: 45.0, unit_scale: 1,
      cost_blocks: [
        { name: 'Salary & Allowance', value_idr: 14.3e9, value_rp_bn: 14.3, semi_committed: false },
        { name: 'Maintenance Cost', value_idr: 33.3e9, value_rp_bn: 33.3, semi_committed: false },
      ] },
  ],
}

describe('LandingPage', () => {
  it('shows the four-asset benchmark with the best plant and a cost line', () => {
    render(<LandingPage fleet={fleet} onDrill={() => {}} />)
    expect(screen.getAllByText(/MRPR/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Salary & Allowance/)).toBeInTheDocument()
    // the laggard's value-at-stake is surfaced, and the best plant gets a badge
    expect(screen.getByText(/at stake/)).toBeInTheDocument()
    expect(screen.getAllByText(/best-in-fleet/).length).toBeGreaterThan(0)
  })
})
