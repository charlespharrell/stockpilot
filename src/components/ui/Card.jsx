import { cn } from '../../utils/cn'

export default function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        className,
      )}
      {...props}
    />
  )
}
