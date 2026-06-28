import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
// NOTE: deviation from plan — MEB legitimately appears in multiple nodes
// (headline, guardrail row, drill button), so the verbatim getByText(/MEB/)
// throws on multiple matches. Use getAllByText to assert presence.
import { FleetCockpit } from '../src/screens/FleetCockpit'
import type { Fleet } from '../src/domain/types'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'MRPR',
  assets: [
    { code: 'MEB', full_name: 'Mitra Energi Batam', mw: 82.1, technology: 'Gas CCGT',
      controllable_om_idr: 78.6e9, controllable_om_rp_bn: 78.6, usd_per_kw_yr: 58.0,
      unit_scale: 1, cost_blocks: [] },
    { code: 'DEB', full_name: 'Dalle Energy Batam', mw: 76, technology: 'Gas CCGT',
      controllable_om_idr: 63.9e9, controllable_om_rp_bn: 63.9, usd_per_kw_yr: 50.9,
      unit_scale: 1, cost_blocks: [] },
  ],
}

describe('FleetCockpit', () => {
  it('renders the worst asset and its $/kW-yr', () => {
    render(<FleetCockpit fleet={fleet} onDrill={() => {}} />)
    expect(screen.getAllByText(/MEB/).length).toBeGreaterThan(0)
    expect(screen.getByText(/58/)).toBeInTheDocument()
  })
})
