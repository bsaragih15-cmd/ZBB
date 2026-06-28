import type { Asset, Fleet } from './types'

/* ---------- format helpers ---------- */
export const rpBn = (idr: number) => (idr / 1e9).toFixed(1)
export const rpBn2 = (idr: number) => (idr / 1e9).toFixed(2)
export const fmt = (n: number) => n.toLocaleString('en-US')
export const usdKw = (idr: number, mw: number, fx: number) => idr / (mw * 1000) / fx

/* ---------- L4 driver-family catalog ---------- */
export type DriverType = 'throughput' | 'event' | 'population' | 'headcount' | 'contract'

export const DRV_FORMULA: Record<DriverType, string> = {
  throughput: 'dose/rate × volume treated → Qty × Unit Rate × FX',
  event: 'events/yr × charge per event × Unit Rate',
  population: 'equipment count × charge × (1 / change-interval)',
  headcount: 'FTE × fully-loaded cost per FTE',
  contract: 'contracted value × escalation (lump, justify basis)',
}

export const L4: Record<string, [string, DriverType, number][]> = {
  'Maintenance Service Agreement': [['LTSA fixed fee', 'contract', 0.7], ['LTSA variable — fired-hours / starts', 'throughput', 0.3]],
  'Maintenance Cost': [['Planned outage materials & parts', 'event', 0.45], ['Routine spares & wear parts', 'population', 0.35], ['Predictive / condition monitoring', 'contract', 0.2]],
  'Consumable': [['Disinfection / oxidants', 'throughput', 0.34], ['Coagulants & flocculants', 'throughput', 0.18], ['Boiler / HRSG water chemistry', 'throughput', 0.18], ['Lubricants & greases', 'population', 0.16], ['Gases & lab reagents', 'throughput', 0.14]],
  'Salary & Allowance': [['Base salary — O&M headcount', 'headcount', 0.68], ['Allowances & shift premium', 'headcount', 0.22], ['Overtime', 'headcount', 0.1]],
  'Professional Service': [['Engineering & technical advisory', 'contract', 0.5], ['Audit, legal & compliance', 'contract', 0.3], ['Permitting & certification', 'event', 0.2]],
  'Rental': [['Equipment & tooling rental', 'contract', 0.6], ['Vehicles & site facilities', 'contract', 0.4]],
  'Contract Service': [['Security & site services', 'contract', 0.4], ['Cleaning & grounds', 'contract', 0.3], ['Specialist field services', 'event', 0.3]],
  'Transportation': [['Fuel & vehicle running', 'throughput', 0.5], ['Logistics & freight', 'event', 0.5]],
  'Other Opex': [['Travel & subsistence', 'headcount', 0.4], ['Office & admin', 'contract', 0.35], ['Misc operating', 'contract', 0.25]],
  'Insurance': [['Property & machinery breakdown', 'contract', 1.0]],
  'Management Fees': [['Group management fee', 'contract', 1.0]],
}

interface ItemHint { item: string; uom: string; rate: number; freq: number; basis: string; usd?: boolean }
export const ITEM: Record<string, ItemHint> = {
  'Disinfection / oxidants': { item: 'Sodium Hypochlorite 10%', uom: 'drum', rate: 2750000, freq: 1, basis: 'vendor quote' },
  'Coagulants & flocculants': { item: 'PAC 250-AN coagulant', uom: 'kg', rate: 9500, freq: 1, basis: 'vendor quote' },
  'Boiler / HRSG water chemistry': { item: 'O2 scavenger + corr. inhibitor', uom: 'kg', rate: 42000, freq: 1, basis: 'contract' },
  'Lubricants & greases': { item: 'Turbine lube oil ISO-VG32', uom: 'litre', rate: 38000, freq: 1, basis: 'market' },
  'Gases & lab reagents': { item: 'N2 / lab reagent pack', uom: 'bottle', rate: 1200000, freq: 1, basis: 'market', usd: true },
  'Planned outage materials & parts': { item: 'Hot-gas-path parts set', uom: 'set', rate: 1850000000, freq: 1, basis: 'OEM quote', usd: true },
  'Routine spares & wear parts': { item: 'Filters, seals, bearings', uom: 'lot', rate: 120000000, freq: 4, basis: 'run-rate' },
  'Predictive / condition monitoring': { item: 'Vibration / oil-analysis svc', uom: 'month', rate: 85000000, freq: 12, basis: 'contract' },
  'LTSA fixed fee': { item: 'LTSA fixed capacity fee', uom: 'month', rate: 0, freq: 12, basis: 'contract' },
  'LTSA variable — fired-hours / starts': { item: 'Per fired-hour charge', uom: 'EOH', rate: 0, freq: 1, basis: 'contract' },
  'Base salary — O&M headcount': { item: 'O&M staff — base', uom: 'FTE-yr', rate: 0, freq: 1, basis: 'HR run-rate' },
  'Allowances & shift premium': { item: 'Shift & field allowance', uom: 'FTE-yr', rate: 0, freq: 1, basis: 'HR policy' },
  'Overtime': { item: 'Overtime hours', uom: 'hr', rate: 95000, freq: 1, basis: 'run-rate' },
}

const BLOCK_CODE: Record<string, string> = {
  'Maintenance Service Agreement': 'MSA', 'Maintenance Cost': 'MNT', 'Consumable': 'CON',
  'Salary & Allowance': 'SAL', 'Professional Service': 'PRO', 'Rental': 'RNT',
  'Contract Service': 'CSV', 'Transportation': 'TRP', 'Other Opex': 'OPX',
  'Insurance': 'INS', 'Management Fees': 'MGT',
}
export const blockCode = (name: string) => BLOCK_CODE[name] ?? 'GEN'

