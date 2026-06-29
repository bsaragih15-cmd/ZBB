export function KpiStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12, marginBottom: 16 }}>
      {items.map((k) => (
        <div key={k.label} className="panel" style={{ padding: '14px 16px' }}>
          <div className="lbl">{k.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal-bright)', marginTop: 4 }}>{k.value}</div>
        </div>
      ))}
    </div>
  )
}
