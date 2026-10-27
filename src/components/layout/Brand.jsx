import { Boxes } from 'lucide-react'

export default function Brand() {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-fill text-white shadow-sm">
        <Boxes className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold tracking-tight text-ink">
          StockPilot
        </span>
        <span className="block truncate text-[11px] font-medium text-ink-muted">
          Business workspace
        </span>
      </span>
    </span>
  )
}
