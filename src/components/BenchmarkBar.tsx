import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

interface Row { code: string; usd_per_kw_yr: number; gap_rp_bn: number; severity: string }
const color = (s: string) => (s === 'high' ? '#F8716A' : s === 'medium' ? '#E0A93B' : '#34D399')

export function BenchmarkBar({ rows, benchmark }: { rows: Row[]; benchmark: number }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
        <XAxis dataKey="code" tick={{ fill: '#6E7E79', fontSize: 12 }} stroke="rgba(125,180,168,0.2)" />
        <YAxis tick={{ fill: '#6E7E79', fontSize: 11 }} stroke="rgba(125,180,168,0.2)"
          label={{ value: '$/kW-yr', angle: -90, position: 'insideLeft', fill: '#6E7E79', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#0c1311', border: '1px solid rgba(125,180,168,0.2)', borderRadius: 8, color: '#DDE7E4' }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          formatter={((v: number, n: string) => n === 'usd_per_kw_yr' ? [`$${v}/kW-yr`, 'O&M'] : [String(v), n]) as never} />
        <ReferenceLine y={benchmark} stroke="#2DD4BF" strokeDasharray="4 4"
          label={{ value: `best-in-fleet $${benchmark}`, fill: '#5EEAD4', fontSize: 11 }} />
        <Bar dataKey="usd_per_kw_yr" isAnimationActive={false} activeBar={false}>
          {rows.map((r) => <Cell key={r.code} fill={color(r.severity)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
