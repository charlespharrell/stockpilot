import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createProduct,
  loadProducts,
  saveProducts,
  updateProduct,
} from '../features/inventory/inventoryService'
import { getStockStatus } from '../features/inventory/inventoryUtils'
import { useSettings } from './useSettings'

let globalProducts = loadProducts()
const listeners = new Set()

function notifyListeners() {
  for (const listener of listeners) {
    listener(globalProducts)
  }
}

function updateGlobalProducts(nextProducts) {
  globalProducts = nextProducts
  notifyListeners()
}

export function useInventory() {
  const { settings } = useSettings()
  const alertThreshold = settings.lowStockThreshold
  const [products, setProducts] = useState(globalProducts)
  const isLoading = false

  useEffect(() => {
    const listener = (nextProducts) => {
      setProducts(nextProducts)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key.includes('inventory-products')) {
        const fresh = loadProducts()
        updateGlobalProducts(fresh)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const persist = useCallback((nextProducts) => {
    const saved = saveProducts(nextProducts)
    updateGlobalProducts(saved)
    return saved
  }, [])

  const applyPersistedProducts = useCallback((nextProducts) => {
    updateGlobalProducts(nextProducts)
  }, [])

  const addProduct = useCallback(
    (input) => {
      const newProduct = createProduct(input, globalProducts)
      persist([...globalProducts, newProduct])
      return newProduct
    },
    [persist],
  )

  const editProduct = useCallback(
    (input) => {
      const updated = updateProduct(input, globalProducts)
      const next = globalProducts.map((product) =>
        product.id === updated.id ? updated : product,
      )
      persist(next)
      return updated
    },
    [persist],
  )

  const removeProduct = useCallback(
    (id) => {
      const next = globalProducts.filter((product) => product.id !== id)
      persist(next)
    },
    [persist],
  )

  const summary = useMemo(() => {
    const total = products.length
    let lowStock = 0
    let outOfStock = 0

    for (const product of products) {
      const status = getStockStatus(product, alertThreshold)
      if (status === 'out-of-stock') {
        outOfStock += 1
      } else if (status === 'low') {
        lowStock += 1
      }
    }

    return {
      total,
      lowStock,
      outOfStock,
    }
  }, [alertThreshold, products])

  const lowStockItems = useMemo(() => {
    return products
      .map((product) => ({
        ...product,
        status: getStockStatus(product, alertThreshold),
      }))
      .filter(
        (product) => product.status === 'low' || product.status === 'out-of-stock',
      )
  }, [alertThreshold, products])

  return {
    products,
    isLoading,
    summary,
    lowStockItems,
    alertThreshold,
    addProduct,
    editProduct,
    removeProduct,
    applyPersistedProducts,
  }
}
