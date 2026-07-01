import type { Fleet, Decision } from '../domain/types'
import type { BenchmarkMode } from '../domain/cockpit-model'
import {
  rpBn, buildCockpitMatrix, sortedAssets, fleetTotal, fleetBestKw, fleetBestCode,
  fleetBestStake, NUMWORD,
} from '../domain/cockpit-model'
import { loadExternal, externalStakeRange } from '../domain/external-benchmark'
import { loadYoY, priorIdr } from '../domain/prior-year'
import { ownerFor } from '../domain/owners'

export function BoardPack({ fleet, benchMode = 'absolute', decisions = [] }:
  { fleet: Fleet; benchMode?: BenchmarkMode; decisions?: Decision[] }) {
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet, benchMode)
  const total = fleetTotal(fleet)
  const bestKw = fleetBestKw(fleet)
  const bestCode = fleetBestCode(fleet)
  const full = fleetBestStake(fleet, 1, benchMode)
  const nAbove = assets.filter((a) => (full.by[a.code] ?? 0) > 0).length
  const external = loadExternal()
  const extStake = externalStakeRange(fleet, external, 1)
  const yoy = loadYoY()

  // block-level rollups for the opportunity table
  const blockRows = matrix.map((m) => {
    const v2026 = fleet.assets.reduce((s, a) => s + (a.cost_blocks.find((b) => b.name === m.block)?.value_idr ?? 0), 0)
    const v2025 = fleet.assets.reduce((s, a) => {
      const v = a.cost_blocks.find((b) => b.name === m.block)?.value_idr ?? 0
      return s + (v ? priorIdr(m.block, v, yoy) : 0)
    }, 0)
    const yoyPct = v2025 > 0 ? v2026 / v2025 - 1 : 0
    const e = external[m.block]
    return { ...m, owner: ownerFor(m.block), yoyPct, ext: e }
  }).sort((a, b) => b.total_gap_idr - a.total_gap_idr)

  const committed = decisions.filter((d) => d.outcome !== 'defer' && d.committed_saving_idr > 0)
  const committedTot = committed.reduce((s, d) => s + d.committed_saving_idr, 0)
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="board-wrap">
      <div className="no-print board-actions">
        <button className="tab active" onClick={() => window.print()}>⤓ Export PDF</button>
        <span className="board-hint">Opens your browser print dialog — choose “Save as PDF”. Reflects the current benchmark mode.</span>
      </div>

      <div className="board">
        <header className="bd-head">
          <div>
            <div className="bd-brand"><span className="bd-glyph" />MPI Cost Cockpit</div>
            <div className="bd-sub">Zero-Based Budget Stress-Test · Controllable O&amp;M ex-fuel · FY{2026}</div>
          </div>
          <div className="bd-meta">
            <div><b>Board pack</b></div>
            <div>{today}</div>
            <div>{benchMode === 'normalized' ? 'Like-for-like (size-normalized)' : 'Absolute'} benchmark</div>
            <div>Confidential — illustrative</div>
          </div>
        </header>

        <h1 className="bd-h1">
          {NUMWORD[nAbove] ?? nAbove} of {assets.length} plants run above {bestCode}&apos;s ${bestKw.toFixed(0)}/kW-yr best —
          <b> Rp {rpBn(full.tot)} Bn</b> of gap to close.
        </h1>

        <section className="bd-kpis">
          <div className="bd-kpi"><div className="k">Fleet controllable O&amp;M</div><div className="v">Rp {rpBn(total)} Bn</div></div>
          <div className="bd-kpi"><div className="k">Gap to best (100%)</div><div className="v">Rp {rpBn(full.tot)} Bn</div></div>
          <div className="bd-kpi"><div className="k">External stake · to band</div><div className="v">Rp {rpBn(extStake.minTot)}–{rpBn(extStake.maxTot)} Bn</div></div>
          <div className="bd-kpi"><div className="k">Best-in-fleet</div><div className="v">${bestKw.toFixed(1)}/kW-yr</div></div>
        </section>

        <section>
          <h2 className="bd-h2">Cost-out opportunity by plant</h2>
          <table className="bd-table">
            <thead><tr><th className="l">Plant</th><th>Capacity</th><th>$/kW-yr</th><th>Gap to best (Rp Bn)</th><th>Share</th></tr></thead>
            <tbody>
              {assets.map((a) => {
                const gap = full.by[a.code] ?? 0
                const share = full.tot > 0 ? gap / full.tot : 0
                return (
                  <tr key={a.code}>
                    <td className="l"><b>{a.code}</b>{a.full_name !== a.code && <span className="bd-muted"> {a.full_name}</span>}</td>
                    <td>{a.mw} MW</td>
                    <td>${a.usd_per_kw_yr.toFixed(1)}{a.code === bestCode && <span className="bd-best"> best</span>}</td>
                    <td>{gap > 0 ? rpBn(gap) : '—'}</td>
                    <td>{gap > 0 ? `${(share * 100).toFixed(0)}%` : '—'}</td>
                  </tr>
                )
              })}
              <tr className="bd-total"><td className="l">Fleet</td><td /><td /><td>{rpBn(full.tot)}</td><td>100%</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="bd-h2">Top cost-line opportunities &amp; accountable owners</h2>
          <table className="bd-table">
            <thead><tr>
              <th className="l">Cost line (L3)</th><th className="l">Owner</th><th>Fleet best $/kW</th>
              <th>Gap (Rp Bn)</th><th>Δ vs &apos;25</th><th>External $/kW</th>
            </tr></thead>
            <tbody>
              {blockRows.slice(0, 8).map((r) => (
                <tr key={r.block}>
                  <td className="l">{r.block}{r.semi && <span className="bd-muted"> · semi-committed</span>}</td>
                  <td className="l">{r.owner.name}<div className="bd-muted bd-role">{r.owner.role}</div></td>
                  <td>${r.best.toFixed(1)} <span className="bd-muted">{r.best_code}</span></td>
                  <td>{r.total_gap_idr > 0 ? rpBn(r.total_gap_idr) : '—'}</td>
                  <td className={r.yoyPct > 0.1 ? 'bd-up' : r.yoyPct < 0 ? 'bd-down' : ''}>{r.yoyPct >= 0 ? '+' : ''}{(r.yoyPct * 100).toFixed(1)}%</td>
                  <td>{r.ext ? `$${r.ext.low.toFixed(1)}–${r.ext.high.toFixed(1)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="bd-h2">Challenge summary — lines challenged</h2>
          {committed.length ? (
            <table className="bd-table">
              <thead><tr><th className="l">Budget code</th><th className="l">Lever</th><th className="l">Outcome</th><th>Saving identified (Rp Bn)</th><th>Decided</th></tr></thead>
              <tbody>
                {committed.map((d) => (
                  <tr key={d.budget_code + d.decided_at}>
                    <td className="l">{d.budget_code}</td>
                    <td className="l">{d.lever}</td>
                    <td className="l">{d.outcome}</td>
                    <td>{rpBn(d.committed_saving_idr)}</td>
                    <td>{new Date(d.decided_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
                <tr className="bd-total"><td className="l">Total challenged</td><td /><td /><td>{rpBn(committedTot)}</td><td /></tr>
              </tbody>
            </table>
          ) : (
            <p className="bd-muted bd-empty">No lines challenged yet — decisions taken in the Challenge workspace (accept / cut / defer) roll up here as a savings summary.</p>
          )}
        </section>

        <footer className="bd-foot">
          External benchmark is an illustrative top-quartile gas-CCGT O&amp;M band (range to the market frontier, value-at-stake Rp {rpBn(extStake.minTot)}–{rpBn(extStake.maxTot)} Bn). 2025 baseline and Δ vs &apos;25 are modelled with a per-block YoY assumption (both years at {2026} FX). Cost-line owners are placeholder names. Replace external references, 2025 actuals, and owners with source data before circulation.
        </footer>
      </div>
    </div>
  )
}
