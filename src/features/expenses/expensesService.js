import { readStorage, writeStorage } from '../../services/storage'
import { generateId } from '../../utils/ids'

export const EXPENSES_STORAGE_KEY = 'expenses'

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Transport',
  'Salaries',
  'Inventory/Supplies',
  'Marketing',
  'Maintenance',
  'Other',
]

function getLocalDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isValidExpense(expense) {
  if (!expense || typeof expense !== 'object') {
    return false
  }
  const required = ['id', 'description', 'category', 'amount', 'date']
  return required.every((field) => field in expense)
}

function normaliseExpense(expense) {
  const now = new Date().toISOString()
  const todayLocal = getLocalDateString()
  
  return {
    id: expense.id || generateId('exp'),
    description: expense.description ? String(expense.description).trim() : '',
    category: expense.category ? String(expense.category).trim() : 'Other',
    amount: Number(expense.amount) || 0,
    date: expense.date || todayLocal,
    notes: expense.notes ? String(expense.notes).trim() : '',
    paymentMethod: expense.paymentMethod ? String(expense.paymentMethod).trim() : '',
    createdAt: expense.createdAt || now,
    updatedAt: expense.updatedAt || now,
  }
}

export function loadExpenses() {
  const stored = readStorage(EXPENSES_STORAGE_KEY, [])
  if (!Array.isArray(stored)) {
    return []
  }
  return stored
    .filter((expense) => isValidExpense(expense))
    .map((expense) => normaliseExpense(expense))
}

export function saveExpenses(expenses) {
  const normalised = Array.isArray(expenses)
    ? expenses.map((expense) => normaliseExpense(expense))
    : []
  writeStorage(EXPENSES_STORAGE_KEY, normalised)
  return normalised
}

export function createExpense(input) {
  const expense = normaliseExpense(input)
  const now = new Date().toISOString()
  return {
    ...expense,
    id: expense.id || generateId('exp'),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateExpense(input) {
  const now = new Date().toISOString()
  return {
    ...normaliseExpense(input),
    ...input,
    updatedAt: now,
  }
}

export function validateExpense(expense) {
  const errors = {}
  
  if (!expense.description || !String(expense.description).trim()) {
    errors.description = 'Description is required'
  }
  
  if (!expense.category) {
    errors.category = 'Category is required'
  }
  
  const amount = Number(expense.amount)
  if (expense.amount === '' || expense.amount === null || expense.amount === undefined) {
    errors.amount = 'Amount is required'
  } else if (Number.isNaN(amount)) {
    errors.amount = 'Amount must be a valid number'
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than zero'
  }
  
  if (!expense.date) {
    errors.date = 'Date is required'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export { getLocalDateString }

