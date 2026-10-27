import Brand from './Brand'
import LocalWorkspaceNote from './LocalWorkspaceNote'
import SidebarNavigation from './SidebarNavigation'

export default function Sidebar() {
  return (
    <aside className="hidden border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Brand />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Workspace
        </p>
        <SidebarNavigation className="mt-3" />
        <LocalWorkspaceNote className="mt-6 lg:mt-auto" />
      </div>
    </aside>
  )
}
