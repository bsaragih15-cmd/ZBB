import { useState } from 'react'
import type { Fleet } from '../domain/types'
import {
  rpBn2, fmt, buildCockpitMatrix, sortedAssets, l5lines, DRV_FORMULA,
} from '../domain/cockpit-model'

export function DriverWorkspace({ fleet, assetCode, block, onSelectAsset, onSelectBlock }:
  {
    fleet: Fleet; assetCode: string; block: string
    onSelectAsset?: (code: string) => void; onSelectBlock?: (block: string) => void
  }) {
  const [challenge, setChallenge] = useState(0)
  const fx = fleet.fx_2026
  const assets = sortedAssets(fleet)
  const matrix = buildCockpitMatrix(fleet)
  const a = fleet.assets.find((x) => x.code === assetCode) ?? assets[0]
  if (!a) return <div style={{ color: 'var(--muted)' }}>Asset not found</div>

  const activeBlock = a.cost_blocks.find((b) => b.name === block)
    ? block
    : (a.cost_blocks.find((b) => b.name === 'Consumable')?.name ?? a.cost_blocks[0]?.name ?? '')
  const blk = a.cost_blocks.find((b) => b.name === activeBlock)
  const lines = l5lines(a, activeBlock)
  const ch = challenge / 100
  const m = matrix.find((r) => r.block === activeBlock)

  let before = 0, after = 0
  for (const L of lines) { before += L.value; after += L.value * (1 - ch) }
  const save = before - after

  return (
    <div className="grid">
      <div>
        <div className="sec" style={{ marginBottom: 8 }}>03 · L5 PER ASSET · DRIVER DECOMPOSITION · Qty × Freq × Rate × FX</div>
        <div className="apills" style={{ marginBottom: 10 }}>
          {assets.map((x) => (
            <button key={x.code} className={`ap ${x.code === a.code ? 'on' : ''}`}
              onClick={() => onSelectAsset?.(x.code)}>{x.code}</button>
          ))}
        </div>
        <div className="apills" style={{ marginBottom: 14 }}>
          {a.cost_blocks.map((b) => (
            <button key={b.name} className={`ap ${b.name === activeBlock ? 'on' : ''}`}
              style={{ fontSize: 10, padding: '5px 10px' }} onClick={() => onSelectBlock?.(b.name)}>{b.name}</button>
          ))}
        </div>
        <h1 className="hero">
          <b>{a.code}</b> · {activeBlock} — <span className="tealnum">Rp {rpBn2(blk?.value_idr ?? 0)} Bn</span> across {lines.length} driver families
        </h1>
        <div className="subline">
          Every line resolves to <b>Qty × Freq × Unit Rate × FX</b> and carries a Budget Code that ties the budget
          to the SCM procurement package and the IPM weekly tracker.{' '}
          {m && <>Fleet best on this line is {m.best_code} at ${m.best.toFixed(1)}/kW.</>} Drag the challenge dial to trim rates and quantities.
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="pbody dial">
            <div className="sl">
              <div className="top"><span className="lbl">challenge · trim unit rates / quantities by</span>
                <span className="mono" style={{ color: 'var(--amber)', fontWeight: 700 }}>{Math.round(challenge)}%</span></div>
              <input type="range" min={0} max={40} value={challenge} onChange={(e) => setChallenge(Number(e.target.value))} />
            </div>
            <div className="stake real"><div className="v">Rp {rpBn2(save)} Bn</div><div className="n">saving on this block</div></div>
            <div className="stake stretch"><div className="v">Rp {rpBn2(after)} Bn</div><div className="n">challenged budget</div></div>
          </div>
        </div>

        <div className="panel">
          <div className="phead"><span className="sec">L5</span><h2>Driver lines — bottom-up build</h2>
            <span className="pill green" style={{ marginLeft: 'auto' }}>carries Budget Code → IPM + SCM</span></div>
          <div style={{ padding: '0 4px', overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th className="l">Driver</th><th className="l">L5 item · family</th><th>UoM</th><th>Qty</th>
                  <th>Freq</th><th>Unit rate</th><th>FX</th><th>Budget Rp Bn</th><th>Challenged</th>
                  <th className="l">Budget code</th><th className="l">Basis</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((L) => {
                  const v0 = L.value, v1 = L.value * (1 - ch)
                  const rateShown = L.fxlbl === 'USD' ? `$${fmt(Math.round(L.rate / fx))}` : `Rp ${fmt(L.rate)}`
                  return (
                    <tr key={L.bc}>
                      <td className="l"><span className="drv">{L.drv}</span></td>
                      <td className="l">{L.item}<div className="mono" style={{ fontSize: 9, color: 'var(--muted-2)' }}>{L.fam}</div></td>
                      <td className="mono">{L.uom}</td><td>{fmt(L.qty)}</td><td>{L.freq}</td>
                      <td>{rateShown}</td><td className="mono">{L.fxlbl}</td>
                      <td>{rpBn2(v0)}</td><td style={{ color: 'var(--amber)' }}>{rpBn2(v1)}</td>
                      <td className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>{L.bc}</td>
                      <td className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{L.basis}</td>
                    </tr>
                  )
                })}
                <tr className="total">
                  <td className="l" colSpan={7}>Total — {activeBlock}</td>
                  <td>{rpBn2(before)}</td><td style={{ color: 'var(--amber)' }}>{rpBn2(after)}</td>
                  <td colSpan={2} className="l" style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 10 }}>saves Rp {rpBn2(save)} Bn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">
          Illustrative driver decomposition built on the L0–L5 Template Driver standard (Consumable is the worked pilot).
          Rates/quantities are back-solved from the real block total for the mockup; the seed example
          (Sodium Hypochlorite 120 drum × Rp 2,750,000 = Rp 330 M) follows the standard.
        </div>
      </div>

      <div className="panel glow copilot">
        <div className="phead"><span className="sec">◇</span><h2>Cost Copilot</h2><span className="pill teal" style={{ marginLeft: 'auto' }}>driver view</span></div>
        <div className="pbody">
          <div className="quote">
            {activeBlock} for {a.code} is built from {lines.length} driver families. A {Math.round(challenge)}% challenge to
            unit rates and quantities releases <b style={{ color: 'var(--green)' }}>Rp {rpBn2(save)} Bn</b>.
            Throughput-driven families flex with the production plan; contract/lump lines need a basis-of-estimate justification.
          </div>
          <div className="lbl" style={{ margin: '16px 0 4px' }}>basis-of-estimate checks</div>
          <div>
            {lines.slice(0, 3).map((L, i) => (
              <div className="act" key={L.bc}>
                <div className="i">0{i + 1}</div>
                <div>
                  <div className="t">{L.item} <span className="drv">{L.drv}</span></div>
                  <div className="d">{DRV_FORMULA[L.drv]}. Basis: {L.basis}. Budget code {L.bc}.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
