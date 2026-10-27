import { HardDrive } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function LocalWorkspaceNote({ className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-canvas p-3.5',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
        <HardDrive className="size-4 text-brand" aria-hidden="true" />
        Local-first workspace
      </div>
      <p className="mt-1.5 text-xs leading-5 text-ink-muted">
        Business data is designed to stay in this browser. It is not protected
        by an account.
      </p>
    </div>
  )
}
