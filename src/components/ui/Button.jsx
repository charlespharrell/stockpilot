import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-brand-fill text-white shadow-sm hover:bg-brand-600',
  secondary:
    'border border-line bg-surface text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
  ghost: 'text-ink-muted hover:bg-brand-50 hover:text-brand-700',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'size-10',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type,
  ...props
}) {
  const buttonProps = Component === 'button' ? { type: type ?? 'button' } : {}

  return (
    <Component
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...buttonProps}
      {...props}
    />
  )
}
