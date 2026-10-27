import { formatCurrency } from '../../utils/formatCurrency'

export function SalesTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-float">
      <p className="text-xs font-semibold text-ink">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="mt-1 text-xs text-ink-muted"
        >
          <span className="font-medium text-ink">{entry.name}:</span>{' '}
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}
