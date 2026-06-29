import { useRef } from 'react'
import type { Line, Decision } from '../domain/types'
import type { LineSource } from '../data/line-source'
import { buildElbChallenges } from '../domain/elb-challenges'
import { persistDecision, saveDecisions } from '../domain/decision-store'
import { buildWriteBack, writeBackCsv } from '../domain/export'
import { FlagCard } from '../components/FlagCard'

const SOURCE_LABEL: Record<LineSource, { text: string; cls: string }> = {
  real: { text: 'real sourced lines', cls: 'green' },
  modeled: { text: 'modeled should-cost lines', cls: 'gold' },
  uploaded: { text: 'uploaded lines', cls: 'teal' },
}

function download(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}

export function ChallengeWorkspace({ assetCode, lines, source, decisions, setDecisions, onUpload, onClear }:
  {
    assetCode: string; lines: Line[]; source: LineSource
    decisions: Decision[]; setDecisions: (d: Decision[]) => void
    onUpload: (file: File) => void; onClear: () => void
  }) {
  const fileRef = useRef<HTMLInputElement>(null)

  const save = (d: Decision) => {
    const next = [...decisions.filter((x) => x.budget_code !== d.budget_code), d]
    setDecisions(next); saveDecisions(next)
    void persistDecision(decisions, d) // best-effort remote write + audit
  }

  const challenges = buildElbChallenges(lines)
  const committed = decisions.reduce((s, d) => s + d.committed_saving_idr, 0)
  const tag = SOURCE_LABEL[source]

  const exportCsv = () => download(`zbb-writeback-${assetCode}.csv`, writeBackCsv(buildWriteBack(lines, decisions)))

  return (
    <div>
      <div className="sec" style={{ marginBottom: 8 }}>04 · CHALLENGE · LOG DECISIONS · IPM/SCM WRITE-BACK</div>
      <h1 className="hero" style={{ fontSize: 24 }}>
        <b>{assetCode}</b> — top challenges, ranked by rupiah at stake
        <span className={`pill ${tag.cls}`} style={{ marginLeft: 12, verticalAlign: 'middle' }}>{tag.text}</span>
      </h1>
      <div className="subline">
        The {challenges.length} largest controllable lines, each to be justified from its basis of estimate. Log a
        decision (accept / cut / defer + ZBB lever) per line; committed savings export to the IPM/SCM tracker keyed on Budget Code.
        Non-controllable blocks (Finance, Depreciation, Fuel) are out of scope.
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', margin: '4px 0 16px' }}>
        <span className="pill green">committed Rp {(committed / 1e9).toFixed(2)} Bn</span>
        <button className="pill teal" style={{ cursor: 'pointer', border: 'none' }} onClick={() => fileRef.current?.click()}>
          ⤓ upload real lines (CSV)
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }} />
        {source === 'uploaded' && (
          <button className="pill ghost" style={{ cursor: 'pointer', border: 'none' }} onClick={onClear}>revert to default</button>
        )}
        <button className="pill gold" style={{ cursor: 'pointer', border: 'none', marginLeft: 'auto' }} onClick={exportCsv}>
          ⤒ export write-back (CSV)
        </button>
      </div>

      {challenges.map((f) => (
        <FlagCard key={f.budget_code + f.family} flag={f}
          current={decisions.find((d) => d.budget_code === f.budget_code)} onSave={save} />
      ))}
    </div>
  )
}
