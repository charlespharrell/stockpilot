import { cn } from '../../utils/cn'

export default function Input({
  label,
  id,
  error,
  className,
  type = 'text',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        className={cn(
          'h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15',
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
