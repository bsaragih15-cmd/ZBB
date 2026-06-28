import type { Line, Flag } from '../types'
import { checkIntegrity } from './integrity'
import { checkVariance, type History } from './variance'
import { checkPlausibility } from './plausibility'
import { checkCrossAsset } from './cross-asset'
import { score } from '../scoring'

export interface RuleContext {
  history: Record<string, History>
  inflation: number
  peerBest?: Record<string, number>
}

export interface RuleResult {
  integrityFailures: Flag[]
  challenges: Flag[]
}

export function runRules(lines: Line[], ctx: RuleContext): RuleResult {
  const integrityFailures: Flag[] = []
  const challenges: Flag[] = []
  for (const line of lines) {
    const integ = checkIntegrity(line)
    if (integ.length) { integrityFailures.push(...integ); continue }
    const hist = ctx.history[line.budget_code] ?? { prior_value_idr: null }
    const candidates = [
      checkVariance(line, hist, ctx.inflation),
      checkPlausibility(line),
      checkCrossAsset(line, ctx.peerBest?.[line.budget_code] ?? null),
    ].filter((f): f is Flag => f !== null)
    for (const f of candidates) { f.score = score(f); challenges.push(f) }
  }
  challenges.sort((a, b) => b.score - a.score)
  return { integrityFailures, challenges }
}
