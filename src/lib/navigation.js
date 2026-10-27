import {
  ChartColumn,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings2,
  Wallet,
} from 'lucide-react'

export const mainNavigation = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    description: 'Your business at a glance',
  },
  {
    label: 'Inventory',
    to: '/inventory',
    icon: Package,
    description: 'Products, stock and alerts',
  },
  {
    label: 'Sales',
    to: '/sales',
    icon: ReceiptText,
    description: 'Daily transactions and revenue',
  },
  {
    label: 'Expenses',
    to: '/expenses',
    icon: Wallet,
    description: 'Spending and operating costs',
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: ChartColumn,
    description: 'Performance and insights',
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings2,
    description: 'Workspace preferences',
  },
]

export const workspaceModules = mainNavigation.filter(
  (item) => item.to !== '/',
)

export function getNavigationLabel(pathname) {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  return (
    mainNavigation.find((item) => item.to === normalizedPath)?.label ??
    'Page not found'
  )
}
