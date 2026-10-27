import { useMemo, useState } from 'react'
import {
  Boxes,
  CalendarRange,
  CircleDollarSign,
  Download,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import KpiCard from '../dashboard/components/KpiCard'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useExpenses } from '../../hooks/useExpenses'
import { useInventory } from '../../hooks/useInventory'
import { useSales } from '../../hooks/useSales'
import { formatCurrency } from '../../utils/formatCurrency'
import ExpenseBreakdown from './components/ExpenseBreakdown'
import InventorySnapshot from './components/InventorySnapshot'
import ProfitEstimate from './components/ProfitEstimate'
import RevenueTrendChart from './components/RevenueTrendChart'
import TopProducts from './components/TopProducts'
import { buildReportCsv, downloadReportCsv } from './reportExport'
import {
  buildProductPerformance,
  buildRevenueSeries,
  describeRange,
  estimateProfit,
  filterByDateRange,
  getDateRange,
  REPORT_RANGES,
  summariseExpenses,
  summariseInventory,
  summariseSales,
  toLocalDateString,
} from './reportUtils'

export default function ReportsPage() {
  useDocumentTitle('Reports · StockPilot')

  const { products } = useInventory()
  const { sales } = useSales()
  const { expenses } = useExpenses()
  const [rangeKey, setRangeKey] = useState('30d')

  const range = useMemo(() => getDateRange(rangeKey), [rangeKey])

  const periodSales = useMemo(
    () => filterByDateRange(sales, range),
    [sales, range],
  )
  const periodExpenses = useMemo(
    () => filterByDateRange(expenses, range),
    [expenses, range],
  )

  const salesSummary = useMemo(
    () => summariseSales(periodSales),
    [periodSales],
  )
  const expenseSummary = useMemo(
    () => summariseExpenses(periodExpenses),
    [periodExpenses],
  )
  const productPerformance = useMemo(
    () => buildProductPerformance(periodSales),
    [periodSales],
  )
  const revenueSeries = useMemo(
    () => buildRevenueSeries(sales, range),
    [sales, range],
  )
  const profit = useMemo(
    () => estimateProfit(periodSales, products, expenseSummary.total),
    [periodSales, products, expenseSummary.total],
  )
  const inventorySummary = useMemo(
    () => summariseInventory(products),
    [products],
  )

  function handleExport() {
    const csv = buildReportCsv({
      range,
      salesSummary,
      revenueSeries,
      expenseSummary,
      productPerformance,
      profit,
      inventory: inventorySummary,
    })

    downloadReportCsv(
      csv,
      `stockpilot-report-${range.value}-${toLocalDateString()}.csv`,
    )
  }

  const metrics = [
    {
      id: 'revenue',
      label: 'Total revenue',
      displayValue: formatCurrency(salesSummary.revenue),
      helper: `${salesSummary.transactions} transaction${
        salesSummary.transactions === 1 ? '' : 's'
      } in this period`,
      change: null,
      icon: CircleDollarSign,
      tone: 'brand',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      displayValue: String(salesSummary.transactions),
      helper: `${salesSummary.units} unit${
        salesSummary.units === 1 ? '' : 's'
      } sold`,
      change: null,
      icon: ReceiptText,
      tone: 'brand',
    },
    {
      id: 'average-sale',
      label: 'Average sale',
      displayValue: formatCurrency(salesSummary.averageSale),
      helper: 'Revenue divided by transactions',
      change: null,
      icon: Boxes,
      tone: 'brand',
    },
    {
      id: 'expenses',
      label: 'Recorded expenses',
      displayValue: formatCurrency(expenseSummary.total),
      helper: `${expenseSummary.count} expense record${
        expenseSummary.count === 1 ? '' : 's'
      } in this period`,
      change: null,
      icon: Wallet,
      tone: 'warning',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Reports"
        title="Business reports"
        description="Review sales, expenses, product performance, inventory, and a cost-based profit estimate from your saved records."
      >
        <Button variant="secondary" onClick={handleExport}>
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
        <Badge tone="brand">
          <CalendarRange className="size-3.5" aria-hidden="true" />
          Local calendar dates
        </Badge>
      </PageHeader>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Report period</h2>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              {describeRange(range)}. Sales and expense metrics, the revenue
              trend, and exports follow this period. Inventory is a current
              snapshot and is not date filtered.
            </p>
          </div>
          <div
            role="group"
            aria-label="Report period"
            className="flex flex-wrap gap-2"
          >
            {REPORT_RANGES.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={rangeKey === option.value ? 'primary' : 'secondary'}
                aria-pressed={rangeKey === option.value}
                onClick={() => setRangeKey(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <section aria-labelledby="report-kpis-heading">
        <h2 id="report-kpis-heading" className="sr-only">
          Report key figures
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <KpiCard key={metric.id} {...metric} />
          ))}
        </div>
      </section>

      <RevenueTrendChart series={revenueSeries} rangeLabel={range.label} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ExpenseBreakdown summary={expenseSummary} />
        <ProfitEstimate
          profit={profit}
          revenue={salesSummary.revenue}
          recordedExpenses={expenseSummary.total}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TopProducts performance={productPerformance} />
        <InventorySnapshot summary={inventorySummary} />
      </div>

      <p className="text-xs leading-5 text-ink-muted">
        Revenue is the sum of saved transaction totals and is never treated as
        profit. Cost of goods sold is only estimated when every sold line item can
        be matched to a positive cost price. Inventory cost value uses current
        product cost prices and current stock, not historical purchase data. If
        inventory purchases are also recorded as expenses, cost of goods sold and
        recorded expenses may overlap in the net profit estimate.
      </p>
    </div>
  )
}
