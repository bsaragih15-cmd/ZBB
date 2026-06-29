import type { Fleet } from '../domain/types'
import type { BenchmarkMode } from '../domain/cockpit-model'
import { fleetTotal, fleetBestKw, fleetBestCode, fleetBestStake, sortedAssets, rpBn } from '../domain/cockpit-model'
import { KpiStrip } from '../components/KpiStrip'
import { BenchmarkBar } from '../components/BenchmarkBar'
import { ReliabilityGuardrail } from '../components/ReliabilityGuardrail'

const sev = (bn: number) => (bn >= 8 ? 'high' : bn >= 3 ? 'medium' : 'low')

export function FleetCockpit({ fleet, onDrill, benchMode = 'absolute' }:
  { fleet: Fleet; onDrill: (code: string) => void; benchMode?: BenchmarkMode }) {
  const assets = sortedAssets(fleet)
  const total = fleetTotal(fleet)
  const bestKw = fleetBestKw(fleet)
  const bestCode = fleetBestCode(fleet)
  const fullStake = fleetBestStake(fleet, 1, benchMode) // full gap-to-best
  const nAbove = assets.filter((a) => (fullStake.by[a.code] ?? 0) > 0).length
  const rows = assets.map((a) => ({
    code: a.code,
    usd_per_kw_yr: Number(a.usd_per_kw_yr.toFixed(1)),
    gap_rp_bn: (fullStake.by[a.code] ?? 0) / 1e9,
    severity: sev((fullStake.by[a.code] ?? 0) / 1e9),
  }))

  return (
    <div>
      <div className="sec" style={{ marginBottom: 8 }}>FLEET OVERVIEW · CONTROLLABLE O&amp;M EX-FUEL · 2026{benchMode === 'normalized' ? ' · LIKE-FOR-LIKE' : ''}</div>
      <h1 className="hero" style={{ fontSize: 26 }}>
        {nAbove} of {assets.length} plants run above {bestCode}'s <span className="tealnum">${bestKw.toFixed(0)}/kW-yr</span> — <span className="num">Rp {rpBn(fullStake.tot)} Bn</span> of gap to close.
      </h1>
      <KpiStrip items={[
        { label: 'Fleet controllable O&M', value: `Rp ${rpBn(total)} Bn` },
        { label: 'Total gap to best', value: `Rp ${rpBn(fullStake.tot)} Bn` },
        { label: 'Best-in-fleet', value: `$${bestKw.toFixed(1)}/kW-yr` },
        { label: 'Plants above best', value: `${nAbove}` },
      ]} />
      <div className="panel" style={{ padding: 16, marginBottom: 16 }}>
        <div className="lbl" style={{ marginBottom: 8 }}>$/kW-yr by plant vs best-in-fleet</div>
        <BenchmarkBar rows={rows} benchmark={Number(bestKw.toFixed(1))} />
      </div>
      <ReliabilityGuardrail assets={fleet.assets} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        {assets.map((a) => (
          <button key={a.code} className="ap" onClick={() => onDrill(a.code)}>Drill {a.code} →</button>
        ))}
      </div>
    </div>
  )
}
