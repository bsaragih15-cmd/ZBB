import type { Asset, Fleet, Line } from '../domain/types'
import { l5lines } from '../domain/cockpit-model'
import { loadElbLines } from './load'

/**
 * Resolves the L5 line-items for an asset, from the best source available:
 *   1. uploaded   — real lines a user dropped in (localStorage), per asset
 *   2. real       — sourced lines bundled in the repo (ELB today)
 *   3. modeled    — driver-based should-cost lines generated from the block totals
 * so every plant drills to L5 and can be challenged, with the source made explicit.
 */
export type LineSource = 'uploaded' | 'real' | 'modeled'

const KEY = (code: string) => `mpi-zbb-lines:${code}`

/** Driver-based modeled lines for one asset, derived from its cost blocks. */
export function modeledLinesForAsset(asset: Asset, fx: number): Line[] {
  const out: Line[] = []
  for (const b of asset.cost_blocks) {
    for (const l of l5lines(asset, b.name)) {
      out.push({
        budget_code: l.bc,
        cost_block: b.name,
        l3_activity: b.name,
        l4_equipment: `${l.fam} · ${l.item}`,
        qty: l.qty,
        freq: l.freq,
        rate_idr: l.fxlbl === 'USD' ? l.rate * fx : l.rate,
        fx: l.fxlbl === 'USD' ? fx : 1,
        original_currency: l.fxlbl,
        value_idr: l.value,
        basis_of_estimate: l.basis,
      })
    }
  }
  return out
}

export function loadUploadedLines(code: string): Line[] | null {
  try {
    const raw = localStorage.getItem(KEY(code))
    return raw ? (JSON.parse(raw) as Line[]) : null
  } catch { return null }
}

export function saveUploadedLines(code: string, lines: Line[]): void {
  localStorage.setItem(KEY(code), JSON.stringify(lines))
}

export function clearUploadedLines(code: string): void {
  localStorage.removeItem(KEY(code))
}

/** Resolve the best available lines for an asset, with the source tag. */
export async function resolveLines(asset: Asset, fleet: Fleet): Promise<{ lines: Line[]; source: LineSource }> {
  const uploaded = loadUploadedLines(asset.code)
  if (uploaded?.length) return { lines: uploaded, source: 'uploaded' }
  if (asset.code === 'Asset 2') { // sanitised code for the plant with real sourced lines
    try {
      const real = await loadElbLines()
      if (real?.length) return { lines: real, source: 'real' }
    } catch { /* fall through to modeled */ }
  }
  return { lines: modeledLinesForAsset(asset, fleet.fx_2026), source: 'modeled' }
}

/**
 * Parse an uploaded CSV of real lines into Line[]. Expected headers (case-insensitive,
 * extra columns ignored): budget_code, cost_block, l3_activity, l4_equipment, qty,
 * freq, rate_idr, fx, original_currency, value_idr, basis_of_estimate.
 * value_idr is required; if absent it is computed as qty×freq×rate_idr×fx.
 */
export function parseLinesCsv(text: string): Line[] {
  const rows = splitCsv(text)
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)
  const num = (s: string | undefined) => {
    if (s == null || s === '') return null
    const n = Number(String(s).replace(/[, ]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  const out: Line[] = []
  for (let r = 1; r < rows.length; r++) {
    const c = rows[r]
    if (!c.length || c.every((x) => x.trim() === '')) continue
    const get = (name: string) => { const i = idx(name); return i >= 0 ? c[i]?.trim() : undefined }
    const qty = num(get('qty'))
    const freq = num(get('freq'))
    const rate = num(get('rate_idr'))
    const fx = num(get('fx')) ?? 1
    const value = num(get('value_idr')) ?? ((qty ?? 0) * (freq ?? 1) * (rate ?? 0) * fx)
    out.push({
      budget_code: get('budget_code') ?? `UP-${r}`,
      cost_block: get('cost_block') ?? 'Uncategorized',
      l3_activity: get('l3_activity') ?? '',
      l4_equipment: get('l4_equipment') ?? '',
      qty, freq, rate_idr: rate, fx,
      original_currency: get('original_currency') ?? 'IDR',
      value_idr: value,
      basis_of_estimate: get('basis_of_estimate') ?? 'uploaded',
    })
  }
  return out
}

/** Minimal CSV splitter handling quoted fields and commas/newlines within quotes. */
function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false }
      else field += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}
