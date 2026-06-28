import type { Fleet, Decision } from '../domain/types'
import { totalCommittedSaving } from '../domain/decision-store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function CostOutBridge({ fleet, decisions }: { fleet: Fleet; decisions: Decision[] }) {
  const current = fleet.assets.reduce((s, a) => s + a.controllable_om_idr, 0)
  const saving = totalCommittedSaving(decisions)
  const approved = current - saving

  const data = [
    { name: 'Submitted budget', value: current / 1e9, kind: 'base' },
    { name: 'Committed savings', value: -saving / 1e9, kind: 'cut' },
    { name: 'Approved budget', value: approved / 1e9, kind: 'base' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#006CB8] mb-1">
        Committed savings: Rp {(saving / 1e9).toFixed(1)} Bn off the fleet budget
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Submitted Rp {(current / 1e9).toFixed(0)} Bn → approved Rp {(approved / 1e9).toFixed(0)} Bn after logged challenge decisions.
      </p>
      <div className="bg-white rounded border p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Rp Bn', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={((v: number) => [`Rp ${Math.abs(Number(v)).toFixed(1)} Bn`, '']) as never} />
            <Bar dataKey="value">
              {data.map((d) => <Cell key={d.name} fill={d.kind === 'cut' ? '#2E7D32' : '#006CB8'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
