import { useState } from 'react'
import { loadOwners, saveOwners, COST_LINE_OWNERS, type Owner } from '../domain/owners'
import { loadExternal, saveExternal, DEFAULT_EXTERNAL, type ExternalRef } from '../domain/external-benchmark'
import { loadYoY, saveYoY, DEFAULT_YOY, FALLBACK_YOY } from '../domain/prior-year'

const BLOCKS = Object.keys(DEFAULT_EXTERNAL)

export function Settings({ onSaved }: { onSaved: () => void }) {
  const [owners, setOwners] = useState<Record<string, Owner>>(() => ({ ...COST_LINE_OWNERS, ...loadOwners() }))
  const [ext, setExt] = useState<Record<string, ExternalRef>>(() => ({ ...DEFAULT_EXTERNAL, ...loadExternal() }))
  const [yoy, setYoy] = useState<Record<string, number>>(() => ({ ...DEFAULT_YOY, ...loadYoY() }))
  const [saved, setSaved] = useState(false)

  const dirty = () => setSaved(false)
  const save = () => { saveOwners(owners); saveExternal(ext); saveYoY(yoy); setSaved(true); onSaved() }
  const reset = () => {
    saveOwners(COST_LINE_OWNERS); saveExternal(DEFAULT_EXTERNAL); saveYoY(DEFAULT_YOY)
    setOwners({ ...COST_LINE_OWNERS }); setExt({ ...DEFAULT_EXTERNAL }); setYoy({ ...DEFAULT_YOY })
    setSaved(true); onSaved()
  }

  const owner = (b: string): Owner => owners[b] ?? { name: '', role: '' }
  const ref = (b: string): ExternalRef => ext[b] ?? { low: 0, high: 0, source: '' }

  return (
    <div>
      <div className="sec" style={{ marginBottom: 8 }}>SETTINGS · COST-LINE OWNERS &amp; BENCHMARK ASSUMPTIONS</div>
      <h1 className="hero" style={{ fontSize: 26 }}>Edit owners &amp; assumptions</h1>
      <p className="subline">
        Replace the placeholder cost-line owners, the external $/kW benchmark band, and the per-block 2025→2026 YoY
        assumption — saved to this browser. No code change, no “replace before circulation” caveat once set.
      </p>

      <div className="panel">
        <div className="phead"><span className="sec">◇</span><h2>Cost lines</h2>
          <span className="pill ghost" style={{ marginLeft: 'auto' }}>{BLOCKS.length} lines</span></div>
        <div className="pbody tscroll">
          <div className="set-grid" style={{ minWidth: 720 }}>
            <div className="set-row head">
              <span>Cost line (L3)</span><span>Owner</span><span>Role / title</span>
              <span>Ext low $/kW</span><span>Ext high $/kW</span><span>YoY '25→'26</span>
            </div>
            {BLOCKS.map((b) => (
              <div className="set-row" key={b}>
                <span className="set-blk">{b}</span>
                <input aria-label={`${b} owner name`} value={owner(b).name}
                  onChange={(e) => { setOwners({ ...owners, [b]: { ...owner(b), name: e.target.value } }); dirty() }} />
                <input aria-label={`${b} owner role`} value={owner(b).role}
                  onChange={(e) => { setOwners({ ...owners, [b]: { ...owner(b), role: e.target.value } }); dirty() }} />
                <input aria-label={`${b} external low`} type="number" step="0.1" value={ref(b).low}
                  onChange={(e) => { setExt({ ...ext, [b]: { ...ref(b), low: Number(e.target.value) } }); dirty() }} />
                <input aria-label={`${b} external high`} type="number" step="0.1" value={ref(b).high}
                  onChange={(e) => { setExt({ ...ext, [b]: { ...ref(b), high: Number(e.target.value) } }); dirty() }} />
                <input aria-label={`${b} YoY percent`} type="number" step="1"
                  value={Math.round((yoy[b] ?? FALLBACK_YOY) * 100)}
                  onChange={(e) => { setYoy({ ...yoy, [b]: Number(e.target.value) / 100 }); dirty() }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <button className="btn" onClick={save}>Save changes</button>
        <button className="btn ghost" onClick={reset}>Reset to defaults</button>
        {saved && <span className="mono" style={{ color: 'var(--green)', fontSize: 12 }}>✓ Saved — applied across the app.</span>}
      </div>
      <div className="foot">YoY is the assumed increase the 2026 submission carries over 2025 (drives the L3–L4 “2025 $/kW” and “Δ vs '25” columns). External band feeds the cross-asset external column and the dial’s market-frontier value-at-stake.</div>
    </div>
  )
}
