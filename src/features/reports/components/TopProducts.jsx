import { Boxes } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatCurrency'
import { TOP_PRODUCTS_LIMIT } from '../reportUtils'

export default function TopProducts({ performance, limit = TOP_PRODUCTS_LIMIT }) {
  const items = performance.slice(0, limit)
  const hasSales = performance.length > 0

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">
              Best-selling products
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Ranked by units sold in the selected period using saved sale line
              items.
            </p>
          </div>
        </div>
        {hasSales ? (
          <p className="shrink-0 text-xs font-medium text-ink-muted">
            {performance.length} product{performance.length === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      {!hasSales ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-xl border border-dashed border-line bg-canvas/70 px-4 py-10 text-center">
            <p className="text-sm font-medium text-ink">No product sales yet</p>
            <p className="mt-1 text-xs text-ink-muted">
              Best sellers appear once sales with line items exist in the selected
              period.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line border-t border-line">
            {items.map((product, index) => (
              <li
                key={product.productId ?? `${product.sku}-${product.name}`}
                className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-semibold text-brand">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {product.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {product.sku || 'No SKU'} - {product.transactions} transaction
                    {product.transactions === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-ink">
                    {product.units} unit{product.units === 1 ? '' : 's'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="border-t border-line px-5 py-3 text-xs leading-5 text-ink-muted sm:px-6">
            {performance.length > limit
              ? `Showing the top ${limit} of ${performance.length} sold products. `
              : ''}
            Revenue uses line-item totals before any transaction-level discount.
          </p>
        </>
      )}
    </Card>
  )
}
