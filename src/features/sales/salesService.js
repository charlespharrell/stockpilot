import { readStorage, writeStorage } from '../../services/storage'
import { generateId } from '../../utils/ids'

export const SALES_STORAGE_KEY = 'sales-transactions'

function isValidTransaction(txn) {
  if (!txn || typeof txn !== 'object') {
    return false
  }
  const required = ['id', 'reference', 'date', 'items', 'subtotal', 'total', 'paymentMethod', 'status']
  return required.every((field) => field in txn)
}

function normaliseTransaction(txn) {
  const now = new Date().toISOString()
  const date = txn.date || new Date().toISOString().split('T')[0]
  const time = txn.time || new Date().toTimeString().slice(0, 5)
  
  return {
    id: txn.id || generateId('txn'),
    reference: txn.reference || `INV-${Date.now().toString().slice(-6)}`,
    date,
    time,
    items: Array.isArray(txn.items) ? txn.items.map(item => ({
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      quantity: Math.max(0, Number(item.quantity) || 0),
      unitPrice: Number(item.unitPrice) || 0,
      lineTotal: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    })) : [],
    subtotal: Number(txn.subtotal) || 0,
    discount: Number(txn.discount) || 0,
    total: Number(txn.total) || 0,
    paymentMethod: txn.paymentMethod || 'Cash',
    status: txn.status || 'Completed',
    customerName: txn.customerName ? String(txn.customerName).trim() : '',
    notes: txn.notes ? String(txn.notes).trim() : '',
    createdAt: txn.createdAt || now,
    updatedAt: txn.updatedAt || now,
  }
}

export function loadSales() {
  const stored = readStorage(SALES_STORAGE_KEY, [])
  if (!Array.isArray(stored)) {
    return []
  }
  return stored.filter((txn) => isValidTransaction(txn)).map((txn) => normaliseTransaction(txn))
}

export function persistSales(transactions) {
  const normalised = Array.isArray(transactions)
    ? transactions.map((txn) => normaliseTransaction(txn))
    : []
  const ok = writeStorage(SALES_STORAGE_KEY, normalised)
  return { ok, sales: normalised }
}

export function saveSales(transactions) {
  return persistSales(transactions).sales
}

export function createSale(input) {
  const txn = normaliseTransaction(input)
  const now = new Date().toISOString()
  return {
    ...txn,
    id: txn.id || generateId('txn'),
    createdAt: now,
    updatedAt: now,
  }
}

export function validateSaleStock(items, products) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Add at least one item to the sale.')
  }

  const productList = Array.isArray(products) ? products : []
  const productsById = new Map(productList.map((product) => [product.id, product]))
  const quantityByProduct = new Map()

  for (const item of items) {
    const productId =
      typeof item?.productId === 'string' ? item.productId.trim() : ''

    if (!productId) {
      throw new Error('Select a product for every sale item.')
    }

    const product = productsById.get(productId)

    if (!product) {
      throw new Error('One or more selected products are no longer available.')
    }

    const rawQuantity = item.quantity
    const quantity = Number(rawQuantity)
    const validQuantityType =
      typeof rawQuantity === 'number' || typeof rawQuantity === 'string'

    if (
      !validQuantityType ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Enter a whole-number quantity greater than 0 for ${product.name}.`,
      )
    }

    const rawUnitPrice = item.unitPrice
    const unitPrice = Number(rawUnitPrice)
    const validPriceType =
      typeof rawUnitPrice === 'number' || typeof rawUnitPrice === 'string'

    if (
      !validPriceType ||
      (typeof rawUnitPrice === 'string' && rawUnitPrice.trim() === '') ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error(`Enter a valid price of 0 or more for ${product.name}.`)
    }

    quantityByProduct.set(
      productId,
      (quantityByProduct.get(productId) ?? 0) + quantity,
    )
  }

  for (const [productId, quantity] of quantityByProduct) {
    const product = productsById.get(productId)
    const available = Number(product.quantity)

    if (!Number.isInteger(available) || available < 0) {
      throw new Error(
        `Stock for ${product.name} is invalid. Update the product before recording this sale.`,
      )
    }

    if (quantity > available) {
      throw new Error(
        `Not enough stock for ${product.name}. Available: ${available}. Requested: ${quantity}.`,
      )
    }
  }

  return quantityByProduct
}

export function prepareSale(input, products) {
  const items = Array.isArray(input?.items) ? input.items : []
  const productList = Array.isArray(products) ? products : []
  const quantityByProduct = validateSaleStock(items, productList)
  const sale = createSale(input)
  const now = new Date().toISOString()
  const updatedProducts = productList.map((product) => {
    const soldQuantity = quantityByProduct.get(product.id)

    if (soldQuantity === undefined) {
      return product
    }

    return {
      ...product,
      quantity: Number(product.quantity) - soldQuantity,
      updatedAt: now,
    }
  })

  return { sale, updatedProducts }
}
