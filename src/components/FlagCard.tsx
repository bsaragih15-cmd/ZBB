import type { Flag, Decision } from '../domain/types'
import { narrate, challengeQuestion } from '../domain/ai/narrative'
import { DecisionControl } from './DecisionControl'

const sevColor = (s: string) => (s === 'high' ? 'border-l-red-600' : s === 'medium' ? 'border-l-amber-500' : 'border-l-green-600')

export function FlagCard({ flag, current, onSave }:
  { flag: Flag; current?: Decision; onSave: (d: Decision) => void }) {
  return (
    <div className={`bg-white border border-l-4 ${sevColor(flag.severity)} rounded p-4 mb-3`}>
      <div className="flex justify-between">
        <span className="font-mono text-sm">{flag.budget_code}</span>
        <span className="text-sm font-bold text-red-700">Rp {(flag.excess_idr / 1e9).toFixed(2)} Bn at stake</span>
      </div>
      <div className="text-xs text-gray-500 mb-1">baseline: {flag.baseline_label} · {flag.family}</div>
      <p className="text-sm mb-2">{narrate(flag)}</p>
      <p className="text-sm italic text-[#006CB8]">Ask: {challengeQuestion(flag)}</p>
      <DecisionControl budgetCode={flag.budget_code} excessIdr={flag.excess_idr} current={current} onSave={onSave} />
    </div>
  )
}
