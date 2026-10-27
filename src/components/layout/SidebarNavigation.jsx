import { NavLink } from 'react-router-dom'
import { mainNavigation } from '../../lib/navigation'
import { cn } from '../../utils/cn'

export default function SidebarNavigation({ onNavigate, className }) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn('flex flex-col gap-1', className)}
    >
      {mainNavigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-fill text-white shadow-sm'
                : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn(
                  'size-4 shrink-0',
                  isActive
                    ? 'text-white'
                    : 'text-ink-muted group-hover:text-brand',
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
              {isActive ? (
                <span
                  className="ml-auto size-1.5 shrink-0 rounded-full bg-white/80"
                  aria-hidden="true"
                />
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
