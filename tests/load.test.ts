import { describe, it, expect } from 'vitest'
import { parseFleet } from '../src/data/load'

describe('parseFleet', () => {
  it('parses fleet JSON and exposes assets sorted worst-to-best $/kW-yr', () => {
    const raw = {
      fx_2026: 16500, best_in_fleet_code: 'MRPR',
      assets: [
        { code: 'MRPR', usd_per_kw_yr: 45.0, controllable_om_idr: 204.2e9, mw: 275, cost_blocks: [] },
        { code: 'MEB', usd_per_kw_yr: 58.0, controllable_om_idr: 78.6e9, mw: 82.1, cost_blocks: [] },
      ],
    }
    const fleet = parseFleet(raw)
    expect(fleet.assets[0].code).toBe('MEB')   // worst first
    expect(fleet.fx_2026).toBe(16500)
  })
})
