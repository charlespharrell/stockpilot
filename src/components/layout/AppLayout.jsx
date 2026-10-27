import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import MobileNavigation from './MobileNavigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  function closeNavigation() {
    setIsNavigationOpen(false)
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-brand-fill focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Sidebar />

        <div className="flex min-w-0 flex-col">
          <Topbar
            onOpenNavigation={() => setIsNavigationOpen(true)}
            isNavigationOpen={isNavigationOpen}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 px-4 py-6 focus-visible:outline-none sm:px-6 lg:px-8 lg:py-8"
          >
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileNavigation open={isNavigationOpen} onClose={closeNavigation} />
    </>
  )
}
