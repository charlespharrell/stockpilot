import { Wallet } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatPercent } from '../reportUtils'

export default function ExpenseBreakdown({ summary }) {
  const hasExpenses = summary && summary.count > 0

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">Expense analysis</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {hasExpenses
                ? `${summary.count} recorded expense${
                    summary.count === 1 ? '' : 's'
                  } in the selected period.`
                : 'No expenses recorded in the selected period.'}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-right text-lg font-semibold tracking-tight text-ink">
          {formatCurrency(summary?.total ?? 0)}
        </p>
      </div>

      {!hasExpenses ? (
        <div className="mt-5 flex flex-1 items-center justify-center rounded-xl border border-dashed border-line bg-canvas/70 px-4 py-10 text-center">
          <div>
            <p className="text-sm font-medium text-ink">No expense breakdown</p>
            <p className="mt-1 text-xs text-ink-muted">
              Add expenses or choose a wider date range to see spending by category.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-5 flex-1 space-y-4">
          {summary.categories.map((category) => (
            <li key={category.category}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-ink">
                  {category.category}
                </p>
                <p className="shrink-0 text-sm font-semibold text-ink">
                  {formatCurrency(category.amount)}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{
                      width:
                        category.share > 0
                          ? `${Math.max(category.share * 100, 3)}%`
                          : '0%',
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-medium text-ink-muted">
                  {formatPercent(category.share)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {category.count} record{category.count === 1 ? '' : 's'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
