import { Boxes, Package, TriangleAlert } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatPercent } from '../reportUtils'

function SnapshotStat({ icon: Icon, label, value, tone = 'brand', helper }) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-lg ${toneClasses[tone]}`}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <p className="text-xs font-medium text-ink-muted">{label}</p>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-0.5 text-xs text-ink-muted">{helper}</p> : null}
    </div>
  )
}

export default function InventorySnapshot({ summary }) {
  const hasStockedProducts = summary.stockedProducts > 0
  const hasCostPrices = summary.pricedProducts > 0
  const fullCoverage =
    hasStockedProducts && summary.pricedProducts === summary.stockedProducts

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Inventory overview</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Current stock levels and cost valuation. This snapshot is not
            affected by the date range.
          </p>
        </div>
        <Badge>Current snapshot</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SnapshotStat
          icon={Package}
          label="Total products"
          value={summary.totalProducts}
        />
        <SnapshotStat
          icon={Boxes}
          label="Units in stock"
          value={summary.units}
        />
        <SnapshotStat
          icon={TriangleAlert}
          label="Low stock"
          value={summary.lowStock}
          tone={summary.lowStock > 0 ? 'warning' : 'brand'}
          helper="Above zero at or below reorder level"
        />
        <SnapshotStat
          icon={TriangleAlert}
          label="Out of stock"
          value={summary.outOfStock}
          tone={summary.outOfStock > 0 ? 'danger' : 'brand'}
          helper="Quantity is zero"
        />
      </div>

      <div className="mt-auto pt-4">
        {!hasStockedProducts ? (
          <div className="rounded-xl border border-dashed border-line bg-canvas/70 px-3 py-4">
            <p className="text-sm font-medium text-ink">No stocked units to value</p>
            <p className="mt-1 text-xs text-ink-muted">
              Add products with quantity and cost prices to estimate inventory
              value.
            </p>
          </div>
        ) : !hasCostPrices ? (
          <div className="rounded-xl border border-warning-200 bg-warning-50 px-3 py-4">
            <p className="text-sm font-semibold text-warning-700">
              Cost valuation unavailable
            </p>
            <p className="mt-1 text-xs leading-5 text-warning-700">
              None of the {summary.stockedProducts} stocked products have a cost
              price above zero, so inventory value is not estimated.
            </p>
          </div>
        ) : (
          <div
            className={`rounded-xl border px-3 py-4 ${
              fullCoverage
                ? 'border-line bg-canvas/60'
                : 'border-warning-200 bg-warning-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-ink-muted">
                  Inventory cost value{fullCoverage ? '' : ' (partial)'}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
                  {formatCurrency(summary.costValue)}
                </p>
              </div>
              {!fullCoverage ? <Badge tone="warning">Partial</Badge> : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Current quantity multiplied by current cost price for{' '}
              {summary.pricedProducts} of {summary.stockedProducts} stocked
              products
              {!fullCoverage
                ? ` (${formatPercent(summary.costCoverage)} cost coverage)`
                : ''}
              .
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
