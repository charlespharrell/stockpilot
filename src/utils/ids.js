export function generateId(prefix = 'prod') {
  const random = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return `${prefix}-${time}-${random}`
}

export function normaliseSku(sku) {
  if (typeof sku !== 'string') {
    return ''
  }
  return sku.trim().toUpperCase()
}
