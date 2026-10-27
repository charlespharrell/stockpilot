import { useMemo, useState } from 'react'
import {
  Calendar,
  Edit,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useExpenses } from '../../hooks/useExpenses'
import { formatCurrency } from '../../utils/formatCurrency'
import { EXPENSE_CATEGORIES, getLocalDateString, validateExpense } from './expensesService'

function getInitialForm() {
  return {
    description: '',
    category: '',
    amount: '',
    date: getLocalDateString(),
    notes: '',
    paymentMethod: '',
  }
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export default function ExpensesPage() {
  useDocumentTitle('Expenses · StockPilot')
  const { expenses, summary, addExpense, editExpense, removeExpense } = useExpenses()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(getInitialForm)
  const [errors, setErrors] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((expense) => {
      const matchesSearch = search
        ? expense.description.toLowerCase().includes(search.toLowerCase()) ||
          (expense.notes || '').toLowerCase().includes(search.toLowerCase())
        : true
      const matchesCategory =
        categoryFilter === 'all' ? true : expense.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date))
    return result
  }, [expenses, search, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredExpenses.slice(start, start + pageSize)
  }, [filteredExpenses, safeCurrentPage, pageSize])

  function openAdd() {
    setEditingId(null)
    setForm(getInitialForm())
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(expense) {
    setEditingId(expense.id)
    setForm({
      description: expense.description || '',
      category: expense.category || '',
      amount: expense.amount ?? '',
      date: expense.date || getLocalDateString(),
      notes: expense.notes || '',
      paymentMethod: expense.paymentMethod || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setErrors({})
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validation = validateExpense(form)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    if (editingId) {
      const existing = expenses.find((e) => e.id === editingId)
      if (existing) {
        editExpense({ ...existing, ...form })
      }
    } else {
      addExpense(form)
      setCurrentPage(1)
    }
    closeModal()
  }

  function confirmDelete() {
    if (deleteId) {
      removeExpense(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Expenses"
        title="Expenses"
        description="Track spending, categorise costs and keep expenses organised."
      >
        <Badge tone="brand">
          <Wallet className="size-3.5" aria-hidden="true" />
          {summary.totalCount} {summary.totalCount === 1 ? 'record' : 'records'}
        </Badge>
        <Button onClick={openAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add expense
        </Button>
      </PageHeader>

      <section aria-labelledby="expense-summary-heading">
        <h2 id="expense-summary-heading" className="sr-only">
          Expense summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink-muted">Total recorded expenses</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.totalAmount)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {summary.totalCount} {summary.totalCount === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                <Wallet className="size-4" aria-hidden="true" />
              </span>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink-muted">Expenses recorded today</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.todayAmount)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {summary.todayCount} {summary.todayCount === 1 ? 'entry' : 'entries'} today
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Calendar className="size-4" aria-hidden="true" />
              </span>
            </div>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by description or notes"
                className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                aria-label="Search expenses"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filter by category"
              className="sm:w-56"
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={Wallet}
              title={expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}
              description={
                expenses.length === 0
                  ? 'Add your first expense to start tracking spending.'
                  : 'Try adjusting your search or category filter.'
              }
              action={
                expenses.length === 0 ? (
                  <Button onClick={openAdd}>
                    <Plus className="size-4" aria-hidden="true" />
                    Add expense
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-left text-ink-muted">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Payment</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paginatedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-canvas/40">
                      <td className="px-6 py-4 text-ink-muted">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-ink">{expense.description}</p>
                          {expense.notes ? (
                            <p className="mt-1 text-xs text-ink-muted">{expense.notes}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {expense.paymentMethod || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-ink">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(expense)}
                            aria-label={`Edit ${expense.description}`}
                          >
                            <Edit className="size-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(expense.id)}
                            aria-label={`Delete ${expense.description}`}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-line md:hidden">
              {paginatedExpenses.map((expense) => (
                <div key={expense.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{expense.description}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatDate(expense.date)} · {expense.category}
                        {expense.paymentMethod ? ` · ${expense.paymentMethod}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  {expense.notes ? (
                    <p className="text-xs text-ink-muted">{expense.notes}</p>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(expense)}>
                      <Edit className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(expense.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          totalItems={filteredExpenses.length}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit expense' : 'Add expense'}
        description="Record a business expense with category and amount."
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Save changes' : 'Add expense'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="e.g., Office rent"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              error={errors.category}
              required
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Input
              label="Amount (₦)"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              error={errors.amount}
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              error={errors.date}
              required
            />
            <Input
              label="Payment method (optional)"
              value={form.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              placeholder="e.g., Cash, Bank transfer"
            />
          </div>
          <Textarea
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional details"
            rows={3}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete expense"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Are you sure you want to delete this expense record?
        </p>
      </Modal>
    </div>
  )
}
