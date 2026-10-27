import { formatCurrency } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'
import { useSales } from '../../../hooks/useSales'

const statusClasses = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-rose-50 text-rose-700',
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export default function RecentTransactions() {
  const { sales } = useSales()
  const recent = [...sales]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`)
      return dateB - dateA
    })
    .slice(0, 10)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Recent transactions</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Latest sales from saved transactions.
          </p>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-xl border border-dashed border-line bg-canvas/70 p-5 text-center">
            <p className="text-sm font-medium text-ink">No transactions yet</p>
            <p className="mt-1 text-xs text-ink-muted">
              Record a sale to see recent transactions here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-left text-ink-muted">
                    <th className="px-6 py-3 font-medium">Reference</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-canvas/40">
                      <td className="px-6 py-4 font-medium text-ink">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {transaction.customerName || '-'}
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusClasses[transaction.status] || 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          {transaction.status || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-ink">
                        {formatCurrency(transaction.total || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="divide-y divide-line md:hidden">
            {recent.map((transaction) => (
              <div key={transaction.id} className="flex flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {transaction.reference}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {(transaction.customerName || '-')} · {formatDate(transaction.date)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-ink">
                    {formatCurrency(transaction.total || 0)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusClasses[transaction.status] || 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {transaction.status || 'Completed'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
