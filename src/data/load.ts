import type { Fleet, Line } from '../domain/types'

export function parseFleet(raw: any): Fleet {
  const assets = [...raw.assets].sort((a, b) => b.usd_per_kw_yr - a.usd_per_kw_yr)
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
