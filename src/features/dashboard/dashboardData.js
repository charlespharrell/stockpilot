import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

const salesDataThisWeek = [
  { day: 'Mon', sales: 845000, expenses: 520000 },
  { day: 'Tue', sales: 920000, expenses: 540000 },
  { day: 'Wed', sales: 1125000, expenses: 600000 },
  { day: 'Thu', sales: 980000, expenses: 565000 },
  { day: 'Fri', sales: 1340000, expenses: 680000 },
  { day: 'Sat', sales: 1560000, expenses: 720000 },
  { day: 'Sun', sales: 875000, expenses: 495000 },
]

const salesDataLastWeek = [
  { day: 'Mon', sales: 780000, expenses: 500000 },
  { day: 'Tue', sales: 860000, expenses: 525000 },
  { day: 'Wed', sales: 1020000, expenses: 580000 },
  { day: 'Thu', sales: 920000, expenses: 555000 },
  { day: 'Fri', sales: 1180000, expenses: 640000 },
  { day: 'Sat', sales: 1380000, expenses: 680000 },
  { day: 'Sun', sales: 820000, expenses: 480000 },
]

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

const totalSalesThisWeek = sum(salesDataThisWeek.map((item) => item.sales))
const totalExpensesThisWeek = sum(salesDataThisWeek.map((item) => item.expenses))
const estimatedProfitThisWeek = totalSalesThisWeek - totalExpensesThisWeek

const totalSalesLastWeek = sum(salesDataLastWeek.map((item) => item.sales))
const totalExpensesLastWeek = sum(salesDataLastWeek.map((item) => item.expenses))
const estimatedProfitLastWeek = totalSalesLastWeek - totalExpensesLastWeek

function getChange(current, previous) {
  if (previous === 0) {
    return null
  }
  const difference = current - previous
  const percentage = (difference / previous) * 100

  return {
    difference,
    percentage: Number(percentage.toFixed(1)),
    direction: difference >= 0 ? 'up' : 'down',
  }
}

export const periodOptions = [
  { label: 'This week', value: 'this-week' },
  { label: 'Last week', value: 'last-week' },
]

export const salesTrends = {
  'this-week': {
    data: salesDataThisWeek,
    totalSales: totalSalesThisWeek,
    totalExpenses: totalExpensesThisWeek,
    estimatedProfit: estimatedProfitThisWeek,
  },
  'last-week': {
    data: salesDataLastWeek,
    totalSales: totalSalesLastWeek,
    totalExpenses: totalExpensesLastWeek,
    estimatedProfit: estimatedProfitLastWeek,
  },
}

export const overviewMetrics = [
  {
    id: 'sales',
    label: 'Total sales (this week)',
    value: totalSalesThisWeek,
    displayValue: formatCurrency(totalSalesThisWeek),
    helper: 'Sum of sample sales across Mon–Sun.',
    change: getChange(totalSalesThisWeek, totalSalesLastWeek),
    icon: CircleDollarSign,
    tone: 'brand',
  },
  {
    id: 'expenses',
    label: 'Total expenses (this week)',
    value: totalExpensesThisWeek,
    displayValue: formatCurrency(totalExpensesThisWeek),
    helper: 'Sample operating costs for the same period.',
    change: getChange(totalExpensesThisWeek, totalExpensesLastWeek),
    icon: Wallet,
    tone: 'brand',
  },
  {
    id: 'profit',
    label: 'Estimated profit (this week)',
    value: estimatedProfitThisWeek,
    displayValue: formatCurrency(estimatedProfitThisWeek),
    helper: 'Calculated as sales − expenses (illustrative only).',
    change: getChange(estimatedProfitThisWeek, estimatedProfitLastWeek),
    icon: ArrowUpRight,
    tone: estimatedProfitThisWeek >= 0 ? 'brand' : 'warning',
  },
  {
    id: 'products',
    label: 'Total products',
    value: 248,
    displayValue: '248',
    helper: 'Sample catalogue items across 12 categories.',
    change: null,
    icon: Package,
    tone: 'brand',
  },
]

export const lowStockAlerts = [
  {
    id: 'sp-001',
    name: 'Paracetamol 500mg',
    sku: 'MED-PAR-500',
    stock: 4,
    reorderLevel: 12,
    category: 'Pharmacy',
    status: 'low',
  },
  {
    id: 'sp-002',
    name: 'Laundry Detergent 2kg',
    sku: 'HM-DET-2KG',
    stock: 3,
    reorderLevel: 10,
    category: 'Household',
    status: 'low',
  },
  {
    id: 'sp-003',
    name: 'Coca-Cola 1.5L',
    sku: 'BEV-COKE-15',
    stock: 6,
    reorderLevel: 18,
    category: 'Beverages',
    status: 'low',
  },
  {
    id: 'sp-004',
    name: 'Cooking Oil 5L',
    sku: 'GR-OIL-5L',
    stock: 0,
    reorderLevel: 8,
    category: 'Groceries',
    status: 'out-of-stock',
  },
  {
    id: 'sp-005',
    name: 'Toilet Tissue 10 Rolls',
    sku: 'HM-TISS-10',
    stock: 2,
    reorderLevel: 15,
    category: 'Household',
    status: 'low',
  },
]

export const recentTransactions = [
  {
    id: 'TXN-1001',
    reference: 'INV-1001',
    date: '2026-10-27',
    time: '10:42',
    amount: 48500,
    paymentMethod: 'Cash',
    status: 'Completed',
  },
  {
    id: 'TXN-1002',
    reference: 'INV-1002',
    date: '2026-10-27',
    time: '11:18',
    amount: 127500,
    paymentMethod: 'POS/Card',
    status: 'Completed',
  },
  {
    id: 'TXN-1003',
    reference: 'INV-1003',
    date: '2026-10-27',
    time: '12:06',
    amount: 24600,
    paymentMethod: 'Transfer',
    status: 'Completed',
  },
  {
    id: 'TXN-1004',
    reference: 'INV-1004',
    date: '2026-10-27',
    time: '13:24',
    amount: 89200,
    paymentMethod: 'POS/Card',
    status: 'Completed',
  },
  {
    id: 'TXN-1005',
    reference: 'INV-1005',
    date: '2026-10-27',
    time: '14:17',
    amount: 15400,
    paymentMethod: 'Cash',
    status: 'Pending',
  },
  {
    id: 'TXN-1006',
    reference: 'INV-1006',
    date: '2026-10-26',
    time: '16:52',
    amount: 168000,
    paymentMethod: 'Transfer',
    status: 'Completed',
  },
]

export { ArrowDownRight, ArrowUpRight }
