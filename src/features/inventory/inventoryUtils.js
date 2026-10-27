import { formatCurrency } from '../../utils/formatCurrency'

export function getStockStatus(product, alertThreshold = 0) {
  const quantity = Number(product.quantity) || 0
  const threshold = Math.max(
    Number(product.lowStockThreshold) || 0,
    Number(alertThreshold) || 0,
  )

  if (quantity <= 0) {
    return 'out-of-stock'
  }
  if (quantity <= threshold) {
    return 'low'
  }
  return 'in-stock'
}

export function getStockStatusLabel(status) {
  if (status === 'out-of-stock') {
    return 'Out of stock'
  }
  if (status === 'low') {
    return 'Low stock'
  }
  return 'In stock'
}

export function getStockStatusClasses(status) {
  if (status === 'out-of-stock') {
    return 'bg-rose-50 text-rose-700'
  }
  if (status === 'low') {
    return 'bg-amber-50 text-amber-700'
  }
  return 'bg-emerald-50 text-emerald-700'
}

export function formatProductPrice(amount) {
  return formatCurrency(amount)
}

export function sanitizeNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return ''
  }
  const number = Number(value)
  return Number.isNaN(number) ? '' : number
}
