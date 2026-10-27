import { AlertTriangle } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { useInventory } from '../../../hooks/useInventory'
import { getStockStatusClasses, getStockStatusLabel } from '../../inventory/inventoryUtils'

export default function LowStockAlerts() {
  const { lowStockItems, alertThreshold } = useInventory()
  const items = lowStockItems.slice(0, 6)

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Low-stock alerts</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Items needing attention from your inventory.
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-xl border border-dashed border-line bg-canvas/70 p-5 text-center">
            <p className="text-sm font-medium text-ink">No low-stock items</p>
            <p className="mt-1 text-xs text-ink-muted">
              All products are above their reorder levels or no products exist.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-line">
          {items.map((item) => {
            const alertAt = Math.max(
              Number(item.lowStockThreshold) || 0,
              alertThreshold,
            )

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-5 py-3.5 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStockStatusClasses(
                        item.status,
                      )}`}
                    >
                      {getStockStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {item.sku} · {item.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">
                    {item.quantity}{' '}
                    <span className="text-xs font-medium text-ink-muted">
                      in stock
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Alert at {alertAt}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
