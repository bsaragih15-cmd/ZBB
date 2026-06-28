import type { Severity } from './types'

interface BenchAsset {
  code: string
  mw: number
  usd_per_kw_yr: number
  controllable_om_idr: number
}

export function gapToBestInFleet(a: BenchAsset, benchmarkUsdPerKwYr: number, fx: number): number {
  const gapUsdPerKw = a.usd_per_kw_yr - benchmarkUsdPerKwYr
  if (gapUsdPerKw <= 0) return 0
  return gapUsdPerKw * a.mw * 1000 * fx
}

function severityFromGap(gapRpBn: number): Severity {
  if (gapRpBn >= 8) return 'high'
  if (gapRpBn >= 3) return 'medium'
  return 'low'
}

export interface BenchmarkResult extends BenchAsset {
  benchmark_usd_per_kw_yr: number
  gap_idr: number
  gap_rp_bn: number
  severity: Severity
}

export function benchmarkFleet(assets: BenchAsset[], fx: number): BenchmarkResult[] {
  const batam = assets.filter((a) => a.mw < 150)
  const batamBest = Math.min(...batam.map((a) => a.usd_per_kw_yr))
  return assets.map((a) => {
    const bench = a.mw < 150 ? batamBest : a.usd_per_kw_yr
    const gap_idr = gapToBestInFleet(a, bench, fx)
    const gap_rp_bn = gap_idr / 1e9
    return {
      ...a,
      benchmark_usd_per_kw_yr: bench,
      gap_idr,
      gap_rp_bn,
      severity: severityFromGap(gap_rp_bn),
    }
  })
}
