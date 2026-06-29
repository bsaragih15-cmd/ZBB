import { useState } from 'react'
import type { Fleet, Decision } from '../domain/types'
import { totalCommittedSaving } from '../domain/decision-store'
import { summarizeRealization } from '../domain/realization'
import {
  rpBn, rpBn2, buildCockpitMatrix, sortedAssets, fleetTotal, fleetBestStake,
} from '../domain/cockpit-model'

export function CostOutBridge({ fleet, decisions, cap: capProp, onCap }:
  { fleet: Fleet; decisions: Decision[]; cap?: number; onCap?: (c: number) => void }) {
  const [capLocal, setCapLocal] = useState(0.5)
  const cap = capProp ?? capLocal
  const setCap = onCap ?? setCapLocal
  const pct = Math.round(cap * 100)

  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet)
  const head = fleetBestStake(fleet, cap)
  const opening = fleetTotal(fleet)
  const out = head.tot
  const closing = opening - out

  const committed = totalCommittedSaving(decisions)
  const realization = summarizeRealization(decisions)

  // waterfall: opening | reductions per entity (desc, non-zero) | challenged
  const reds = assets.map((a) => ({ code: a.code, v: head.by[a.code] ?? 0 }))
    .filter((r) => r.v > 0).sort((x, y) => y.v - x.v)
  const chartH = 300, scale = opening > 0 ? chartH / opening : 0
  let cum = opening

  // by-line cost-out table
  const lineRows = [...matrix].map((r) => ({
    block: r.block, best: r.best, best_code: r.best_code, out: r.total_gap_idr * cap,
  })).sort((a, b) => b.out - a.out)
  const maxOut = Math.max(...lineRows.map((r) => r.out), 1)
  const topLine = lineRows[0]

  let semiCommitted = 0
  for (const a of fleet.assets) for (const b of a.cost_blocks) if (b.semi_committed) semiCommitted += b.value_idr

  return (
    <div className="grid">
      <div>
        <div className="sec" style={{ marginBottom: 8 }}>04 · COST-OUT BRIDGE · 2026 BUDGET → CHALLENGED BUDGET</div>
        <h1 className="hero">
          Cost-out bridge frees <span className="num">Rp {rpBn(out)} Bn</span> from the{' '}
          <span className="tealnum">Rp {rpBn(opening)} Bn</span> controllable budget at {pct}% capture.
        </h1>
        <div className="subline">
          Opening 2026 controllable O&amp;M, less the gap-to-best captured on each entity, equals the challenged budget.
          Committed savings already logged from challenge decisions total{' '}
          <b style={{ color: 'var(--green)' }}>Rp {(committed / 1e9).toFixed(1)} Bn</b>.
        </div>

        <div className="stats" style={{ marginBottom: 4 }}>
          <div className="stat"><div className="k">Opening budget</div><div className="v">Rp {rpBn(opening)} Bn</div></div>
          <div className="stat"><div className="k">Cost-out at {pct}%</div><div className="v" style={{ color: 'var(--amber)' }}>−Rp {rpBn(out)} Bn</div></div>
          <div className="stat"><div className="k">Challenged budget</div><div className="v" style={{ color: 'var(--teal-bright)' }}>Rp {rpBn(closing)} Bn</div></div>
          <div className="stat"><div className="k">Committed (logged)</div><div className="v" style={{ color: 'var(--green)' }}>Rp {(committed / 1e9).toFixed(1)} Bn</div></div>
          <div className="stat"><div className="k">Risk-adjusted</div><div className="v" style={{ color: 'var(--teal-bright)' }}>Rp {(realization.risk_adjusted_idr / 1e9).toFixed(1)} Bn</div></div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="pbody dial">
            <div className="sl">
              <div className="top"><span className="lbl">capture share of the gap to best</span>
                <span className="mono" style={{ color: 'var(--teal-bright)', fontWeight: 700 }}>{pct}%</span></div>
              <input type="range" min={0} max={100} value={pct}
                onChange={(e) => setCap(Number(e.target.value) / 100)} />
            </div>
            <div className="stake real"><div className="v">Rp {rpBn(out)} Bn</div><div className="n">cost-out at {pct}% capture</div></div>
            <div className="stake stretch"><div className="v">Rp {rpBn(closing)} Bn</div><div className="n">challenged budget</div></div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="phead"><span className="sec">BRIDGE</span><h2>Opening → challenged budget, entity by entity</h2></div>
          <div className="pbody">
            <div className="wf">
              <div className="wfcol">
                <div className="val">Rp {rpBn(opening)}</div>
                <div className="bar2" style={{ height: opening * scale, background: 'linear-gradient(180deg,#1b2a26,#16211e)', border: '1px solid var(--border)' }} />
                <div className="cap">Opening<br />budget</div>
              </div>
              {reds.map((r) => {
                const before = cum; cum = cum - r.v
                const spacer = chartH - before * scale
                return (
                  <div className="wfcol" key={r.code}>
                    <div className="val" style={{ color: 'var(--red)' }}>−{rpBn(r.v)}</div>
                    <div style={{ height: spacer }} />
                    <div className="bar2" style={{ height: r.v * scale, background: 'var(--red)', opacity: 0.85 }} />
                    <div className="cap">{r.code}<br />cost-out</div>
                  </div>
                )
              })}
              <div className="wfcol">
                <div className="val" style={{ color: 'var(--teal-bright)' }}>Rp {rpBn(closing)}</div>
                <div className="bar2" style={{ height: closing * scale, background: 'linear-gradient(180deg,var(--teal),#0c6f63)' }} />
                <div className="cap">Challenged<br />budget</div>
              </div>
            </div>
            <div className="wfaxis" />
          </div>
        </div>

        <div className="panel">
          <div className="phead"><span className="sec">L3</span><h2>Cost-out by line — bring every entity to fleet best</h2>
            <span className="pill gold" style={{ marginLeft: 'auto' }}>at {pct}% capture</span></div>
          <div style={{ padding: '0 4px' }}>
            <table>
              <thead>
                <tr><th className="l">Cost line</th><th>Best $/kW (entity)</th><th>Cost-out Rp Bn</th><th className="l" style={{ width: 200 }}>share</th></tr>
              </thead>
              <tbody>
                {lineRows.map((r) => (
                  <tr key={r.block}>
                    <td className="l">{r.block}</td>
                    <td style={{ color: 'var(--muted)' }}>${r.best.toFixed(1)} <span className="mono" style={{ fontSize: 9 }}>{r.best_code}</span></td>
                    <td style={{ color: r.out > 0 ? 'var(--amber)' : 'var(--muted-2)', fontWeight: 600 }}>{r.out > 0 ? rpBn2(r.out) : '—'}</td>
                    <td className="l"><span className="bar"><i style={{ width: `${Math.round(r.out / maxOut * 100)}%`, background: 'var(--amber)' }} /></span></td>
                  </tr>
                ))}
                <tr className="total"><td className="l">Total cost-out</td><td /><td style={{ color: 'var(--green)' }}>{rpBn(out)}</td><td /></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">Committed savings (Rp {(committed / 1e9).toFixed(1)} Bn) are decisions already logged at L5; risk-adjusted (Rp {(realization.risk_adjusted_idr / 1e9).toFixed(1)} Bn) weights each by its ZBB lever's realization probability — what a CFO can actually bank. The bridge above shows the remaining gap-to-best opportunity at the chosen capture.</div>
      </div>

      <div className="panel glow copilot">
        <div className="phead"><span className="sec">◇</span><h2>Cost Copilot</h2><span className="pill teal" style={{ marginLeft: 'auto' }}>bridge view</span></div>
        <div className="pbody">
          <div className="quote">
            At {pct}% capture the bridge takes the fleet from Rp {rpBn(opening)} Bn to{' '}
            <b style={{ color: 'var(--teal-bright)' }}>Rp {rpBn(closing)} Bn</b>.{' '}
            {topLine && <><b>{topLine.block}</b> is the single biggest lever (Rp {rpBn(topLine.out)} Bn). </>}
            Roughly Rp {rpBn(semiCommitted)} Bn sits in semi-committed lines (insurance, management fees) that need contract action, not a budget dial.
          </div>
          <div className="lbl" style={{ margin: '16px 0 4px' }}>biggest cost-out levers</div>
          <div>
            {lineRows.slice(0, 3).map((r, i) => (
              <div className="act" key={r.block}>
                <div className="i">0{i + 1}</div>
                <div>
                  <div className="t">{r.block} <span className="pill gold">Rp {rpBn(r.out)} Bn</span></div>
                  <div className="d">Bring every entity to {r.best_code}'s ${r.best.toFixed(1)}/kW.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
