import type { Fleet } from '../domain/types'
import { benchmarkFleet } from '../domain/benchmark'
import { fleetTotals } from '../domain/index-calc'
import { KpiStrip } from '../components/KpiStrip'
import { BenchmarkBar } from '../components/BenchmarkBar'
import { ReliabilityGuardrail } from '../components/ReliabilityGuardrail'

export function FleetCockpit({ fleet, onDrill }: { fleet: Fleet; onDrill: (code: string) => void }) {
  const bench = benchmarkFleet(fleet.assets, fleet.fx_2026)
  const totals = fleetTotals(fleet.assets)
  const batamBest = Math.min(...fleet.assets.filter((a) => a.mw < 150).map((a) => a.usd_per_kw_yr))
  const totalGapRpBn = bench.reduce((s, b) => s + b.gap_rp_bn, 0)

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#006CB8] mb-1">
        MEB runs O&amp;M 14% above the Batam best-in-fleet, a Rp 9–10 Bn annual gap
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Controllable O&amp;M ex-fuel, 2026 budget, four real gas-CCGT assets, benchmarked to own-technology peer.
      </p>
      <KpiStrip items={[
        { label: 'Fleet controllable O&M', value: `Rp ${totals.total_rp_bn.toFixed(0)} Bn` },
        { label: 'Total gap to best', value: `Rp ${totalGapRpBn.toFixed(1)} Bn` },
        { label: 'Best-in-fleet', value: `$${totals.best_usd_per_kw_yr.toFixed(1)}/kW-yr` },
        { label: 'Assets above best', value: `${totals.count_above_best}` },
      ]} />
      <div className="bg-white rounded border p-4">
        <BenchmarkBar rows={bench.map((b) => ({ code: b.code, usd_per_kw_yr: b.usd_per_kw_yr, gap_rp_bn: b.gap_rp_bn, severity: b.severity }))} benchmark={batamBest} />
      </div>
      <ReliabilityGuardrail assets={fleet.assets} />
      <div className="mt-4 flex gap-2">
        {fleet.assets.map((a) => (
          <button key={a.code} onClick={() => onDrill(a.code)}
            className="px-3 py-1 bg-[#006CB8] text-white rounded text-sm">Drill {a.code}</button>
        ))}
      </div>
    </div>
  )
}
