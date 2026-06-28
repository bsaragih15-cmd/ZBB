import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

interface Row { code: string; usd_per_kw_yr: number; gap_rp_bn: number; severity: string }
const color = (s: string) => (s === 'high' ? '#C0392B' : s === 'medium' ? '#E08E0B' : '#2E7D32')

export function BenchmarkBar({ rows, benchmark }: { rows: Row[]; benchmark: number }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
        <XAxis dataKey="code" />
        <YAxis label={{ value: '$/kW-yr', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={((v: number, n: string) => n === 'usd_per_kw_yr' ? [`$${v}/kW-yr`, 'O&M'] : [String(v), n]) as never} />
        <ReferenceLine y={benchmark} stroke="#006CB8" strokeDasharray="4 4"
          label={{ value: `best-in-fleet $${benchmark}`, fill: '#006CB8', fontSize: 11 }} />
        <Bar dataKey="usd_per_kw_yr">
          {rows.map((r) => <Cell key={r.code} fill={color(r.severity)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
