import { BarChart3, Sparkles, Package, TriangleAlert, CircleDollarSign, Wallet, TrendingUp } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useInventory } from '../../hooks/useInventory'
import { useSales } from '../../hooks/useSales'
import { useExpenses } from '../../hooks/useExpenses'
import { formatCurrency } from '../../utils/formatCurrency'
import KpiCard from './components/KpiCard'
import LowStockAlerts from './components/LowStockAlerts'
import QuickActions from './components/QuickActions'
import RecentTransactions from './components/RecentTransactions'
import SalesOverview from './components/SalesOverview'

export default function DashboardPage() {
  useDocumentTitle('Dashboard · StockPilot')
  const { summary: inventorySummary } = useInventory()
  const { summary: salesSummary } = useSales()
  const { summary: expensesSummary } = useExpenses()

  const estimatedProfit = salesSummary.totalRevenue - expensesSummary.totalAmount

  const inventoryMetrics = [
    {
      id: 'products',
      label: 'Total products',
      displayValue: String(inventorySummary.total),
      helper: inventorySummary.total === 0 ? 'No products in inventory yet.' : 'Products tracked in your inventory.',
      change: null,
      icon: Package,
      tone: 'brand',
    },
    {
      id: 'low-stock',
      label: 'Low stock items',
      displayValue: String(inventorySummary.lowStock),
      helper: 'Quantity > 0 and at or below the product or workspace alert level.',
      change: null,
      icon: TriangleAlert,
      tone: inventorySummary.lowStock > 0 ? 'warning' : 'brand',
    },
    {
      id: 'out-of-stock',
      label: 'Out of stock',
      displayValue: String(inventorySummary.outOfStock),
      helper: 'Quantity is 0.',
      change: null,
      icon: TriangleAlert,
      tone: inventorySummary.outOfStock > 0 ? 'danger' : 'brand',
    },
  ]

  const financialMetrics = [
    {
      id: 'revenue',
      label: 'Total revenue',
      displayValue: formatCurrency(salesSummary.totalRevenue),
      helper: `${salesSummary.totalCount} transaction${salesSummary.totalCount === 1 ? '' : 's'}`,
      change: null,
      icon: CircleDollarSign,
      tone: 'brand',
    },
    {
      id: 'today-revenue',
      label: "Today's revenue",
      displayValue: formatCurrency(salesSummary.todayRevenue),
      helper: `${salesSummary.todayCount} sale${salesSummary.todayCount === 1 ? '' : 's'} today`,
      change: null,
      icon: TrendingUp,
      tone: 'brand',
    },
    {
      id: 'expenses',
      label: 'Total expenses',
      displayValue: formatCurrency(expensesSummary.totalAmount),
      helper: `${expensesSummary.totalCount} record${expensesSummary.totalCount === 1 ? '' : 's'} · Today ${formatCurrency(expensesSummary.todayAmount)}`,
      change: null,
      icon: Wallet,
      tone: 'warning',
    },
    {
      id: 'profit',
      label: 'Estimated profit',
      displayValue: formatCurrency(estimatedProfit),
      helper: 'Revenue − recorded expenses (no COGS snapshot available)',
      change: null,
      icon: TrendingUp,
      tone: estimatedProfit >= 0 ? 'brand' : 'danger',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Business overview"
        description="Snapshot from your saved inventory, sales, and expenses in Nigerian naira (₦)."
      >
        <Badge tone="brand">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Live data
        </Badge>
        <Badge>
          <BarChart3 className="size-3.5" aria-hidden="true" />
          From saved records
        </Badge>
      </PageHeader>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Key performance indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {financialMetrics.map((metric) => (
            <KpiCard key={metric.id} {...metric} />
          ))}
        </div>
      </section>

      <section aria-labelledby="inventory-overview-heading">
        <h2 id="inventory-overview-heading" className="sr-only">
          Inventory overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {inventoryMetrics.map((metric) => (
            <KpiCard key={metric.id} {...metric} />
          ))}
        </div>
      </section>

      <SalesOverview />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <RecentTransactions />
        <div className="grid gap-6">
          <LowStockAlerts />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
