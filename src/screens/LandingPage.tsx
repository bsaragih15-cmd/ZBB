import { useState } from 'react'
import type { Fleet } from '../domain/types'
import { buildCostMatrix, valueAtStake, valueAtStakeToFleetBest } from '../domain/cost-matrix'

const rpBn = (idr: number) => (idr / 1e9).toFixed(1)

// Traffic light for a cell: ratio of its $/kW to the best-in-fleet on that line.
function cellTone(usd: number, best: number, isBest: boolean): { bg: string; fg: string } {
  if (isBest || best === 0) return { bg: '#E6F4EA', fg: '#1E7D34' }
  const r = usd / best
  if (r <= 1.15) return { bg: '#E6F4EA', fg: '#1E7D34' }
  if (r <= 1.6) return { bg: '#FCF3DC', fg: '#9A6700' }
  return { bg: '#FBE7E5', fg: '#B3261E' }
}

const dot = (tone: string) => (
  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9, background: tone, marginRight: 6 }} />
)

export function LandingPage({ fleet, onDrill }: { fleet: Fleet; onDrill: (code: string) => void }) {
  const [capturePct, setCapturePct] = useState(0.5)
  const fx = fleet.fx_2026
  // Columns ordered best -> worst by total $/kW (MRPR first, MEB last).
  const assets = [...fleet.assets].sort((a, b) => a.usd_per_kw_yr - b.usd_per_kw_yr)

  const matrix = buildCostMatrix(assets, fx)
  const stretch = valueAtStake(matrix, capturePct)          // per-line ceiling
  const headline = valueAtStakeToFleetBest(assets, fx, capturePct) // realistic, total-level
  const fleetTotalIdr = assets.reduce((s, a) => s + a.controllable_om_idr, 0)

  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Hero */}
      <h1 className="text-[26px] font-bold text-[#006CB8] leading-snug mb-1">
        Three of four gas plants run above {headline.best_code}'s ${headline.best_usd_per_kw_yr.toFixed(0)}/kW-yr
        best. Closing {Math.round(capturePct * 100)}% of the gap frees Rp {rpBn(headline.total_idr)} Bn.
      </h1>
      <p className="text-gray-600 text-sm mb-4">
        Controllable O&amp;M ex-fuel, 2026 budget, four real gas-CCGT assets (Rp {rpBn(fleetTotalIdr)} Bn total),
        each cost line benchmarked to its best-in-fleet peer. FX {fx.toLocaleString()}.
      </p>

      {/* Capture slider + the two value-at-stake numbers */}
      <div className="bg-white rounded-lg border p-4 mb-5 flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[260px]">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Ambition: capture share of the gap to best</span>
            <span className="font-bold text-[#006CB8]">{Math.round(capturePct * 100)}%</span>
          </div>
          <input type="range" min={0} max={100} value={Math.round(capturePct * 100)}
            onChange={(e) => setCapturePct(Number(e.target.value) / 100)}
            className="w-full accent-[#006CB8]" />
        </div>
        <div className="text-center px-4 border-l">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">Match the best plant</div>
          <div className="text-2xl font-bold text-[#1E7D34]">Rp {rpBn(headline.total_idr)} Bn</div>
          <div className="text-[11px] text-gray-400">realistic, vs {headline.best_code}</div>
        </div>
        <div className="text-center px-4 border-l">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">Match best on every line</div>
          <div className="text-2xl font-bold text-[#9A6700]">Rp {rpBn(stretch.total_idr)} Bn</div>
          <div className="text-[11px] text-gray-400">stretch ceiling</div>
        </div>
      </div>

      {/* Four asset cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {assets.map((a) => {
          const gap = headline.by_asset[a.code] ?? 0
          const isBest = a.code === headline.best_code
          const tone = isBest ? '#1E7D34' : gap / 1e9 >= 12 ? '#B3261E' : '#9A6700'
          return (
            <button key={a.code} onClick={() => onDrill(a.code)}
              className="text-left bg-white rounded-lg border p-3 hover:border-[#006CB8] hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{a.code}</span>
                {dot(tone)}
              </div>
              <div className="text-[11px] text-gray-500 mb-2 truncate">{a.full_name} · {a.mw} MW</div>
              <div className="text-xl font-bold text-[#006CB8]">${a.usd_per_kw_yr.toFixed(1)}<span className="text-xs font-normal text-gray-400">/kW-yr</span></div>
              <div className="text-[11px] text-gray-500">Rp {a.controllable_om_rp_bn.toFixed(1)} Bn controllable</div>
              <div className="mt-2 text-sm font-semibold" style={{ color: tone }}>
                {isBest ? 'best-in-fleet' : `Rp ${rpBn(gap)} Bn at stake`}
              </div>
            </button>
          )
        })}
      </div>

      {/* Cost-block benchmark heatmap */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-bold text-gray-800">Where the money sits: $/kW-yr by cost line, benchmarked across the fleet</h2>
          <p className="text-[11px] text-gray-500">Green = best-in-fleet on that line. Right column = stretch pool if every asset matched the best on this line ({Math.round(capturePct * 100)}% capture).</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b bg-gray-50">
              <th className="text-left p-2 pl-4 font-medium">Cost line</th>
              {assets.map((a) => (
                <th key={a.code} className="text-right p-2 font-medium">
                  {a.code}<div className="text-[10px] font-normal text-gray-400">${a.usd_per_kw_yr.toFixed(0)}/kW</div>
                </th>
              ))}
              <th className="text-right p-2 pr-4 font-medium">Stretch<div className="text-[10px] font-normal text-gray-400">Rp Bn</div></th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.block} className="border-b last:border-0">
                <td className="p-2 pl-4 text-gray-700">
                  {row.block}
                  {row.semi_committed && <span className="ml-1 text-[10px] text-gray-400">(semi-committed)</span>}
                </td>
                {assets.map((a) => {
                  const cell = row.cells.find((c) => c.asset_code === a.code)!
                  const tone = cellTone(cell.usd_per_kw, row.best_usd_per_kw, cell.is_best)
                  return (
                    <td key={a.code} className="text-right p-2 tabular-nums"
                      style={{ background: tone.bg, color: tone.fg, fontWeight: cell.is_best ? 700 : 500 }}>
                      ${cell.usd_per_kw.toFixed(1)}
                    </td>
                  )
                })}
                <td className="text-right p-2 pr-4 tabular-nums text-gray-700">
                  {(row.total_gap_idr * capturePct / 1e9).toFixed(1)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td className="p-2 pl-4">Total controllable</td>
              {assets.map((a) => (
                <td key={a.code} className="text-right p-2 tabular-nums text-gray-800">${a.usd_per_kw_yr.toFixed(1)}</td>
              ))}
              <td className="text-right p-2 pr-4 tabular-nums text-[#9A6700]">{rpBn(stretch.total_idr)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Click any asset card to drop to Layer 2 (L3–L4 cost-block detail) and Layer 3 (L5 line-level driver challenge).
      </p>
    </div>
  )
}
