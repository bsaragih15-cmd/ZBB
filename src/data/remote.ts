import { supabase, isSupabaseEnabled } from '../lib/supabase'
import type { Decision } from '../domain/types'

/**
 * Remote data access against Supabase. Every function degrades gracefully:
 * when Supabase is not configured (or a call fails) it returns null/throws so
 * callers can fall back to the bundled static JSON + localStorage.
 */

/** Raw fleet shape as stored in the JSON file / expected by parseFleet. */
export interface RawFleet {
  fx_2026: number
  best_in_fleet_code: string
  assets: Array<{
    code: string
    full_name: string
    mw: number
    technology: string
    controllable_om_idr: number
    controllable_om_rp_bn: number
    usd_per_kw_yr: number
    unit_scale: number
    availability_pct?: number | null
    forced_outage_rate?: number | null
    cost_blocks: Array<{ name: string; value_idr: number; value_rp_bn: number; semi_committed: boolean }>
  }>
}

/** Rebuild the raw fleet object from the normalized Supabase tables. */
export async function fetchFleetFromSupabase(): Promise<RawFleet | null> {
  if (!isSupabaseEnabled || !supabase) return null
  const [meta, assets, blocks] = await Promise.all([
    supabase.from('fleet_meta').select('fx_2026, best_in_fleet_code').eq('id', 1).single(),
    supabase.from('assets').select('*'),
    supabase.from('cost_blocks').select('asset_code, name, value_idr, semi_committed'),
  ])
  if (meta.error || assets.error || blocks.error) {
    console.warn('[zbb] Supabase fleet fetch failed, falling back to static JSON', meta.error || assets.error || blocks.error)
    return null
  }
  if (!assets.data?.length) return null

  return {
    fx_2026: Number(meta.data.fx_2026),
    best_in_fleet_code: meta.data.best_in_fleet_code,
    assets: assets.data.map((a) => {
      const cost_blocks = (blocks.data ?? [])
        .filter((b) => b.asset_code === a.code)
        .map((b) => ({
          name: b.name,
          value_idr: Number(b.value_idr),
          value_rp_bn: Number(b.value_idr) / 1e9,
          semi_committed: Boolean(b.semi_committed),
        }))
      return {
        code: a.code,
        full_name: a.full_name,
        mw: Number(a.mw),
        technology: a.technology,
        controllable_om_idr: Number(a.controllable_om_idr),
        controllable_om_rp_bn: Number(a.controllable_om_idr) / 1e9,
        usd_per_kw_yr: Number(a.usd_per_kw_yr),
        unit_scale: Number(a.unit_scale ?? 1),
        availability_pct: a.availability_pct,
        forced_outage_rate: a.forced_outage_rate,
        cost_blocks,
      }
    }),
  }
}

/** Load all challenge decisions from Supabase. Returns null on failure. */
export async function fetchDecisionsFromSupabase(): Promise<Decision[] | null> {
  if (!isSupabaseEnabled || !supabase) return null
  const { data, error } = await supabase.from('decisions').select('*')
  if (error) {
    console.warn('[zbb] Supabase decisions fetch failed', error)
    return null
  }
  return (data ?? []).map((d) => ({
    budget_code: d.budget_code,
    outcome: d.outcome,
    lever: d.lever,
    committed_saving_idr: Number(d.committed_saving_idr),
    note: d.note ?? '',
    decided_at: d.decided_at,
  }))
}

/** Upsert one decision to Supabase and append an audit-log entry. */
export async function saveDecisionToSupabase(d: Decision): Promise<boolean> {
  if (!isSupabaseEnabled || !supabase) return false
  const { error } = await supabase.from('decisions').upsert({
    budget_code: d.budget_code,
    outcome: d.outcome,
    lever: d.lever,
    committed_saving_idr: d.committed_saving_idr,
    note: d.note,
    decided_at: d.decided_at,
  })
  if (error) {
    console.warn('[zbb] Supabase decision upsert failed', error)
    return false
  }
  await supabase.from('audit_log').insert({
    entity: 'decision',
    entity_id: d.budget_code,
    action: 'upsert',
    payload: d,
  })
  return true
}
