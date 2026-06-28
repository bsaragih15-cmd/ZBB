import type { Asset } from './types'

/** Normalise one cost-block value to $/kW-yr so dissimilar-size assets compare. */
export function blockUsdPerKw(valueIdr: number, mw: number, fx: number): number {
  return valueIdr / (mw * 1000) / fx
}

export interface MatrixCell {
  asset_code: string
  mw: number
  value_idr: number
  usd_per_kw: number
  is_best: boolean
  /** rupiah this asset spends above best-in-fleet for this block (0 if it is best). */
  gap_idr: number
}

export interface MatrixRow {
  block: string
  semi_committed: boolean
  best_code: string
  best_usd_per_kw: number
  cells: MatrixCell[]
  /** sum of positive gaps across all assets for this block. */
  total_gap_idr: number
}

/**
 * Cross-asset cost matrix: each row is a cost block, each cell an asset's $/kW-yr,
 * benchmarked to the best (lowest $/kW) asset in the fleet for that block.
 * The gap is expressed in absolute rupiah at the laggard's own MW so it is additive.
 */
export function buildCostMatrix(assets: Asset[], fx: number): MatrixRow[] {
  // Stable block order: union of names, ordered by total fleet rupiah descending.
  const totals = new Map<string, number>()
  const semi = new Map<string, boolean>()
  for (const a of assets) {
    for (const b of a.cost_blocks) {
      totals.set(b.name, (totals.get(b.name) ?? 0) + b.value_idr)
      if (b.semi_committed) semi.set(b.name, true)
    }
  }
  const blockNames = [...totals.keys()].sort((x, y) => (totals.get(y)! - totals.get(x)!))

  return blockNames.map((name) => {
    const raw = assets.map((a) => {
      const b = a.cost_blocks.find((x) => x.name === name)
      const value_idr = b?.value_idr ?? 0
      return { asset_code: a.code, mw: a.mw, value_idr, usd_per_kw: blockUsdPerKw(value_idr, a.mw, fx) }
    })
    const best_usd_per_kw = Math.min(...raw.map((c) => c.usd_per_kw))
    const best_code = raw.find((c) => c.usd_per_kw === best_usd_per_kw)!.asset_code

    let total_gap_idr = 0
    const cells: MatrixCell[] = raw.map((c) => {
      const benchValue = best_usd_per_kw * c.mw * 1000 * fx
      const gap_idr = Math.max(0, c.value_idr - benchValue)
      total_gap_idr += gap_idr
      return {
        asset_code: c.asset_code, mw: c.mw, value_idr: c.value_idr,
        usd_per_kw: c.usd_per_kw, is_best: c.usd_per_kw === best_usd_per_kw, gap_idr,
      }
    })
    return { block: name, semi_committed: semi.get(name) ?? false, best_code, best_usd_per_kw, cells, total_gap_idr }
  })
}

export interface FleetBestStake {
  total_idr: number
  best_usd_per_kw_yr: number
  best_code: string
  by_asset: Record<string, number>
}

/**
 * Realistic, headline value-at-stake: bring every asset's TOTAL controllable $/kW-yr
 * down to the best plant in the fleet, capturing only `capturePct` (0..1) of the gap.
 * Coherent with the benchmark bar (the best plant has zero gap).
 */
export function valueAtStakeToFleetBest(
  assets: Asset[], fx: number, capturePct: number,
): FleetBestStake {
  const best = Math.min(...assets.map((a) => a.usd_per_kw_yr))
  const best_code = assets.find((a) => a.usd_per_kw_yr === best)!.code
  const by_asset: Record<string, number> = {}
  let total_idr = 0
  for (const a of assets) {
    const gap = Math.max(0, a.usd_per_kw_yr - best) * a.mw * 1000 * fx * capturePct
    by_asset[a.code] = gap
    total_idr += gap
  }
  return { total_idr, best_usd_per_kw_yr: best, best_code, by_asset }
}

export interface ValueAtStake {
  total_idr: number
  by_asset: Record<string, number>
  by_block: Record<string, number>
}

/** Roll up the matrix gaps, capturing only `capturePct` (0..1) of each gap-to-best. */
export function valueAtStake(matrix: MatrixRow[], capturePct: number): ValueAtStake {
  const by_asset: Record<string, number> = {}
  const by_block: Record<string, number> = {}
  let total_idr = 0
  for (const row of matrix) {
    by_block[row.block] = row.total_gap_idr * capturePct
    for (const cell of row.cells) {
      const captured = cell.gap_idr * capturePct
      by_asset[cell.asset_code] = (by_asset[cell.asset_code] ?? 0) + captured
      total_idr += captured
    }
  }
  return { total_idr, by_asset, by_block }
}
