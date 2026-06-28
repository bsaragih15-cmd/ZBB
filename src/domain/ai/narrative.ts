import type { Flag } from '../types'

const rpBn = (idr: number) => (idr / 1e9).toFixed(2)

export function narrate(f: Flag): string {
  return `This line is flagged against the ${f.baseline_label}. ` +
    `${f.message}. The challengeable excess above the defensible baseline is ` +
    `Rp ${rpBn(f.excess_idr)} Bn (confidence ${(f.confidence * 100).toFixed(0)}%).`
}

export function challengeQuestion(f: Flag): string {
  switch (f.family) {
    case 'variance':
      return `Why does ${f.budget_code} rise faster than inflation versus last year, and what justifies the Rp ${rpBn(f.excess_idr)} Bn above the inflation-adjusted baseline?`
    case 'plausibility':
      return `What basis supports the unit rate on ${f.budget_code}, given it sits outside the plausible band for this cost block?`
    case 'cross-asset':
      return `Why is ${f.budget_code} above the best-in-fleet peer by Rp ${rpBn(f.excess_idr)} Bn, and what would it take to match them?`
    case 'integrity':
      return `${f.budget_code} is booked as a lump sum with no Qty × Rate build-up — what volume and unit rate justify Rp ${rpBn(f.excess_idr)} Bn, and what is the basis of estimate?`
    default:
      return `What is the basis for ${f.budget_code}?`
  }
}
