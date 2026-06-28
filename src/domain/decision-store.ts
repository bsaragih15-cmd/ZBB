import type { Decision } from './types'

const KEY = 'mpi-zbb-decisions'

export function upsertDecision(store: Decision[], d: Decision): Decision[] {
  const next = store.filter((x) => x.budget_code !== d.budget_code)
  next.push(d)
  return next
}

export function totalCommittedSaving(store: Decision[]): number {
  return store.reduce((s, d) => s + d.committed_saving_idr, 0)
}

export function gapToTarget(targetGapIdr: number, store: Decision[]): number {
  return Math.max(0, targetGapIdr - totalCommittedSaving(store))
}

export function loadDecisions(): Decision[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
export function saveDecisions(store: Decision[]): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}
