import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import Button from '../ui/Button'
import Brand from './Brand'
import LocalWorkspaceNote from './LocalWorkspaceNote'
import SidebarNavigation from './SidebarNavigation'

export default function MobileNavigation({ open, onClose }) {
  const dialogRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (open && !isDesktop) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isDesktop, open])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <dialog
      id="mobile-navigation"
      ref={dialogRef}
      aria-labelledby="mobile-navigation-title"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-[min(20rem,calc(100vw-3rem))] max-w-none overflow-hidden border-0 bg-transparent p-0 text-ink"
    >
      <div className="flex h-full flex-col border-l border-line bg-surface shadow-float">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
          <h2 id="mobile-navigation-title" className="sr-only">
            Navigation menu
          </h2>
          <Brand />
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Workspace
          </p>
          <SidebarNavigation className="mt-3" onNavigate={onClose} />
          <LocalWorkspaceNote className="mt-6" />
        </div>
      </div>
    </dialog>
  )
}
