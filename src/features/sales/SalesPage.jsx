import { useMemo, useState } from 'react'
import { Plus, ReceiptText, Calendar, TrendingUp } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSales } from '../../hooks/useSales'
import { formatCurrency } from '../../utils/formatCurrency'
import RecordSaleModal from './components/RecordSaleModal'

function formatDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function SalesPage() {
  useDocumentTitle('Sales · StockPilot')
  const { sales, summary, recordSale } = useSales()
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`)
      return dateB - dateA
    })
  }, [sales])

  const totalPages = Math.max(1, Math.ceil(sortedSales.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedSales = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return sortedSales.slice(start, start + pageSize)
  }, [sortedSales, safeCurrentPage, pageSize])

  function handleRecordSale(saleData) {
    recordSale(saleData)
    setModalOpen(false)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Sales"
        title="Sales management"
        description="Record sales, track transactions and monitor revenue. Stock is deducted automatically on completed sales."
      >
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Record sale
        </Button>
      </PageHeader>

      <section aria-labelledby="sales-summary">
        <h2 id="sales-summary" className="sr-only">Sales summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">Today's revenue</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {formatCurrency(summary.todayRevenue)}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                <TrendingUp className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              {summary.todayCount} transaction{summary.todayCount !== 1 ? 's' : ''} today
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">Total revenue</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                <ReceiptText className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              All recorded sales
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">Total transactions</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.totalCount}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                <Calendar className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Across all time
            </p>
          </Card>
        </div>
      </section>

      {sales.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No sales recorded yet"
          description="Record your first sale to start tracking revenue. Stock will be deducted automatically when you complete a sale."
          items={[
            'Add items from your inventory',
            'Select payment method',
            'Track transactions and totals',
            'Monitor revenue in real-time',
          ]}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink">Transaction history</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                All recorded sales transactions
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-y border-line bg-canvas/60">
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Reference
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Date & time
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Items
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Payment
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Status
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{sale.reference}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        <p>{formatDate(sale.date)}</p>
                        <p className="text-xs">{sale.time}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {sale.paymentMethod}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="brand">{sale.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-line md:hidden">
            {paginatedSales.map((sale) => (
              <div key={sale.id} className="flex flex-col gap-2 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{sale.reference}</p>
                    <p className="text-xs text-ink-muted">
                      {formatDate(sale.date)} · {sale.time}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {formatCurrency(sale.total)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span>{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</span>
                  <span aria-hidden="true">•</span>
                  <span>{sale.paymentMethod}</span>
                  <span aria-hidden="true">•</span>
                  <Badge tone="brand">{sale.status}</Badge>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            totalItems={sortedSales.length}
          />
        </Card>
      )}

      <RecordSaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRecordSale}
      />
    </div>
  )
}
