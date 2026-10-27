import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

const toneClasses = {
  brand: 'bg-brand-50 text-brand',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
}

export default function KpiCard({
  icon: Icon,
  label,
  displayValue,
  helper,
  change,
  tone = 'brand',
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {displayValue}
          </p>
        </div>
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl',
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {change ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              change.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700',
            )}
          >
            {change.direction === 'up' ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            )}
            {change.percentage >= 0 ? '+' : ''}
            {change.percentage}%
          </span>
        ) : null}
        <p className="text-xs leading-5 text-ink-muted">{helper}</p>
      </div>
    </Card>
  )
}
