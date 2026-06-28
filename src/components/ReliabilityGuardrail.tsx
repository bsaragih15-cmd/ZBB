import type { Asset } from '../domain/types'
export function ReliabilityGuardrail({ assets }: { assets: Asset[] }) {
  return (
    <table className="w-full text-sm mt-4 bg-white border rounded">
      <thead><tr className="text-left text-gray-500 border-b">
        <th className="p-2">Asset</th><th className="p-2">$/kW-yr</th>
        <th className="p-2">Availability %</th><th className="p-2">FOR %</th>
      </tr></thead>
      <tbody>
        {assets.map((a) => (
          <tr key={a.code} className="border-b">
            <td className="p-2 font-medium">{a.code}</td>
            <td className="p-2">${a.usd_per_kw_yr.toFixed(1)}</td>
            <td className="p-2">{a.availability_pct?.toFixed(1) ?? '—'}</td>
            <td className="p-2">{a.forced_outage_rate?.toFixed(1) ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
