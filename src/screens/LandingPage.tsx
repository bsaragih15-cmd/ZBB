import { useState } from 'react'
import type { Fleet } from '../domain/types'
import type { BenchmarkMode } from '../domain/cockpit-model'
import {
  rpBn, fmt, buildCockpitMatrix, sortedAssets, fleetTotal, fleetBestKw, fleetBestCode,
  fleetBestStake, tone, dotColor, NUMWORD,
} from '../domain/cockpit-model'
import { buildCopilotContext } from '../domain/ai/context'
import { CopilotChat } from '../components/CopilotChat'

export function LandingPage({ fleet, onDrill, cap: capProp, onCap, benchMode = 'absolute' }:
  { fleet: Fleet; onDrill: (code: string) => void; cap?: number; onCap?: (c: number) => void; benchMode?: BenchmarkMode }) {
  const [capLocal, setCapLocal] = useState(0.5)
  const cap = capProp ?? capLocal
  const setCap = onCap ?? setCapLocal
  const pct = Math.round(cap * 100)

  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet, benchMode)
  const head = fleetBestStake(fleet, cap, benchMode)
  const stretch = matrix.reduce((s, r) => s + r.total_gap_idr * cap, 0)
  const total = fleetTotal(fleet)
  const bestKw = fleetBestKw(fleet)
  const bestCode = fleetBestCode(fleet)
  const nAbove = assets.filter((a) => a.usd_per_kw_yr > bestKw).length

  const worst = [...assets].sort((a, b) => (head.by[b.code] ?? 0) - (head.by[a.code] ?? 0))[0]
  const topLines = [...matrix].sort((a, b) => b.total_gap_idr - a.total_gap_idr).slice(0, 3)

  return (
    <div className="grid">
      <div>
        <div className="sec" style={{ marginBottom: 2 }}>01 · CROSS-ASSET · CONTROLLABLE O&amp;M EX-FUEL · 2026 BUDGET · ILLUSTRATIVE</div>
        <h1 className="hero">
          {NUMWORD[nAbove] ?? nAbove} of {assets.length} entities run above {bestCode}'s{' '}
          <span className="tealnum">${bestKw.toFixed(0)}/kW-yr</span> best. Closing {pct}% of the gap frees{' '}
          <span className="num">Rp {rpBn(head.tot)} Bn</span>.
        </h1>
        <p className="subline">
          Controllable O&amp;M ex-fuel, 2026 budget, real gas-CCGT assets (<b>Rp {rpBn(total)} Bn</b> total),
          each cost line benchmarked to its best-in-fleet peer. FX {fmt(fx)}.
        </p>

        {/* entity strip */}
        <div className="strip" style={{ gridTemplateColumns: `repeat(${assets.length},1fr)` }}>
          {assets.map((a) => {
            const gap = head.by[a.code] ?? 0
            const isBest = a.code === bestCode
            const col = dotColor(gap / 1e9, isBest)
            return (
              <button key={a.code} className="scard" onClick={() => onDrill(a.code)}>
                <div className="row1"><span className="code">{a.code}</span>
                  <span className="dot" style={{ background: col, boxShadow: `0 0 8px ${col}` }} /></div>
                <div className="name">{a.full_name} · {a.mw} MW</div>
                <div className="kw" style={{ color: isBest ? 'var(--green)' : 'var(--text)' }}>
                  ${a.usd_per_kw_yr.toFixed(1)}<span>/kW-yr</span></div>
                <div className="sub2">Rp {rpBn(a.controllable_om_idr)} Bn controllable</div>
                <div className="badge" style={{ color: col }}>
                  {isBest ? '● best-in-fleet' : `▲ Rp ${rpBn(gap)} Bn at stake`}</div>
              </button>
            )
          })}
        </div>

        {/* dial */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="pbody dial">
            <div className="sl">
              <div className="top"><span className="lbl">dial · capture share of the gap to best</span>
                <span className="mono" style={{ color: 'var(--teal-bright)', fontWeight: 700 }}>{pct}%</span></div>
              <input type="range" min={0} max={100} value={pct}
                onChange={(e) => setCap(Number(e.target.value) / 100)} />
            </div>
            <div className="stake real"><div className="v">Rp {rpBn(head.tot)} Bn</div>
              <div className="n">realistic · match the best plant ({bestCode})</div></div>
            <div className="stake stretch"><div className="v">Rp {rpBn(stretch)} Bn</div>
              <div className="n">match best on every line</div></div>
          </div>
        </div>

        {/* heatmap */}
        <div className="panel">
          <div className="phead"><span className="sec">02</span>
            <h2>Where the money sits — $/kW-yr by cost line, benchmarked across the fleet</h2></div>
          <div style={{ padding: '0 4px' }}>
            <table>
              <thead>
                <tr>
                  <th className="l">Cost line (L3)</th>
                  {assets.map((a) => (
                    <th key={a.code}>{a.code}
                      <div className="mono" style={{ color: 'var(--muted-2)', fontWeight: 400 }}>${a.usd_per_kw_yr.toFixed(0)}/kW</div></th>
                  ))}
                  <th>Stretch<div className="mono" style={{ color: 'var(--muted-2)', fontWeight: 400 }}>Rp Bn</div></th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.block} className="clickable" onClick={() => onDrill(row.cells.find((c) => !c.is_best && c.gap_idr > 0)?.code ?? worst.code)}>
                    <td className="l">{row.block}{row.semi && <span className="semi">semi-committed</span>}</td>
                    {assets.map((a) => {
                      const c = row.cells.find((x) => x.code === a.code)!
                      const [bg, fg] = tone(c.usd, row.best, c.is_best)
                      return <td key={a.code} style={{ background: bg, color: fg, fontWeight: c.is_best ? 700 : 500 }}>${c.usd.toFixed(1)}</td>
                    })}
                    <td style={{ color: 'var(--muted)' }}>{(row.total_gap_idr * cap / 1e9).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td className="l">Total controllable</td>
                  {assets.map((a) => <td key={a.code}>${a.usd_per_kw_yr.toFixed(1)}</td>)}
                  <td style={{ color: 'var(--amber)' }}>{rpBn(stretch)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">Green = best-in-fleet on that line. Lines where a plant books Rp 0 are benchmarked to the best non-zero plant. Click any asset to drill to L3–L4.</div>
      </div>

      {/* copilot rail */}
      <div className="panel glow copilot">
        <div className="phead"><span className="sec">◇</span><h2>Cost Copilot</h2>
          <span className="pill teal" style={{ marginLeft: 'auto' }}>fleet view</span></div>
        <div className="pbody">
          <div className="quote">
            At {pct}% capture the fleet frees <b style={{ color: 'var(--gold)' }}>Rp {rpBn(head.tot)} Bn</b> by
            bringing every plant to {bestCode}'s ${bestKw.toFixed(0)}/kW-yr. <b>{worst.code}</b> carries the
            largest gap (Rp {rpBn(head.by[worst.code] ?? 0)} Bn). The money concentrates in three cost lines below.
          </div>
          <div className="lbl" style={{ margin: '16px 0 4px' }}>recommended challenges</div>
          <div>
            {topLines.map((r, i) => (
              <div className="act" key={r.block}>
                <div className="i">0{i + 1}</div>
                <div>
                  <div className="t">{r.block} <span className="pill red">Rp {rpBn(r.total_gap_idr)} Bn gap</span></div>
                  <div className="d">Best is {r.best_code} at ${r.best.toFixed(1)}/kW.{' '}
                    <button className="link" onClick={() => onDrill(worst.code)}>challenge at L5 →</button></div>
                </div>
              </div>
            ))}
          </div>

          <CopilotChat
            context={buildCopilotContext(fleet, { cap, screen: 'cross-asset cockpit' })}
            suggestions={[
              `Why does ${worst.code} carry the largest gap?`,
              `Draft a challenge memo for ${topLines[0]?.block}`,
              'Which lines are semi-committed and need contract action?',
            ]}
          />
        </div>
      </div>
    </div>
  )
}
