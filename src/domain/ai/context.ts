import type { Fleet } from '../types'
import {
  buildCockpitMatrix, sortedAssets, fleetTotal, fleetBestKw, fleetBestCode,
  fleetBestStake, rpBn,
} from '../cockpit-model'

/**
 * Build a compact, factual grounding context for the AI Copilot from the live
 * fleet data and the user's current view. Kept small (a few hundred tokens) so
 * Claude reasons over exact rupiah figures without a tool round-trip.
 */
export function buildCopilotContext(
  fleet: Fleet,
  opts: { cap?: number; screen?: string; activeAsset?: string; activeBlock?: string } = {},
): string {
  const cap = opts.cap ?? 0.5
  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet)
  const total = fleetTotal(fleet)
  const bestKw = fleetBestKw(fleet)
  const bestCode = fleetBestCode(fleet)
  const stake = fleetBestStake(fleet, cap)
  const stretch = matrix.reduce((s, r) => s + r.total_gap_idr, 0)

  const lines: string[] = []
  lines.push(`FX (IDR/USD) 2026: ${fx}. Best-in-fleet: ${bestCode} at $${bestKw.toFixed(1)}/kW-yr.`)
  lines.push(`Total controllable O&M (ex-fuel), 2026 budget: Rp ${rpBn(total)} Bn across ${assets.length} entities.`)
  lines.push(`Capture dial currently at ${Math.round(cap * 100)}% of gap-to-best → frees Rp ${rpBn(stake.tot)} Bn (full gap on every line = Rp ${rpBn(stretch)} Bn).`)
  if (opts.screen) lines.push(`User is viewing: ${opts.screen}${opts.activeAsset ? ` · asset ${opts.activeAsset}` : ''}${opts.activeBlock ? ` · block ${opts.activeBlock}` : ''}.`)

  lines.push('')
  lines.push('ENTITIES ($/kW-yr | controllable Rp Bn | gap-to-best Rp Bn at current capture):')
  for (const a of assets) {
    const gap = stake.by[a.code] ?? 0
    const tag = a.code === bestCode ? ' [best-in-fleet]' : ''
    lines.push(`- ${a.code} (${a.full_name}, ${a.mw} MW, ${a.technology}): $${a.usd_per_kw_yr.toFixed(1)} | Rp ${rpBn(a.controllable_om_idr)} | Rp ${rpBn(gap)}${tag}`)
  }

  lines.push('')
  lines.push('COST LINES (L3) — $/kW-yr best vs fleet, full gap-to-best Rp Bn, semi-committed?:')
  const rows = [...matrix].sort((a, b) => b.total_gap_idr - a.total_gap_idr)
  for (const r of rows) {
    const semi = r.semi ? ' [semi-committed: needs contract action]' : ''
    lines.push(`- ${r.block}: best ${r.best_code} $${r.best.toFixed(1)}/kW, full gap Rp ${rpBn(r.total_gap_idr)} Bn${semi}`)
  }

  return lines.join('\n')
}
