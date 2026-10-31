import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  loadSales,
  persistSales,
  prepareSale,
} from '../features/sales/salesService'
import {
  INVENTORY_STORAGE_KEY,
  persistProducts,
} from '../features/inventory/inventoryService'
import { getLocalDateString } from '../features/expenses/expensesService'
import {
  restoreStorageSnapshot,
  snapshotStorage,
} from '../services/storage'
import { useInventory } from './useInventory'

let globalSales = loadSales()
const listeners = new Set()

function notifyListeners() {
  for (const listener of listeners) {
    listener(globalSales)
  }
}

function updateGlobalSales(nextSales) {
  globalSales = nextSales
  notifyListeners()
}

export function reloadSalesFromStorage() {
  const fresh = loadSales()
  updateGlobalSales(fresh)
  return fresh
}

export function useSales() {
  const [sales, setSales] = useState(globalSales)
  const { products, applyPersistedProducts } = useInventory()

  useEffect(() => {
    const listener = (nextSales) => {
      setSales(nextSales)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key.includes('sales-transactions')) {
        const fresh = loadSales()
        updateGlobalSales(fresh)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const recordSale = useCallback(
    (input) => {
      const { sale, updatedProducts } = prepareSale(input, products)
      const inventorySnapshot = snapshotStorage(INVENTORY_STORAGE_KEY)

      if (!inventorySnapshot.ok) {
        throw new Error(
          'Could not read the current inventory snapshot. No changes were made.',
        )
      }

      const inventoryWrite = persistProducts(updatedProducts)

      if (!inventoryWrite.ok) {
        throw new Error(
          'The updated inventory could not be saved. The sale was not recorded and stock was not changed.',
        )
      }

      let salesWrite

      try {
        salesWrite = persistSales([sale, ...globalSales])
      } catch {
        salesWrite = { ok: false }
      }

      if (!salesWrite.ok) {
        const restored = restoreStorageSnapshot(
          INVENTORY_STORAGE_KEY,
          inventorySnapshot,
        )

        if (!restored) {
          throw new Error(
            'The sale could not be saved and inventory rollback failed. Do not retry until you reload and check stock levels. localStorage cannot guarantee a transaction across multiple keys.',
          )
        }

        throw new Error(
          'The sale could not be saved. Inventory was restored to its previous quantities.',
        )
      }

      applyPersistedProducts(inventoryWrite.products)
      updateGlobalSales(salesWrite.sales)
      return sale
    },
    [applyPersistedProducts, products],
  )

  const summary = useMemo(() => {
    const today = getLocalDateString()
    const todaySales = sales.filter(s => s.date === today)
    const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
    
    return {
      todayRevenue,
      todayCount: todaySales.length,
      totalRevenue,
      totalCount: sales.length,
    }
  }, [sales])

  return {
    sales,
    summary,
    recordSale,
  }
}
