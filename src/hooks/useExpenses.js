import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createExpense,
  getLocalDateString,
  loadExpenses,
  saveExpenses,
} from '../features/expenses/expensesService'

let globalExpenses = loadExpenses()
const listeners = new Set()

function notifyListeners() {
  for (const listener of listeners) {
    listener(globalExpenses)
  }
}

function updateGlobalExpenses(nextExpenses) {
  globalExpenses = nextExpenses
  notifyListeners()
}

export function reloadExpensesFromStorage() {
  const fresh = loadExpenses()
  updateGlobalExpenses(fresh)
  return fresh
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(globalExpenses)

  useEffect(() => {
    const listener = (nextExpenses) => {
      setExpenses(nextExpenses)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key.includes('expenses')) {
        const fresh = loadExpenses()
        updateGlobalExpenses(fresh)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const persist = useCallback((nextExpenses) => {
    const saved = saveExpenses(nextExpenses)
    updateGlobalExpenses(saved)
    return saved
  }, [])

  const addExpense = useCallback(
    (input) => {
      const newExpense = createExpense(input)
      persist([newExpense, ...globalExpenses])
      return newExpense
    },
    [persist],
  )

  const editExpense = useCallback(
    (input) => {
      const now = new Date().toISOString()
      const updated = {
        ...input,
        updatedAt: now,
      }
      const next = globalExpenses.map((expense) =>
        expense.id === updated.id ? { ...expense, ...updated } : expense,
      )
      persist(next)
      return updated
    },
    [persist],
  )

  const removeExpense = useCallback(
    (id) => {
      const next = globalExpenses.filter((expense) => expense.id !== id)
      persist(next)
    },
    [persist],
  )

  const summary = useMemo(() => {
    const today = getLocalDateString()
    const todayExpenses = expenses.filter((e) => e.date === today)
    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const todayAmount = todayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    return {
      totalCount: expenses.length,
      totalAmount,
      todayCount: todayExpenses.length,
      todayAmount,
    }
  }, [expenses])

  return {
    expenses,
    summary,
    addExpense,
    editExpense,
    removeExpense,
  }
}
