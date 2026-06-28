import type { Line, Flag } from '../types'

export function checkCrossAsset(line: Line, peerBestValueIdr: number | null): Flag | null {
  if (peerBestValueIdr == null || line.value_idr <= peerBestValueIdr) return null
  const excess = line.value_idr - peerBestValueIdr
  return {
    budget_code: line.budget_code, family: 'cross-asset',
    severity: excess / 1e9 >= 1 ? 'high' : 'medium',
    message: `above best-in-fleet peer for ${line.cost_block} by Rp ${(excess / 1e9).toFixed(2)} Bn`,
    baseline_label: 'best-in-fleet peer', excess_idr: excess, confidence: 0.8, score: 0,
  }
}
