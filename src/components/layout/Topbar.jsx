import { ChevronRight, HardDrive, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getNavigationLabel } from '../../lib/navigation'
import Button from '../ui/Button'
import Brand from './Brand'

export default function Topbar({ onOpenNavigation, isNavigationOpen }) {
  const { pathname } = useLocation()
  const currentLabel = getNavigationLabel(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="secondary"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={isNavigationOpen}
        aria-controls="mobile-navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <div className="min-w-0 lg:hidden">
        <Brand />
      </div>

      <nav aria-label="Breadcrumb" className="hidden lg:block">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="font-medium text-ink-muted transition-colors hover:text-brand"
            >
              Workspace
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4 text-ink-muted/60" />
          </li>
          <li>
            <span className="font-semibold text-ink" aria-current="page">
              {currentLabel}
            </span>
          </li>
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted"
          title="Business data is designed to stay in this browser."
        >
          <HardDrive className="size-3.5 text-brand" aria-hidden="true" />
          <span className="hidden sm:inline">Local-first</span>
          <span className="sr-only sm:hidden">Local-first workspace</span>
        </span>
      </div>
    </header>
  )
}
