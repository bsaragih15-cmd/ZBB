import type { Asset } from '../domain/types'

/**
 * Reliability guardrail — cost cuts must not jeopardise availability. Shows each
 * plant's $/kW-yr against its availability / forced-outage rate so a challenge
 * can be checked against reliability. (availability_pct / forced_outage_rate are
 * not yet sourced — load them to turn this into an enforced guardrail.)
 */
export function ReliabilityGuardrail({ assets }: { assets: Asset[] }) {
  const haveData = assets.some((a) => a.availability_pct != null || a.forced_outage_rate != null)
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="phead"><span className="sec">GUARDRAIL</span>
        <h2>Reliability — don’t cut what protects availability</h2></div>
      <div style={{ padding: '0 4px' }}>
        <table>
          <thead><tr>
            <th className="l">Asset</th><th>$/kW-yr</th><th>Availability %</th><th>Forced-outage %</th>
          </tr></thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.code}>
                <td className="l">{a.code}</td>
                <td>${a.usd_per_kw_yr.toFixed(1)}</td>
                <td style={{ color: a.availability_pct != null ? 'var(--text)' : 'var(--muted-2)' }}>{a.availability_pct?.toFixed(1) ?? '—'}</td>
                <td style={{ color: a.forced_outage_rate != null ? 'var(--text)' : 'var(--muted-2)' }}>{a.forced_outage_rate?.toFixed(1) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!haveData && (
        <div className="foot">Availability / forced-outage data not yet loaded — wire it so cost challenges flag plants where a cut would risk availability or lost-margin.</div>
      )}
    </div>
  )
}
