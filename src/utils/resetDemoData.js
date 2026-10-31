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

function inspectExistingRecords(key) {
  const snapshot = snapshotStorage(key)

  if (!snapshot.ok) {
    return {
      ok: false,
      snapshot: null,
      message: `Could not safely read existing ${STORAGE_LABELS[key]} records. Nothing was changed.`,
    }
  }

  if (!snapshot.exists) {
    return { ok: true, snapshot, count: 0 }
  }

  try {
    const parsed = JSON.parse(snapshot.raw)

    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        snapshot,
        message: `Existing ${STORAGE_LABELS[key]} data is not a valid record list. Nothing was changed.`,
      }
    }

    return { ok: true, snapshot, count: parsed.length }
  } catch {
    return {
      ok: false,
      snapshot,
      message: `Existing ${STORAGE_LABELS[key]} data could not be read. Nothing was changed.`,
    }
  }
}

function rollbackSnapshots(snapshots) {
  const failures = []

  for (const key of STORAGE_KEYS) {
    if (!restoreStorageSnapshot(key, snapshots[key])) {
      failures.push(STORAGE_LABELS[key])
    }
  }

  return failures
}

export function loadDemoDataIfEmpty() {
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
      reason: 'generation-failed',
      message: `Could not prepare demo data: ${error.message}`,
    }
  }

  const snapshots = {}
  const existingCounts = {}

  for (const key of STORAGE_KEYS) {
    const inspection = inspectExistingRecords(key)

    if (!inspection.ok) {
      return {
        success: false,
        reason: 'unreadable-existing-data',
        message: inspection.message,
      }
    }

    snapshots[key] = inspection.snapshot
    existingCounts[STORAGE_LABELS[key]] = inspection.count
  }

  const hasExistingRecords = STORAGE_KEYS.some(
    (key) => existingCounts[STORAGE_LABELS[key]] > 0,
  )

  if (hasExistingRecords) {
    return {
      success: false,
      reason: 'existing-data',
      message: `Demo data was not loaded because existing records were found (inventory: ${existingCounts.inventory}, sales: ${existingCounts.sales}, expenses: ${existingCounts.expenses}). Existing data was not overwritten.`,
      counts: existingCounts,
    }
  }

  const writes = [
    { key: INVENTORY_STORAGE_KEY, value: products },
    { key: SALES_STORAGE_KEY, value: sales },
    { key: EXPENSES_STORAGE_KEY, value: expenses },
  ]

  for (const write of writes) {
    if (!writeStorage(write.key, write.value)) {
      const rollbackFailures = rollbackSnapshots(snapshots)
      const failedLabel = STORAGE_LABELS[write.key]

      if (rollbackFailures.length > 0) {
        return {
          success: false,
          reason: 'write-failed',
          message: `Demo data failed while writing ${failedLabel} records, and rollback failed for ${rollbackFailures.join(
            ', ',
          )}. Reload and review your records before continuing.`,
          failedKey: write.key,
          rollbackFailures,
        }
      }

      return {
        success: false,
        reason: 'write-failed',
        message: `Demo data failed while writing ${failedLabel} records. Existing records were restored.`,
        failedKey: write.key,
        rollbackFailures: [],
      }
    }
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
