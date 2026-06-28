import type { Decision, ZbbLever, DecisionOutcome } from '../domain/types'

const LEVERS: ZbbLever[] = ['keep', 'renegotiate', 'optimize', 'challenge', 'rebuild', 'eliminate']
const OUTCOMES: DecisionOutcome[] = ['accept', 'cut', 'defer']

export function DecisionControl({ budgetCode, excessIdr, current, onSave }:
  { budgetCode: string; excessIdr: number; current?: Decision; onSave: (d: Decision) => void }) {
  // Brief: default the editable saving input to excessIdr/1e9 when the (default)
  // outcome is 'cut', else 0. A saved decision restores its committed amount.
  const outcome = current?.outcome ?? 'cut'
  const defaultSavingBn = current
    ? current.committed_saving_idr / 1e9
    : outcome === 'cut'
      ? excessIdr / 1e9
      : 0
  return (
    <div className="flex flex-wrap gap-2 items-center mt-2">
      <select defaultValue={outcome} id={`o-${budgetCode}`} className="border rounded px-2 py-1 text-sm">
        {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <select defaultValue={current?.lever ?? 'challenge'} id={`l-${budgetCode}`} className="border rounded px-2 py-1 text-sm">
        {LEVERS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <label className="text-xs text-gray-500 flex items-center gap-1">
        Saving (Rp Bn)
        <input type="number" step="0.01" id={`s-${budgetCode}`}
          defaultValue={defaultSavingBn}
          className="border rounded px-2 py-1 text-sm w-24" />
      </label>
      <button className="px-3 py-1 bg-[#006CB8] text-white rounded text-sm"
        onClick={() => {
          const o = (document.getElementById(`o-${budgetCode}`) as HTMLSelectElement).value as DecisionOutcome
          const l = (document.getElementById(`l-${budgetCode}`) as HTMLSelectElement).value as ZbbLever
          const savingBn = parseFloat((document.getElementById(`s-${budgetCode}`) as HTMLInputElement).value)
          const saving = Number.isFinite(savingBn) ? savingBn * 1e9 : 0
          onSave({ budget_code: budgetCode, outcome: o, lever: l, committed_saving_idr: saving, note: '', decided_at: new Date().toISOString() })
        }}>Log</button>
      {current && <span className="text-xs text-green-700">saved: {current.outcome}, Rp {(current.committed_saving_idr / 1e9).toFixed(2)} Bn</span>}
    </div>
  )
}
