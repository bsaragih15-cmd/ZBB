import type { Decision } from './types'
import { fetchDecisionsFromSupabase, saveDecisionToSupabase } from '../data/remote'

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

/**
 * Load decisions from the shared Supabase backend, falling back to the local
 * cache. Mirrors the remote result into localStorage so the app stays usable
 * offline after a successful sync.
 */
export async function loadDecisionsRemote(): Promise<Decision[]> {
  try {
    const remote = await fetchDecisionsFromSupabase()
    if (remote) { saveDecisions(remote); return remote }
  } catch (e) {
    console.warn('[zbb] remote decisions load failed, using local cache', e)
  }
  return loadDecisions()
}

/**
 * Persist a single decision: write to Supabase (best-effort) and always mirror
 * the full store to localStorage so nothing is lost if the backend is down.
 */
export async function persistDecision(store: Decision[], d: Decision): Promise<Decision[]> {
  const next = upsertDecision(store, d)
  saveDecisions(next)
  await saveDecisionToSupabase(d)
  return next
}
