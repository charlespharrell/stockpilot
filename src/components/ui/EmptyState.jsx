import { cn } from '../../utils/cn'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  items = [],
  className,
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-line bg-surface p-6 text-center sm:p-10',
        className,
      )}
    >
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {items.length > 0 ? (
        <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-xl bg-canvas px-3 py-2.5 text-sm text-ink-muted"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
