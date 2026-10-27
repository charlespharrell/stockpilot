import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../../../components/ui/Card'
import { SalesTooltip } from '../../../components/ui/ChartTooltip'
import { useSales } from '../../../hooks/useSales'

const axisTick = { fill: 'var(--color-ink-muted)', fontSize: 12 }
const gridColor = 'var(--color-line)'
const brandColor = 'var(--color-brand)'

function formatAxisCurrency(value) {
  const amount = Number(value) || 0
  const sign = amount < 0 ? '-' : ''
  const absolute = Math.abs(amount)

  if (absolute >= 1000000) {
    return `${sign}₦${(absolute / 1000000).toFixed(absolute >= 10000000 ? 0 : 1)}M`
  }

  if (absolute >= 1000) {
    return `${sign}₦${(absolute / 1000).toFixed(absolute >= 10000 ? 0 : 1)}k`
  }

  return `${sign}₦${Math.round(absolute)}`
}

function getLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    days.push({
      dateStr: `${year}-${month}-${day}`,
      label: date.toLocaleDateString('en-NG', { weekday: 'short' }),
    })
  }
  return days
}

export default function SalesOverview() {
  const { sales } = useSales()
  const last7Days = useMemo(() => getLastNDays(7), [])

  const chartData = useMemo(() => {
    const byDate = new Map()
    for (const sale of sales) {
      if (!sale.date) continue
      byDate.set(sale.date, (byDate.get(sale.date) || 0) + (Number(sale.total) || 0))
    }

    return last7Days.map((day) => ({
      day: day.label,
      date: day.dateStr,
      sales: byDate.get(day.dateStr) || 0,
    }))
  }, [sales, last7Days])

  const isEmpty = sales.length === 0

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Sales overview</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Revenue from saved sales over the last 7 days (local calendar). Values in Nigerian naira (₦).
          </p>
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line bg-canvas/70 text-center">
            <div>
              <p className="text-sm font-medium text-ink">No sales data to show</p>
              <p className="mt-1 text-xs text-ink-muted">
                Record sales to see trends here.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="day"
                tick={axisTick}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisCurrency}
                width={72}
              />
              <Tooltip content={<SalesTooltip />} cursor={{ stroke: brandColor, strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={brandColor}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
