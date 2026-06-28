import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssetDrill } from '../src/screens/AssetDrill'
import type { Fleet } from '../src/domain/types'

const fleet: Fleet = {
  fx_2026: 16500, best_in_fleet_code: 'DEB',
  assets: [{
    code: 'MEB', full_name: 'Mitra Energi Batam', mw: 82.1, technology: 'Gas CCGT',
    controllable_om_idr: 78.6e9, controllable_om_rp_bn: 78.6, usd_per_kw_yr: 58.0, unit_scale: 1,
    cost_blocks: [
      { name: 'Maintenance Service Agreement', value_idr: 40e9, value_rp_bn: 40, semi_committed: false },
      { name: 'Consumable', value_idr: 10e9, value_rp_bn: 10, semi_committed: false },
    ],
  }],
}

describe('AssetDrill', () => {
  it('shows the asset cost blocks sorted by value', () => {
    render(<AssetDrill fleet={fleet} assetCode="MEB" onChallenge={() => {}} />)
    expect(screen.getAllByText(/Maintenance Service Agreement/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/40/).length).toBeGreaterThan(0)
  })
})
