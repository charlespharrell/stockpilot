import { cn } from '../../utils/cn'

export default function Textarea({
  label,
  id,
  error,
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        className={cn(
          'min-h-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15',
          error
            ? 'border-rose-300 focus-visible:ring-rose-200'
            : 'hover:border-brand-200',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
