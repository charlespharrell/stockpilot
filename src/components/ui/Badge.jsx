import { cn } from '../../utils/cn'

const tones = {
  neutral: 'border-line bg-canvas text-ink-muted',
  brand: 'border-brand-100 bg-brand-50 text-brand-700',
  warning: 'border-warning-200 bg-warning-50 text-warning-700',
}

export default function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
