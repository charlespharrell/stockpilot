import { TrendingUp } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatPercent } from '../reportUtils'

function ReportRow({ label, value, helper, emphasized = false, negative = false }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3',
        emphasized && 'rounded-xl bg-brand-50 px-3',
      )}
    >
      <div className="min-w-0">
        <dt
          className={cn(
            'text-sm',
            emphasized ? 'font-semibold text-ink' : 'font-medium text-ink',
          )}
        >
          {label}
        </dt>
        {helper ? (
          <p className="mt-0.5 text-xs leading-5 text-ink-muted">{helper}</p>
        ) : null}
      </div>
      <dd
        className={cn(
          'shrink-0 text-sm font-semibold',
          negative ? 'text-rose-600' : 'text-ink',
          emphasized && 'text-base',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export default function ProfitEstimate({ profit, revenue, recordedExpenses }) {
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
            <TrendingUp className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">Profit estimate</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Revenue, cost of goods sold, and recorded expenses kept separate.
            </p>
          </div>
        </div>
        <Badge tone={profit.available ? 'brand' : 'neutral'}>
          {profit.available ? 'Estimated' : 'Not calculated'}
        </Badge>
      </div>

      <dl className="mt-4 flex-1 divide-y divide-line">
        <ReportRow
          label="Revenue"
          value={formatCurrency(revenue)}
          helper="Sum of saved transaction totals for the period."
        />

        {profit.available ? (
          <>
            <ReportRow
              label="Cost of goods sold"
              value={formatCurrency(profit.cogs)}
              helper="Units sold multiplied by estimated unit cost."
            />
            <ReportRow
              label="Gross profit"
              value={formatCurrency(profit.grossProfit)}
              helper={`${formatPercent(profit.grossMargin)} gross margin.`}
              negative={profit.grossProfit < 0}
            />
            <ReportRow
              label="Recorded expenses"
              value={formatCurrency(recordedExpenses)}
              helper="Expenses saved for the same period."
            />
            <ReportRow
              label="Estimated net profit"
              value={formatCurrency(profit.netProfit)}
              helper="Gross profit minus recorded expenses."
              emphasized
              negative={profit.netProfit < 0}
            />
          </>
        ) : (
          <ReportRow
            label="Recorded expenses"
            value={formatCurrency(recordedExpenses)}
            helper="Expenses saved for the same period."
          />
        )}
      </dl>

      {profit.available ? (
        <p className="mt-4 border-t border-line pt-4 text-xs leading-5 text-ink-muted">
          {profit.basis} Cost data matched for {profit.lineCount} sold line
          item{profit.lineCount === 1 ? '' : 's'}.
        </p>
      ) : (
        <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 px-3 py-3">
          <p className="text-xs font-semibold text-warning-700">
            Profit not estimated
          </p>
          <p className="mt-1 text-xs leading-5 text-warning-700">
            {profit.reason}
          </p>
        </div>
      )}
    </Card>
  )
}
