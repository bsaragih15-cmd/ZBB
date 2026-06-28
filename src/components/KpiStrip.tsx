export function KpiStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {items.map((k) => (
        <div key={k.label} className="bg-white rounded p-3 border">
          <div className="text-xs uppercase tracking-wide text-gray-500">{k.label}</div>
          <div className="text-xl font-bold text-[#006CB8]">{k.value}</div>
        </div>
      ))}
    </div>
  )
}
