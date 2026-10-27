import { cn } from '../../utils/cn'

export default function Select({
  label,
  id,
  className,
  children,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(
          'h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
