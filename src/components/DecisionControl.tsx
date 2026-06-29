import type { CSSProperties } from 'react'
import type { Decision, ZbbLever, DecisionOutcome } from '../domain/types'

const LEVERS: ZbbLever[] = ['keep', 'renegotiate', 'optimize', 'challenge', 'rebuild', 'eliminate']
const OUTCOMES: DecisionOutcome[] = ['accept', 'cut', 'defer']

const sel: CSSProperties = {
  background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '5px 8px', fontSize: 12, fontFamily: 'inherit',
}

export function DecisionControl({ budgetCode, excessIdr, current, onSave }:
  { budgetCode: string; excessIdr: number; current?: Decision; onSave: (d: Decision) => void }) {
  const outcome = current?.outcome ?? 'cut'
  const defaultSavingBn = current
    ? current.committed_saving_idr / 1e9
    : outcome === 'cut' ? excessIdr / 1e9 : 0
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <select defaultValue={outcome} id={`o-${budgetCode}`} style={sel}>
        {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <select defaultValue={current?.lever ?? 'challenge'} id={`l-${budgetCode}`} style={sel}>
        {LEVERS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'none', letterSpacing: 0 }}>
        saving Rp Bn
        <input type="number" step="0.01" id={`s-${budgetCode}`} defaultValue={defaultSavingBn}
          style={{ ...sel, width: 90 }} />
      </label>
      <button className="pill gold" style={{ cursor: 'pointer', border: 'none' }}
        onClick={() => {
          const o = (document.getElementById(`o-${budgetCode}`) as HTMLSelectElement).value as DecisionOutcome
          const l = (document.getElementById(`l-${budgetCode}`) as HTMLSelectElement).value as ZbbLever
          const savingBn = parseFloat((document.getElementById(`s-${budgetCode}`) as HTMLInputElement).value)
          const saving = Number.isFinite(savingBn) ? savingBn * 1e9 : 0
          onSave({ budget_code: budgetCode, outcome: o, lever: l, committed_saving_idr: saving, note: '', decided_at: new Date().toISOString() })
        }}>Log decision</button>
      {current && <span className="pill green">saved · {current.outcome} · Rp {(current.committed_saving_idr / 1e9).toFixed(2)} Bn</span>}
    </div>
  )
}
