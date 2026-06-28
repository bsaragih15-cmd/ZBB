import type { Fleet } from '../domain/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function AssetDrill({ fleet, assetCode, onChallenge }:
  { fleet: Fleet; assetCode: string; onChallenge: () => void }) {
  const asset = fleet.assets.find((a) => a.code === assetCode)
  if (!asset) return <div>Asset not found</div>
  const blocks = [...asset.cost_blocks].sort((a, b) => b.value_idr - a.value_idr)

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#006CB8] mb-1">
        {asset.full_name}: where the Rp {asset.controllable_om_rp_bn.toFixed(1)} Bn sits, by cost block
      </h2>
      <p className="text-gray-600 mb-4 text-sm">Click through to challenge the top lines.</p>
      <div className="bg-white rounded border p-4 mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={blocks} layout="vertical" margin={{ left: 120 }}>
            <XAxis type="number" tickFormatter={(v) => `${(v / 1e9).toFixed(0)}`} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={((v: number) => [`Rp ${(Number(v) / 1e9).toFixed(2)} Bn`, 'value']) as never} />
            <Bar dataKey="value_idr" fill="#006CB8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-sm mb-4 bg-white border rounded">
        <thead><tr className="text-left text-gray-500 border-b">
          <th className="p-2">Cost block</th><th className="p-2">Rp Bn</th>
        </tr></thead>
        <tbody>
          {blocks.map((b) => (
            <tr key={b.name} className="border-b">
              <td className="p-2 font-medium">{b.name}</td>
              <td className="p-2">{(b.value_idr / 1e9).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onChallenge} className="px-4 py-2 bg-[#006CB8] text-white rounded">
        Challenge {asset.code} lines →
      </button>
    </div>
  )
}
