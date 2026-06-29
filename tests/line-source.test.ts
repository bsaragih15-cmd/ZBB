import { describe, it, expect } from 'vitest'
import type { Asset } from '../src/domain/types'
import { parseLinesCsv, modeledLinesForAsset } from '../src/data/line-source'
import { buildWriteBack, writeBackCsv } from '../src/domain/export'

const asset: Asset = {
  code: 'MEB+DEB', full_name: 'Batam', mw: 158, technology: 'Gas CCGT',
  controllable_om_idr: 142e9, controllable_om_rp_bn: 142, usd_per_kw_yr: 54.6, unit_scale: 1,
  cost_blocks: [
    { name: 'Consumable', value_idr: 8e9, value_rp_bn: 8, semi_committed: false },
    { name: 'Salary & Allowance', value_idr: 30e9, value_rp_bn: 30, semi_committed: false },
  ],
}

describe('line-source', () => {
  it('models driver lines for any asset, summing ~ to each block total', () => {
    const lines = modeledLinesForAsset(asset, 16500)
    expect(lines.length).toBeGreaterThan(0)
    const con = lines.filter((l) => l.cost_block === 'Consumable').reduce((s, l) => s + l.value_idr, 0)
    expect(con).toBeGreaterThan(7.5e9) // back-solved to ~block total
    expect(con).toBeLessThan(8.5e9)
    expect(lines.every((l) => l.budget_code.startsWith('MEB+DEB-'))).toBe(true)
  })

  it('parses a CSV with header into Line[], computing value when omitted', () => {
    const csv = [
      'budget_code,cost_block,l4_equipment,qty,freq,rate_idr,fx,original_currency,value_idr,basis_of_estimate',
      'A-1,Consumable,Chlorine,10,2,500000,1,IDR,,vendor quote',
      'A-2,"Maintenance Cost","Filter, set",,,,,IDR,3000000,contract',
    ].join('\n')
    const lines = parseLinesCsv(csv)
    expect(lines).toHaveLength(2)
    expect(lines[0].value_idr).toBe(10 * 2 * 500000 * 1) // computed
    expect(lines[1].cost_block).toBe('Maintenance Cost')
    expect(lines[1].l4_equipment).toBe('Filter, set') // quoted comma preserved
  })
})

describe('write-back CSV', () => {
  it('serializes approved budget rows keyed on budget code', () => {
    const lines = modeledLinesForAsset(asset, 16500).slice(0, 2)
    const decisions = [{
      budget_code: lines[0].budget_code, outcome: 'cut' as const, lever: 'optimize' as const,
      committed_saving_idr: 1e9, note: '', decided_at: '2026-01-01',
    }]
    const csv = writeBackCsv(buildWriteBack(lines, decisions))
    expect(csv.split('\n')[0]).toContain('budget_code')
    expect(csv).toContain('committed_saving_idr')
    expect(csv).toContain(lines[0].budget_code)
  })
})
