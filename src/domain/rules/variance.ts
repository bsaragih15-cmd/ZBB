import type { Line, Flag } from '../types'

export interface History {
  prior_value_idr: number | null
}

export function checkVariance(line: Line, history: History, inflation: number): Flag | null {
  if (history.prior_value_idr == null) {
    return {
      budget_code: line.budget_code, family: 'variance', severity: 'medium',
      message: 'new line with no prior-year history (zero-base it)',
      baseline_label: 'prior year (none)', excess_idr: 0, confidence: 0.6,
      score: 0,
    }
  }
  const defensible = history.prior_value_idr * (1 + inflation)
  const excess = line.value_idr - defensible
  if (excess <= 0) return null
  return {
    budget_code: line.budget_code, family: 'variance',
    severity: excess / 1e9 >= 1 ? 'high' : 'medium',
    message: `YoY +${((line.value_idr / history.prior_value_idr - 1) * 100).toFixed(0)}% vs prior, above ${(inflation * 100).toFixed(0)}% inflation`,
    baseline_label: 'prior year + inflation',
    excess_idr: excess, confidence: 0.9, score: 0,
  }
}
