import type { Fleet, Line, Decision } from '../domain/types'
import { buildElbChallenges } from '../domain/elb-challenges'
import { upsertDecision, saveDecisions } from '../domain/decision-store'
import { FlagCard } from '../components/FlagCard'

export function ChallengeWorkspace({ assetCode, lines, decisions, setDecisions }:
  { assetCode: string; lines: Line[]; fleet: Fleet; decisions: Decision[]; setDecisions: (d: Decision[]) => void }) {
  const save = (d: Decision) => {
    const next = upsertDecision(decisions, d)
    setDecisions(next); saveDecisions(next)
  }

  if (assetCode !== 'ELB') {
    return (
      <div className="text-gray-600">
        Line-level detail for {assetCode} is not yet sourced. ELB carries full L0–L5 lines today.
      </div>
    )
  }

  const challenges = buildElbChallenges(lines)

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#006CB8] mb-1">ELB: top challenges, ranked by rupiah at stake</h2>
      <p className="text-gray-600 mb-4 text-sm">
        These {challenges.length} lines are booked as lump sums with no bottom-up Qty × Rate build-up, so each
        must be justified from its basis of estimate. Non-controllable blocks (Finance Costs, Depreciation) are out of scope.
      </p>
      {challenges.map((f) => (
        <FlagCard key={f.budget_code + f.family} flag={f}
          current={decisions.find((d) => d.budget_code === f.budget_code)} onSave={save} />
      ))}
    </div>
  )
}
