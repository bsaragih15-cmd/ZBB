import type { Line, Flag } from '../types'

export function checkIntegrity(line: Line): Flag[] {
  const flags: Flag[] = []
  const mk = (message: string): Flag => ({
    budget_code: line.budget_code,
    family: 'integrity',
    severity: 'high',
    message,
    baseline_label: 'integrity rule',
    excess_idr: 0,
    confidence: 1,
    score: 0,
  })

  if (line.qty == null || line.rate_idr == null) {
    flags.push(mk('lump-sum line: missing Qty x Rate build-up'))
  }
  if (line.original_currency.toUpperCase() === 'USD' && (!line.fx || line.fx <= 0)) {
    flags.push(mk('USD line missing FX rate'))
  }
  if (!line.basis_of_estimate.trim()) {
    flags.push(mk('missing basis of estimate'))
  }
  if (line.qty != null && line.rate_idr != null) {
    const computed = line.qty * (line.freq ?? 1) * line.rate_idr
    if (computed > 0 && Math.abs(computed - line.value_idr) / line.value_idr > 0.01) {
      flags.push(mk(`unit-scale anomaly: Qty x Freq x Rate = ${Math.round(computed)} but value = ${line.value_idr}`))
    }
  }
  return flags
}