export interface L5Line {
  fam: string; drv: DriverType; item: string; uom: string; qty: number; freq: number
  rate: number; fxlbl: 'IDR' | 'USD'; basis: string; bc: string; value: number
}

/** Back-solve representative L5 driver lines for one asset+block from the block total. */
export function l5lines(asset: Asset, blockName: string): L5Line[] {
  const blk = asset.cost_blocks.find((b) => b.name === blockName)
  if (!blk) return []
  const fams = L4[blockName] ?? [[blockName, 'contract', 1.0] as [string, DriverType, number]]
  let bc = 1
  const out: L5Line[] = []
  for (const [fam, drv, share] of fams) {
    const famVal = blk.value_idr * share
    if (famVal < 1) continue
    const hint = ITEM[fam] ?? { item: fam, uom: 'lot', rate: 0, freq: 1, basis: 'run-rate' }
    let rate = hint.rate
    const freq = hint.freq || 1
    let qty: number
    if (!rate) { rate = Math.round(famVal / freq); qty = 1 }
    else { qty = Math.max(1, Math.round(famVal / (rate * freq))) }
    out.push({
      fam, drv, item: hint.item, uom: hint.uom, qty, freq, rate,
      fxlbl: hint.usd ? 'USD' : 'IDR', basis: hint.basis,
      bc: `${asset.code}-${blockCode(blockName)}-${String(bc++).padStart(2, '0')}`,
      value: qty * freq * rate,
    })
  }
  return out
}

/* ---------- best-non-zero cross-asset matrix ---------- */
export interface CockpitCell { code: string; mw: number; value_idr: number; usd: number; is_best: boolean; gap_idr: number }
export interface CockpitRow { block: string; semi: boolean; best: number; best_code: string; cells: CockpitCell[]; total_gap_idr: number }

/** Assets sorted best -> worst by total $/kW-yr. */
export const sortedAssets = (fleet: Fleet) => [...fleet.assets].sort((a, b) => a.usd_per_kw_yr - b.usd_per_kw_yr)

/** Cross-asset matrix benchmarking each line to the cheapest NON-ZERO plant. */
export function buildCockpitMatrix(fleet: Fleet): CockpitRow[] {
  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const totals: Record<string, number> = {}
  const semi: Record<string, boolean> = {}
  const names: string[] = []
  const seen = new Set<string>()
  for (const a of fleet.assets) for (const b of a.cost_blocks) {
    totals[b.name] = (totals[b.name] ?? 0) + b.value_idr
    if (b.semi_committed) semi[b.name] = true
    if (!seen.has(b.name)) { seen.add(b.name); names.push(b.name) }
  }
  names.sort((x, y) => totals[y] - totals[x])
  return names.map((name) => {
    const raw = assets.map((a) => {
      const b = a.cost_blocks.find((x) => x.name === name)
      const v = b ? b.value_idr : 0
      return { code: a.code, mw: a.mw, value_idr: v, usd: usdKw(v, a.mw, fx) }
    })
    const nz = raw.filter((c) => c.usd > 0)
    const best = nz.length ? Math.min(...nz.map((c) => c.usd)) : 0
    const best_code = (nz.find((c) => c.usd === best) ?? raw[0]).code
    let total_gap_idr = 0
    const cells: CockpitCell[] = raw.map((c) => {
      const bench = best * c.mw * 1000 * fx
      const gap = Math.max(0, c.value_idr - bench)
      total_gap_idr += gap
      return { ...c, is_best: c.usd === best && c.usd > 0, gap_idr: gap }
    })
    return { block: name, semi: !!semi[name], best, best_code, cells, total_gap_idr }
  })
}

export const fleetTotal = (fleet: Fleet) => fleet.assets.reduce((s, a) => s + a.controllable_om_idr, 0)
export const fleetBestKw = (fleet: Fleet) => Math.min(...fleet.assets.map((a) => a.usd_per_kw_yr))
export const fleetBestCode = (fleet: Fleet) => {
  const best = fleetBestKw(fleet)
  return fleet.assets.find((a) => a.usd_per_kw_yr === best)!.code
}

export interface FleetStake { tot: number; by: Record<string, number> }
/** Realistic value-at-stake: bring each plant's total $/kW to fleet best, capturing `cap`. */
export function fleetBestStake(fleet: Fleet, cap: number): FleetStake {
  const fx = fleet.fx_2026
  const bestKw = fleetBestKw(fleet)
  const by: Record<string, number> = {}
  let tot = 0
  for (const a of fleet.assets) {
    const g = Math.max(0, a.usd_per_kw_yr - bestKw) * a.mw * 1000 * fx * cap
    by[a.code] = g
    tot += g
  }
  return { tot, by }
}

/** [bg, fg] tone for a heatmap cell vs the best-in-line. */
export function tone(usd: number, best: number, isBest: boolean): [string, string] {
  if (isBest || best === 0 || usd === 0) return ['rgba(52,211,153,0.14)', 'var(--green)']
  const r = usd / best
  if (r <= 1.15) return ['rgba(52,211,153,0.14)', 'var(--green)']
  if (r <= 1.6) return ['rgba(224,169,59,0.14)', 'var(--amber)']
  return ['rgba(248,113,106,0.14)', 'var(--red)']
}

export const dotColor = (gapBn: number, isBest: boolean) =>
  isBest ? 'var(--green)' : gapBn >= 8 ? 'var(--red)' : 'var(--amber)'

export const NUMWORD: Record<number, string> = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four' }
