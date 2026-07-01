import type { Fleet } from '../domain/types'
import type { BenchmarkMode } from '../domain/cockpit-model'
import {
  rpBn, fmt, buildCockpitMatrix, sortedAssets, fleetTotal, fleetBestKw, fleetBestCode,
  fleetBestStake, tone, dotColor, NUMWORD,
} from '../domain/cockpit-model'
import { buildCopilotContext } from '../domain/ai/context'
import { loadExternal, externalTotalRange, EXTERNAL_LABEL } from '../domain/external-benchmark'
import { CopilotChat } from '../components/CopilotChat'

export function LandingPage({ fleet, onDrill, benchMode = 'absolute' }:
  { fleet: Fleet; onDrill: (code: string) => void; benchMode?: BenchmarkMode }) {
  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet, benchMode)
  const head = fleetBestStake(fleet, 1, benchMode) // full gap to best
  const external = loadExternal()
  const extRange = externalTotalRange(external)
  // value-at-stake per cost line: the fleet's asset-level gap-to-best (matching the headline),
  // decomposed across cost lines by each line's share of the asset's spend. Shown as a range from
  // realistic capture (CAPTURE_RATE of the raw gap) → full gap, so the total ties to the headline
  // (~Rp 26–37 Bn) rather than implying every rupiah is recoverable.
  const CAPTURE_RATE = 0.7
  const lineStake = (block: string) =>
    assets.reduce((s, a) => {
      const c = matrix.find((m) => m.block === block)?.cells.find((x) => x.code === a.code)
      const share = a.usd_per_kw_yr > 0 && c ? c.usd / a.usd_per_kw_yr : 0
      return s + (head.by[a.code] ?? 0) * share
    }, 0)
  const gapRange = (block: string) => {
    const hi = lineStake(block)
    return { lo: hi * CAPTURE_RATE, hi }
  }
  const gapTotals = { lo: head.tot * CAPTURE_RATE, hi: head.tot }
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
          <span className="tealnum">${bestKw.toFixed(0)}/kW-yr</span> best —{' '}
          <span className="num">Rp {rpBn(head.tot)} Bn</span> of gap to close.
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
                  <th title={EXTERNAL_LABEL} style={{ color: 'var(--blue)' }}>External<div className="mono" style={{ color: 'var(--muted-2)', fontWeight: 400 }}>$/kW · mkt band</div></th>
                  <th title="Value-at-stake per line = share of the gap-to-best, ranged realistic capture (70%) → full gap. Sums to the headline gap.">Value at stake<div className="mono" style={{ color: 'var(--muted-2)', fontWeight: 400 }}>Rp Bn · gap to best</div></th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.block} className="clickable" onClick={() => onDrill(row.cells.find((c) => !c.is_best && c.gap_idr > 0)?.code ?? worst.code)}>
                    <td className="l">{row.block}{row.semi && <span className="semi">semi-committed</span>}</td>
                    {assets.map((a) => {
                      const c = row.cells.find((x) => x.code === a.code)!
                      if (c.is_outlier) {
                        return <td key={a.code} title="likely classified elsewhere — excluded from benchmark"
                          style={{ background: 'rgba(120,100,70,0.06)', color: 'var(--muted-2)', fontWeight: 500 }}>${c.usd.toFixed(1)} ⚑</td>
                      }
                      const [bg, fg] = tone(c.usd, row.best, c.is_best)
                      return <td key={a.code} style={{ background: bg, color: fg, fontWeight: c.is_best ? 700 : 500 }}>${c.usd.toFixed(1)}</td>
                    })}
                    {(() => { const e = external[row.block]; return (
                      <td title={e?.source} style={{ color: 'var(--blue)', background: 'rgba(94,124,138,0.10)' }}>
                        {e ? `$${e.low.toFixed(1)}–${e.high.toFixed(1)}` : '—'}</td>
                    ) })()}
                    {(() => { const g = gapRange(row.block)
                      return <td style={{ color: 'var(--amber)', fontWeight: 500 }}>{rpBn(g.lo)}–{rpBn(g.hi)}</td>
                    })()}
                  </tr>
                ))}
                <tr className="total">
                  <td className="l">Total controllable</td>
                  {assets.map((a) => <td key={a.code}>${a.usd_per_kw_yr.toFixed(1)}</td>)}
                  <td style={{ color: 'var(--blue)' }}>${extRange.low.toFixed(0)}–${extRange.high.toFixed(0)}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 700 }}>{rpBn(gapTotals.lo)}–{rpBn(gapTotals.hi)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">Green = best-in-fleet on that line. <span style={{ color: 'var(--blue)' }}>External</span> = market top-quartile $/kW ({EXTERNAL_LABEL.toLowerCase()}) — the frontier beyond our best plant. ⚑ = booked far below peers (likely classified under another block), excluded from the benchmark. Click any asset to drill to L3–L4.</div>
      </div>

      {/* copilot rail */}
      <div className="panel glow copilot">
        <div className="phead"><span className="sec">◇</span><h2>Cost Copilot</h2>
          <span className="pill teal" style={{ marginLeft: 'auto' }}>fleet view</span></div>
        <div className="pbody">
          <div className="quote">
            The fleet carries <b style={{ color: 'var(--gold)' }}>Rp {rpBn(head.tot)} Bn</b> of gap to best —
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
            context={buildCopilotContext(fleet, { cap: 1, screen: 'cross-asset cockpit' })}
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
