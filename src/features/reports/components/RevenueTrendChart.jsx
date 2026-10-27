import { ChartColumn } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatCurrency'

const axisTick = { fill: 'var(--color-ink-muted)', fontSize: 12 }
const gridColor = 'var(--color-line)'
const brandColor = 'var(--color-brand)'

function formatAxisValue(value) {
  const amount = Number(value) || 0

  if (Math.abs(amount) >= 1000000) {
    return `NGN ${(amount / 1000000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1000) {
    return `NGN ${Math.round(amount / 1000)}k`
  }
  return `NGN ${amount}`
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-float">
      <p className="text-xs font-semibold text-ink">{label}</p>
      <p className="mt-1 text-xs text-ink-muted">
        <span className="font-medium text-ink">Revenue:</span>{' '}
        {formatCurrency(point.revenue)}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        <span className="font-medium text-ink">Transactions:</span>{' '}
        {point.transactions}
      </p>
    </div>
  )
}

export default function RevenueTrendChart({ series, rangeLabel }) {
  const isEmpty = !series || series.length === 0

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
          <ChartColumn className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Revenue trend</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Revenue from saved sales for {rangeLabel.toLowerCase()}, grouped by
            local calendar date. Hover a point for transaction counts.
          </p>
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line bg-canvas/70 px-4 text-center">
            <div>
              <p className="text-sm font-medium text-ink">No sales in this period</p>
              <p className="mt-1 text-xs text-ink-muted">
                Record sales or choose a wider date range to see the revenue trend.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brandColor} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={brandColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={gridColor}
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={axisTick}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                minTickGap={28}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisValue}
                width={78}
              />
              <Tooltip
                content={<RevenueTooltip />}
                cursor={{ stroke: brandColor, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={brandColor}
                strokeWidth={2.5}
                fill="url(#reportRevenueFill)"
                dot={
                  series.length <= 31
                    ? {
                        r: 3,
                        strokeWidth: 2,
                        fill: 'var(--color-surface)',
                      }
                    : false
                }
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
