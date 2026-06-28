import type { Flag } from './types'
export function score(f: Pick<Flag, 'excess_idr' | 'confidence'>): number {
  return f.excess_idr * f.confidence
}
