import {
  formatDateLabel,
  toLocalDateString,
  TOP_PRODUCTS_LIMIT,
} from './reportUtils'

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  let text = String(value)

  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function csvLine(values = []) {
  return values.map(escapeCsvValue).join(',')
}

export function buildReportCsv({
  range,
  salesSummary,
  revenueSeries,
  expenseSummary,
  productPerformance,
  profit,
  inventory,
  generatedAt = new Date(),
}) {
  const rows = []
  const add = (...values) => rows.push(csvLine(values))
  const blank = () => rows.push('')

  add('StockPilot report')
  add('Generated', formatDateLabel(toLocalDateString(generatedAt)))
  add('Period', range?.label ?? 'All time')
  add(
    'Date range',
    range?.start ? `${range.start} to ${range.end}` : 'All saved records',
  )
  add('Currency', 'NGN')
  blank()

  add('Sales overview')
  add('Total revenue', salesSummary.revenue)
  add('Transactions', salesSummary.transactions)
  add('Units sold', salesSummary.units)
  add('Average sale value', salesSummary.averageSale)
  blank()

  add('Revenue trend')
  add('Period', 'Revenue', 'Transactions')
  for (const point of revenueSeries) {
    add(point.label, point.revenue, point.transactions)
  }
  blank()

  add('Expense analysis')
  add('Total expenses', expenseSummary.total)
  add('Records', expenseSummary.count)
  add('Category', 'Amount', 'Records', 'Share')
  for (const category of expenseSummary.categories) {
    add(
      category.category,
      category.amount,
      category.count,
      `${(category.share * 100).toFixed(1)}%`,
    )
  }
  blank()

  add('Best-selling products')
  add(
    'Ranking',
    `Top ${Math.min(TOP_PRODUCTS_LIMIT, productPerformance.length)} of ${
      productPerformance.length
    } sold products`,
  )
  add('Rank', 'Product', 'SKU', 'Units sold', 'Revenue', 'Transactions')
  productPerformance
    .slice(0, TOP_PRODUCTS_LIMIT)
    .forEach((product, index) => {
      add(
        index + 1,
        product.name,
        product.sku,
        product.units,
        product.revenue,
        product.transactions,
      )
    })
  blank()

  add('Profit estimate')
  add('Revenue', salesSummary.revenue)
  if (profit.available) {
    add('Cost of goods sold (estimated)', profit.cogs)
    add('Gross profit (estimated)', profit.grossProfit)
    add('Gross margin (estimated)', `${(profit.grossMargin * 100).toFixed(1)}%`)
    add('Recorded expenses', expenseSummary.total)
    add('Estimated net profit', profit.netProfit)
    add('COGS basis', profit.basis)
  } else {
    add('Recorded expenses', expenseSummary.total)
    add('Estimated profit', 'Not calculated')
    add('Reason', profit.reason)
  }
  blank()

  add('Inventory overview (current snapshot, not date-filtered)')
  add('Total products', inventory.totalProducts)
  add('Units in stock', inventory.units)
  add('Low stock', inventory.lowStock)
  add('Out of stock', inventory.outOfStock)
  add('Inventory cost value', inventory.costValue)
  add(
    'Cost price coverage',
    `${inventory.pricedProducts} of ${inventory.stockedProducts} stocked products`,
  )

  return rows.join('\r\n')
}

export function downloadReportCsv(csv, filename) {
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
