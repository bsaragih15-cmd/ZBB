import { Fragment, useState } from 'react'
import type { Fleet } from '../domain/types'
import type { BenchmarkMode } from '../domain/cockpit-model'
import {
  rpBn, rpBn2, usdKw, buildCockpitMatrix, sortedAssets, fleetBestKw, fleetBestCode,
  normalizedBenchUsd, tone, L4, DRV_FORMULA,
} from '../domain/cockpit-model'

export function AssetDrill({ fleet, assetCode, onChallenge, onSelectAsset, onDrillBlock, benchMode = 'absolute' }:
  {
    fleet: Fleet; assetCode: string; onChallenge: () => void
    onSelectAsset?: (code: string) => void; onDrillBlock?: (block: string) => void; benchMode?: BenchmarkMode
  }) {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet, benchMode)
  const bestKw = fleetBestKw(fleet)
  const bestCode = fleetBestCode(fleet)
  const bestMw = fleet.assets.find((x) => x.usd_per_kw_yr === bestKw)?.mw ?? 0
  const a = fleet.assets.find((x) => x.code === assetCode) ?? assets[0]
  if (!a) return <div style={{ color: 'var(--muted)' }}>Asset not found</div>

  const isBest = a.code === bestCode
  const benchKw = normalizedBenchUsd(bestKw, bestMw, a.mw, benchMode)
  const gapKw = Math.max(0, a.usd_per_kw_yr - benchKw)
  const gapIdr = gapKw * a.mw * 1000 * fx

  const drill = (block: string) => (onDrillBlock ? onDrillBlock(block) : onChallenge())

  const rows = a.cost_blocks.map((b) => {
    const m = matrix.find((r) => r.block === b.name)!
    const cell = m.cells.find((c) => c.code === a.code)!
    const u = usdKw(b.value_idr, a.mw, fx)
    const [bg, fg] = tone(u, m.best, cell.is_best)
    const maxU = Math.max(...m.cells.map((c) => c.usd))
    return { b, m, cell, u, bg, fg, maxU }
  }).sort((x, y) => y.cell.gap_idr - x.cell.gap_idr)

  const top = rows.filter((r) => r.cell.gap_idr > 0).slice(0, 3)
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div className="grid">
      <div>
        <div className="sec" style={{ marginBottom: 8 }}>02 · L3–L4 PER ASSET · COST-BLOCK DECOMPOSITION</div>
        <div className="apills" style={{ marginBottom: 14 }}>
          {assets.map((x) => (
            <button key={x.code} className={`ap ${x.code === a.code ? 'on' : ''}`}
              onClick={() => onSelectAsset?.(x.code)}>{x.code}</button>
          ))}
        </div>
        <h1 className="hero">
          <b>{a.full_name}</b> runs at <span className="tealnum">${a.usd_per_kw_yr.toFixed(1)}/kW-yr</span>
          {isBest ? <> — <span className="num">best-in-fleet</span>.</>
            : <> — <span className="num">Rp {rpBn(gapIdr)} Bn</span> above {bestCode}'s ${bestKw.toFixed(0)}.</>}
        </h1>
        <div className="stats">
          <div className="stat"><div className="k">Capacity</div><div className="v">{a.mw} MW</div></div>
          <div className="stat"><div className="k">Controllable O&amp;M</div><div className="v">Rp {rpBn(a.controllable_om_idr)} Bn</div></div>
          <div className="stat"><div className="k">$/kW-yr</div><div className="v" style={{ color: isBest ? 'var(--green)' : 'var(--text)' }}>${a.usd_per_kw_yr.toFixed(1)}</div></div>
          <div className="stat"><div className="k">Gap to best</div><div className="v" style={{ color: isBest ? 'var(--green)' : 'var(--amber)' }}>{isBest ? '—' : `Rp ${rpBn(gapIdr)} Bn`}</div></div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="phead"><span className="sec">L3</span><h2>Cost blocks, ranked by gap to fleet best</h2>
            <span className="pill ghost" style={{ marginLeft: 'auto' }}>click a row for L4 families</span></div>
          <div style={{ padding: '0 4px' }}>
            <table>
              <thead>
                <tr>
                  <th className="l" style={{ width: 30 }} /><th className="l">Cost block (L3)</th>
                  <th>$/kW-yr</th><th>Fleet best</th><th>Rp Bn</th><th>Gap Rp Bn</th>
                  <th className="l" style={{ width: 150 }}>vs fleet</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const fams = L4[r.b.name] ?? [[r.b.name, 'contract', 1] as [string, 'contract', number]]
                  const barW = r.maxU > 0 ? Math.round(r.u / r.maxU * 100) : 0
                  return (
                    <Fragment key={r.b.name}>
                      <tr className="clickable" onClick={() => toggle(i)}>
                        <td className="l"><span className={`caret ${open.has(i) ? 'open' : ''}`}>▸</span></td>
                        <td className="l">{r.b.name}{r.b.semi_committed && <span className="semi">semi</span>}</td>
                        <td style={{ color: r.fg, fontWeight: 600 }}>${r.u.toFixed(1)}</td>
                        <td style={{ color: 'var(--muted)' }}>${r.m.best.toFixed(1)} <span className="mono" style={{ fontSize: 9 }}>{r.m.best_code}</span></td>
                        <td>{rpBn(r.b.value_idr)}</td>
                        <td style={{ color: r.cell.gap_idr > 0 ? 'var(--amber)' : 'var(--muted-2)', fontWeight: 600 }}>{r.cell.gap_idr > 0 ? rpBn(r.cell.gap_idr) : '—'}</td>
                        <td className="l"><span className="bar"><i style={{ width: `${barW}%`, background: r.fg }} /></span></td>
                        <td><button className="link" onClick={(e) => { e.stopPropagation(); drill(r.b.name) }}>L5 →</button></td>
                      </tr>
                      {open.has(i) && fams.map(([fam, drv]) => (
                        <tr key={r.b.name + fam} className="l4row">
                          <td /><td className="l fam">└ {fam}</td>
                          <td><span className="drv">{drv}</span></td>
                          <td colSpan={2} style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 }}>{DRV_FORMULA[drv]}</td>
                          <td>{rpBn2(r.b.value_idr * (fams.find((f) => f[0] === fam)![2]))}</td>
                          <td /><td><button className="link" onClick={(e) => { e.stopPropagation(); drill(r.b.name) }}>L5 →</button></td>
                        </tr>
                      ))}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">L4 families are the standard driver groupings each block must resolve to. Each family carries one driver type that sets its L5 math.</div>
        <button className="tab active" style={{ marginTop: 14 }} onClick={onChallenge}>Challenge {a.code} lines →</button>
      </div>

      <div className="panel glow copilot">
        <div className="phead"><span className="sec">◇</span><h2>Cost Copilot</h2><span className="pill teal" style={{ marginLeft: 'auto' }}>{a.code}</span></div>
        <div className="pbody">
          <div className="quote">
            {isBest
              ? `${a.code} is the fleet benchmark at $${a.usd_per_kw_yr.toFixed(1)}/kW-yr. Its cost lines set the target the other plants are challenged against — protect what makes it cheap.`
              : <>{a.code}'s gap to {bestCode} is concentrated: <b>{top.map((t) => t.b.name).join(', ')}</b> account for the bulk of the Rp {rpBn(gapIdr)} Bn. Expand each block to see the L4 driver families to challenge.</>}
          </div>
          <div className="lbl" style={{ margin: '16px 0 4px' }}>where to challenge first</div>
          <div>
            {(top.length ? top : rows.slice(0, 3)).map((r, i) => (
              <div className="act" key={r.b.name}>
                <div className="i">0{i + 1}</div>
                <div>
                  <div className="t">{r.b.name} {r.cell.gap_idr > 0 && <span className="pill gold">Rp {rpBn(r.cell.gap_idr)} Bn</span>}</div>
                  <div className="d">Runs ${r.u.toFixed(1)}/kW vs best ${r.m.best.toFixed(1)} ({r.m.best_code}).{' '}
                    <button className="link" onClick={() => drill(r.b.name)}>build L5 →</button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
