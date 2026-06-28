import type { Line, Decision } from './types'

export interface WriteBackRow {
  budget_code: string
  cost_block: string
  l3_activity: string
  l4_equipment: string
  submitted_value_idr: number
  committed_saving_idr: number
  approved_value_idr: number
  lever: string
  outcome: string
}

/** IPM/SCM-shaped export keyed on Budget Code; no re-keying. */
export function buildWriteBack(lines: Line[], decisions: Decision[]): WriteBackRow[] {
  const byCode = new Map(decisions.map((d) => [d.budget_code, d]))
  return lines.map((l) => {
    const d = byCode.get(l.budget_code)
    const saving = d?.committed_saving_idr ?? 0
    return {
      budget_code: l.budget_code, cost_block: l.cost_block,
      l3_activity: l.l3_activity, l4_equipment: l.l4_equipment,
      submitted_value_idr: l.value_idr, committed_saving_idr: saving,
      approved_value_idr: l.value_idr - saving,
      lever: d?.lever ?? 'keep', outcome: d?.outcome ?? 'accept',
    }
  })
}
