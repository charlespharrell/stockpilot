import { normaliseSku } from '../../utils/ids'

export const REPORT_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

export const TOP_PRODUCTS_LIMIT = 8

const DAY_IN_MS = 24 * 60 * 60 * 1000
const MONTHLY_THRESHOLD_DAYS = 120
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isDateString(value) {
  if (typeof value !== 'string') {
    return false
  }

  const day = value.slice(0, 10)

  if (!DATE_PATTERN.test(day)) {
    return false
  }

  const [year, month, date] = day.split('-').map(Number)
  const parsed = new Date(year, month - 1, date)

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === date
  )
}

function toLocalDate(dateString) {
  return new Date(`${dateString.slice(0, 10)}T00:00:00`)
}

export function formatDateLabel(dateString, options) {
  if (!isDateString(dateString)) {
    return 'Unknown date'
  }

  return toLocalDate(dateString).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function getDateRange(value, now = new Date()) {
  const definition =
    REPORT_RANGES.find((range) => range.value === value) ?? REPORT_RANGES[0]

  if (definition.value === 'all') {
    return {
      value: definition.value,
      label: definition.label,
      start: null,
      end: null,
    }
  }

  const end = toLocalDateString(now)
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (definition.value === '7d') {
    startDate.setDate(startDate.getDate() - 6)
  } else if (definition.value === '30d') {
    startDate.setDate(startDate.getDate() - 29)
  } else if (definition.value === 'month') {
    startDate.setDate(1)
  }

  return {
    value: definition.value,
    label: definition.label,
    start: toLocalDateString(startDate),
    end,
  }
}

export function describeRange(range) {
  if (!range || !range.start) {
    return 'All saved records'
  }

  if (range.start === range.end) {
    return `Showing ${formatDateLabel(range.start)}`
  }

  return `Showing ${formatDateLabel(range.start)} to ${formatDateLabel(range.end)}`
}

export function isWithinRange(dateString, range) {
  if (!range || !range.start) {
    return true
  }

  if (!isDateString(dateString)) {
    return false
  }

  const day = dateString.slice(0, 10)
  return day >= range.start && day <= range.end
}

export function filterByDateRange(records, range) {
  if (!Array.isArray(records)) {
    return []
  }

  if (!range || !range.start) {
    return records.slice()
  }

  return records.filter((record) => record && isWithinRange(record.date, range))
}

function getSeriesLabel(date, spanDays, monthly) {
  if (monthly) {
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      year: 'numeric',
    })
  }

  if (spanDays > 1 && spanDays <= 8) {
    return date.toLocaleDateString('en-NG', { weekday: 'short' })
  }

  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export function buildRevenueSeries(sales, range) {
  if (!Array.isArray(sales)) {
    return []
  }

  const datedSales = sales.filter(
    (sale) => sale && isDateString(sale.date) && isWithinRange(sale.date, range),
  )

  if (datedSales.length === 0) {
    return []
  }

  let start = range && range.start
  let end = range && range.end

  if (!start) {
    const sortedDates = datedSales
      .map((sale) => sale.date.slice(0, 10))
      .sort((a, b) => a.localeCompare(b))
    start = sortedDates[0]
    end = sortedDates[sortedDates.length - 1]
  }

  const startDate = toLocalDate(start)
  const endDate = toLocalDate(end)
  const spanDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1,
  )
  const monthly = spanDays > MONTHLY_THRESHOLD_DAYS

  const buckets = new Map()

  for (const sale of datedSales) {
    const day = sale.date.slice(0, 10)
    const key = monthly ? day.slice(0, 7) : day
    const current = buckets.get(key) ?? { revenue: 0, transactions: 0 }
    current.revenue += Number(sale.total) || 0
    current.transactions += 1
    buckets.set(key, current)
  }

  const series = []

  if (monthly) {
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    while (cursor <= last) {
      const key = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1,
      ).padStart(2, '0')}`
      const bucket = buckets.get(key) ?? { revenue: 0, transactions: 0 }
      series.push({
        key,
        label: getSeriesLabel(cursor, spanDays, true),
        revenue: bucket.revenue,
        transactions: bucket.transactions,
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  } else {
    const cursor = new Date(startDate)

    while (cursor <= endDate) {
      const key = toLocalDateString(cursor)
      const bucket = buckets.get(key) ?? { revenue: 0, transactions: 0 }
      series.push({
        key,
        label: getSeriesLabel(cursor, spanDays, false),
        revenue: bucket.revenue,
        transactions: bucket.transactions,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return series
}

export function summariseSales(sales) {
  const transactions = Array.isArray(sales) ? sales : []
  let revenue = 0
  let units = 0

  for (const sale of transactions) {
    revenue += Number(sale.total) || 0

    for (const item of sale.items ?? []) {
      units += Math.max(0, Number(item.quantity) || 0)
    }
  }

  return {
    revenue,
    transactions: transactions.length,
    units,
    averageSale: transactions.length > 0 ? revenue / transactions.length : 0,
  }
}

export function buildProductPerformance(sales) {
  const transactions = Array.isArray(sales) ? sales : []
  const products = new Map()

  transactions.forEach((sale, saleIndex) => {
    for (const item of sale.items ?? []) {
      const quantity = Math.max(0, Number(item.quantity) || 0)
      const unitPrice = Number(item.unitPrice) || 0
      const lineTotal = Number(item.lineTotal)
      const revenue = Number.isFinite(lineTotal) ? lineTotal : quantity * unitPrice
      const key =
        item.productId ||
        `${normaliseSku(item.sku)}::${String(item.name ?? '')}`

      if (!products.has(key)) {
        products.set(key, {
          productId: item.productId ?? null,
          name: String(item.name ?? '').trim() || 'Unknown product',
          sku: normaliseSku(item.sku),
          units: 0,
          revenue: 0,
          transactionIds: new Set(),
        })
      }

      const entry = products.get(key)
      entry.units += quantity
      entry.revenue += revenue
      entry.transactionIds.add(sale.id ?? sale.reference ?? saleIndex)
      if (item.name) {
        entry.name = String(item.name).trim() || entry.name
      }
      if (item.sku) {
        entry.sku = normaliseSku(item.sku)
      }
    }
  })

  return Array.from(products.values())
    .map((entry) => ({
      productId: entry.productId,
      name: entry.name,
      sku: entry.sku,
      units: entry.units,
      revenue: entry.revenue,
      transactions: entry.transactionIds.size,
    }))
    .sort(
      (a, b) =>
        b.units - a.units ||
        b.revenue - a.revenue ||
        a.name.localeCompare(b.name),
    )
}

export function summariseExpenses(expenses) {
  const records = Array.isArray(expenses) ? expenses : []
  const categories = new Map()
  let total = 0

  for (const expense of records) {
    const amount = Number(expense.amount) || 0
    const category = String(expense.category ?? '').trim() || 'Uncategorised'
    const entry = categories.get(category) ?? { amount: 0, count: 0 }

    entry.amount += amount
    entry.count += 1
    categories.set(category, entry)
    total += amount
  }

  return {
    total,
    count: records.length,
    categories: Array.from(categories.entries())
      .map(([category, entry]) => ({
        category,
        amount: entry.amount,
        count: entry.count,
        share: total > 0 ? entry.amount / total : 0,
      }))
      .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category)),
  }
}

function findProductCost(item, productById, productBySku) {
  const snapshot = Number(item.costPrice)
  if (Number.isFinite(snapshot) && snapshot > 0) {
    return { unitCost: snapshot, source: 'snapshot' }
  }

  const product =
    (item.productId ? productById.get(item.productId) : null) ??
    productBySku.get(normaliseSku(item.sku))

  const currentCost = Number(product?.costPrice)
  if (product && Number.isFinite(currentCost) && currentCost > 0) {
    return { unitCost: currentCost, source: 'current' }
  }

  return { unitCost: null, source: null }
}

export function estimateProfit(sales, products, recordedExpenses = 0) {
  const transactions = Array.isArray(sales) ? sales : []
  const productList = Array.isArray(products) ? products : []
  const productById = new Map()
  const productBySku = new Map()

  for (const product of productList) {
    productById.set(product.id, product)
    if (product.sku) {
      productBySku.set(normaliseSku(product.sku), product)
    }
  }

  let revenue = 0
  let cogs = 0
  let lineCount = 0
  let pricedLines = 0
  let snapshotLines = 0
  let currentCostLines = 0
  const missingItems = new Set()

  for (const sale of transactions) {
    revenue += Number(sale.total) || 0

    for (const item of sale.items ?? []) {
      lineCount += 1
      const quantity = Math.max(0, Number(item.quantity) || 0)
      const { unitCost, source } = findProductCost(
        item,
        productById,
        productBySku,
      )

      if (unitCost === null) {
        missingItems.add(String(item.name ?? '').trim() || 'Unknown product')
        continue
      }

      pricedLines += 1
      cogs += unitCost * quantity
      if (source === 'snapshot') {
        snapshotLines += 1
      } else {
        currentCostLines += 1
      }
    }
  }

  const base = {
    revenue,
    recordedExpenses: Number(recordedExpenses) || 0,
    lineCount,
    snapshotLines,
    currentCostLines,
    missingLines: lineCount - pricedLines,
    missingItems: Array.from(missingItems).slice(0, 5),
  }

  if (lineCount === 0) {
    return {
      ...base,
      available: false,
      reason: 'No sales in the selected period, so cost of goods sold cannot be estimated.',
    }
  }

  if (base.missingLines > 0) {
    const itemList = base.missingItems.join(', ')
    return {
      ...base,
      available: false,
      reason: `Cost prices are unavailable for ${base.missingLines} of ${lineCount} sold line item(s)${
        itemList ? ` (${itemList})` : ''
      }. Profit is not estimated to avoid understating costs.`,
    }
  }

  const grossProfit = revenue - cogs
  let basis = 'Estimated using current product cost prices; no historical cost snapshot is stored with sales.'

  if (snapshotLines > 0 && currentCostLines === 0) {
    basis = 'Based on cost prices saved on sales line items.'
  } else if (snapshotLines > 0) {
    basis =
      'Uses saved line-item cost prices where available, otherwise current product cost prices.'
  }

  return {
    ...base,
    available: true,
    cogs,
    grossProfit,
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    netProfit: grossProfit - base.recordedExpenses,
    basis,
  }
}

export function summariseInventory(products) {
  const productList = Array.isArray(products) ? products : []
  let units = 0
  let lowStock = 0
  let outOfStock = 0
  let costValue = 0
  let pricedProducts = 0
  let stockedProducts = 0

  for (const product of productList) {
    const quantity = Math.max(0, Number(product.quantity) || 0)
    const threshold = Math.max(0, Number(product.lowStockThreshold) || 0)
    const costPrice = Number(product.costPrice) || 0

    units += quantity

    if (quantity <= 0) {
      outOfStock += 1
    } else {
      stockedProducts += 1
      if (quantity <= threshold) {
        lowStock += 1
      }
      if (costPrice > 0) {
        costValue += quantity * costPrice
        pricedProducts += 1
      }
    }
  }

  return {
    totalProducts: productList.length,
    units,
    lowStock,
    outOfStock,
    costValue,
    pricedProducts,
    stockedProducts,
    costCoverage:
      stockedProducts > 0 ? pricedProducts / stockedProducts : 0,
  }
}

export function formatPercent(value, digits = 1) {
  const number = Number(value) || 0
  return `${(number * 100).toFixed(digits)}%`
}
