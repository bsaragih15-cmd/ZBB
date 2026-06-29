import type { Flag, Decision } from '../domain/types'
import { narrate, challengeQuestion } from '../domain/ai/narrative'
import { DecisionControl } from './DecisionControl'

const sevColor = (s: string) => (s === 'high' ? 'var(--red)' : s === 'medium' ? 'var(--amber)' : 'var(--green)')

export function FlagCard({ flag, current, onSave }:
  { flag: Flag; current?: Decision; onSave: (d: Decision) => void }) {
  return (
    <div className="panel" style={{ borderLeft: `3px solid ${sevColor(flag.severity)}`, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>{flag.budget_code}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: sevColor(flag.severity) }}>Rp {(flag.excess_idr / 1e9).toFixed(2)} Bn at stake</span>
      </div>
      <div className="lbl" style={{ margin: '4px 0 8px' }}>baseline: {flag.baseline_label} · {flag.family}</div>
      <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 6px', color: 'var(--text)' }}>{narrate(flag)}</p>
      <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--teal-bright)', margin: 0 }}>Ask: {challengeQuestion(flag)}</p>
      <DecisionControl budgetCode={flag.budget_code} excessIdr={flag.excess_idr} current={current} onSave={onSave} />
    </div>
  )
}
