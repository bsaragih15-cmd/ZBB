import type { Fleet, Asset, CostBlock } from '../domain/types'
import type { Line } from '../domain/types'

/**
 * MEB and DEB share the Batam site, O&M crew, and management overhead, so the
 * CFO budgets them as one entity. Merge the two raw assets into a single
 * "MEB+DEB" entity: sum every cost block and the controllable total, add the
 * MW, and recompute the weighted $/kW-yr. Returns the asset list unchanged if
 * either plant is missing (keeps the unit test fixtures working).
 */
export function combineBatam(assets: any[], fx: number): any[] {
  const meb = assets.find((a) => a.code === 'MEB')
  const deb = assets.find((a) => a.code === 'DEB')
  if (!meb || !deb) return assets

  const blockNames: string[] = []
  for (const a of [meb, deb]) for (const b of a.cost_blocks) if (!blockNames.includes(b.name)) blockNames.push(b.name)
  const cost_blocks: CostBlock[] = blockNames.map((name) => {
    const mb = meb.cost_blocks.find((x: CostBlock) => x.name === name)
    const db = deb.cost_blocks.find((x: CostBlock) => x.name === name)
    const value_idr = (mb?.value_idr ?? 0) + (db?.value_idr ?? 0)
    return { name, value_idr, value_rp_bn: value_idr / 1e9, semi_committed: Boolean(mb?.semi_committed || db?.semi_committed) }
  })

  const mw = meb.mw + deb.mw
  const controllable_om_idr = meb.controllable_om_idr + deb.controllable_om_idr
  const combined: Asset = {
    code: 'MEB+DEB',
    full_name: 'Batam Combined · MEB + DEB',
    mw,
    technology: meb.technology,
    controllable_om_idr,
    controllable_om_rp_bn: controllable_om_idr / 1e9,
    usd_per_kw_yr: controllable_om_idr / (mw * 1000) / fx,
    unit_scale: 1,
    cost_blocks,
  }
  return [...assets.filter((a) => a.code !== 'MEB' && a.code !== 'DEB'), combined]
}

export function parseFleet(raw: any): Fleet {
  const merged = combineBatam(raw.assets, raw.fx_2026)
  const assets = [...merged].sort((a, b) => b.usd_per_kw_yr - a.usd_per_kw_yr)
  return { fx_2026: raw.fx_2026, best_in_fleet_code: raw.best_in_fleet_code, assets }
}

export async function loadFleet(): Promise<Fleet> {
  const res = await fetch('/data/fleet.json')
  return parseFleet(await res.json())
}

export async function loadElbLines(): Promise<Line[]> {
  const res = await fetch('/data/elb_lines.json')
  return (await res.json()).lines
}
