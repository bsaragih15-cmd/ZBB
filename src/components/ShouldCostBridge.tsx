import { rpBn } from '../domain/cockpit-model'

/**
 * Fleet bridge from booked 2026 to the ambition run-rate:
 *   Booked → − Committed (logged decisions) → − Open opportunity (@ambition) → Run-rate.
 * Reuses the .wf waterfall styles; segments float to their cumulative level.
 */
export function ShouldCostBridge({ booked, committed, openCap, pct }:
  { booked: number; committed: number; openCap: number; pct: number }) {
  const target = Math.max(0, booked - committed - openCap)
  const h = (v: number) => `${Math.max(0, (v / booked) * 100)}%`

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="phead"><span className="sec">◇</span>
        <h2>Should-cost bridge — booked to {pct}% ambition run-rate</h2>
        <span className="pill ghost" style={{ marginLeft: 'auto' }}>illustrative</span></div>
      <div className="pbody">
        <div className="wf" role="img"
          aria-label={`Bridge: booked Rp ${rpBn(booked)} Bn, less committed Rp ${rpBn(committed)} Bn, less open Rp ${rpBn(openCap)} Bn, to run-rate Rp ${rpBn(target)} Bn`}>
          <div className="wfcol">
            <div className="val" style={{ color: 'var(--text)' }}>Rp {rpBn(booked)}</div>
            <div className="bar2" style={{ height: '100%', background: 'rgba(125,180,168,0.32)' }} />
            <div className="cap">Booked 2026</div>
          </div>
          <div className="wfcol">
            <div className="val" style={{ color: 'var(--red)' }}>− {rpBn(committed)}</div>
            <div className="bar2" style={{ height: h(committed), background: 'var(--red)' }} />
            <div style={{ height: h(booked - committed) }} />
            <div className="cap">Committed</div>
          </div>
          <div className="wfcol">
            <div className="val" style={{ color: 'var(--amber)' }}>− {rpBn(openCap)}</div>
            <div className="bar2" style={{ height: h(openCap), background: 'var(--amber)' }} />
            <div style={{ height: h(target) }} />
            <div className="cap">Open @ {pct}%</div>
          </div>
          <div className="wfcol">
            <div className="val" style={{ color: 'var(--green)' }}>Rp {rpBn(target)}</div>
            <div className="bar2" style={{ height: h(target), background: 'var(--green)' }} />
            <div className="cap">Run-rate</div>
          </div>
        </div>
        <div className="wfaxis" />
        <div className="foot">
          Committed = savings logged in the Challenge workspace. Open = remaining gap-to-best at {pct}% ambition not yet committed. Run-rate = booked less both.
        </div>
      </div>
    </div>
  )
}
