import { readStorage, writeStorage } from '../../services/storage'
import { generateId, normaliseSku } from '../../utils/ids'

export const INVENTORY_STORAGE_KEY = 'inventory-products'

function isValidProduct(product) {
  if (!product || typeof product !== 'object') {
    return false
  }

  const required = [
    'id',
    'name',
    'sku',
    'category',
    'costPrice',
    'sellingPrice',
    'quantity',
    'lowStockThreshold',
    'createdAt',
    'updatedAt',
  ]

  return required.every((field) => field in product)
}

function normaliseProduct(product) {
  const now = new Date().toISOString()

  return {
    id: product.id || generateId(),
    name: String(product.name || '').trim(),
    sku: normaliseSku(product.sku),
    category: String(product.category || '').trim() || 'Other',
    description: product.description ? String(product.description).trim() : '',
    costPrice: Number(product.costPrice) || 0,
    sellingPrice: Number(product.sellingPrice) || 0,
    quantity: Math.max(0, Math.floor(Number(product.quantity) || 0)),
    lowStockThreshold: Math.max(0, Math.floor(Number(product.lowStockThreshold) || 0)),
    createdAt: product.createdAt || now,
    updatedAt: product.updatedAt || now,
  }
}

export function loadProducts() {
  const stored = readStorage(INVENTORY_STORAGE_KEY, [])

  if (!Array.isArray(stored)) {
    return []
  }

  return stored
    .filter((product) => isValidProduct(product))
    .map((product) => normaliseProduct(product))
}

export function persistProducts(products) {
  const normalised = Array.isArray(products)
    ? products.map((product) => normaliseProduct(product))
    : []

  const ok = writeStorage(INVENTORY_STORAGE_KEY, normalised)
  return { ok, products: normalised }
}

export function saveProducts(products) {
  return persistProducts(products).products
}

export function createProduct(input, existingProducts = []) {
  const product = normaliseProduct(input)
  const skuKey = product.sku

  const hasDuplicate = existingProducts.some(
    (existing) =>
      normaliseSku(existing.sku) === skuKey && existing.id !== product.id,
  )

  if (hasDuplicate) {
    throw new Error('A product with this SKU already exists.')
  }

  const now = new Date().toISOString()
  const newProduct = {
    ...product,
    id: product.id || generateId(),
    createdAt: now,
    updatedAt: now,
  }

  return newProduct
}

export function updateProduct(input, existingProducts = []) {
  const product = normaliseProduct(input)
  const skuKey = product.sku

  const hasDuplicate = existingProducts.some(
    (existing) =>
      normaliseSku(existing.sku) === skuKey && existing.id !== product.id,
  )

  if (hasDuplicate) {
    throw new Error('A product with this SKU already exists.')
  }

  const now = new Date().toISOString()
  return {
    ...product,
    updatedAt: now,
  }
}
