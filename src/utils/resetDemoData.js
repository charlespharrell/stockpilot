import {
  restoreStorageSnapshot,
  snapshotStorage,
  writeStorage,
} from '../services/storage'
import { INVENTORY_STORAGE_KEY } from '../features/inventory/inventoryService'
import { SALES_STORAGE_KEY } from '../features/sales/salesService'
import { EXPENSES_STORAGE_KEY } from '../features/expenses/expensesService'
import {
  calculateInventoryQuantities,
  generateDemoExpenses,
  generateDemoProducts,
  generateDemoSales,
} from './demoData'

const STORAGE_LABELS = {
  [INVENTORY_STORAGE_KEY]: 'inventory',
  [SALES_STORAGE_KEY]: 'sales',
  [EXPENSES_STORAGE_KEY]: 'expenses',
}

const STORAGE_KEYS = [
  INVENTORY_STORAGE_KEY,
  SALES_STORAGE_KEY,
  EXPENSES_STORAGE_KEY,
]

function rollbackSnapshots(snapshots, writtenKeys) {
  const failures = []

  for (const key of writtenKeys) {
    if (!restoreStorageSnapshot(key, snapshots[key])) {
      failures.push(STORAGE_LABELS[key])
    }
  }

  return failures
}

export function resetAndLoadDemoData() {
  let products
  let sales
  let expenses

  try {
    const generatedProducts = generateDemoProducts()
    const generatedSales = generateDemoSales(generatedProducts)
    products = calculateInventoryQuantities(generatedProducts, generatedSales)
    sales = generatedSales
    expenses = generateDemoExpenses()
  } catch (error) {
    return {
      success: false,
      error: `Could not prepare demo data: ${error.message}`,
    }
  }

  const snapshots = {}

  for (const key of STORAGE_KEYS) {
    const snapshot = snapshotStorage(key)

    if (!snapshot.ok) {
      return {
        success: false,
        error: `Could not read existing ${STORAGE_LABELS[key]} records, so no data was changed.`,
      }
    }

    snapshots[key] = snapshot
  }

  const writes = [
    { key: INVENTORY_STORAGE_KEY, value: products },
    { key: SALES_STORAGE_KEY, value: sales },
    { key: EXPENSES_STORAGE_KEY, value: expenses },
  ]
  const writtenKeys = []

  for (const write of writes) {
    if (!writeStorage(write.key, write.value)) {
      const rollbackFailures = rollbackSnapshots(snapshots, writtenKeys)
      const failedLabel = STORAGE_LABELS[write.key]

      if (rollbackFailures.length > 0) {
        return {
          success: false,
          error: `Demo reset failed while writing ${failedLabel} data, and rollback failed for ${rollbackFailures.join(
            ', ',
          )}. Reload and review your records before continuing.`,
          failedKey: write.key,
          rollbackFailures,
        }
      }

      return {
        success: false,
        error: `Demo reset failed while writing ${failedLabel} data. Previous records were restored.`,
        failedKey: write.key,
        rollbackFailures: [],
      }
    }

    writtenKeys.push(write.key)
  }

  return {
    success: true,
    counts: {
      products: products.length,
      sales: sales.length,
      expenses: expenses.length,
    },
  }
}
