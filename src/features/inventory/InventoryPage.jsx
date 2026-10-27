import { useMemo, useState } from 'react'
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useInventory } from '../../hooks/useInventory'
import { inventoryCategories } from './inventoryCategories'
import {
  formatProductPrice,
  getStockStatus,
  getStockStatusClasses,
  getStockStatusLabel,
} from './inventoryUtils'
import ProductFormModal from './components/ProductFormModal'

const stockStatusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
]

const sortOptions = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'quantity-asc', label: 'Quantity (low to high)' },
  { value: 'quantity-desc', label: 'Quantity (high to low)' },
  { value: 'price-asc', label: 'Selling price (low to high)' },
  { value: 'price-desc', label: 'Selling price (high to low)' },
]

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export default function InventoryPage() {
  useDocumentTitle('Inventory · StockPilot')

  const {
    products,
    summary,
    alertThreshold,
    addProduct,
    editProduct,
    removeProduct,
  } = useInventory()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formError, setFormError] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [stockStatus, setStockStatus] = useState('all')
  const [sort, setSort] = useState('name-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = products.map((product) => ({
      ...product,
      status: getStockStatus(product, alertThreshold),
    }))

    if (query) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      )
    }

    if (category !== 'all') {
      result = result.filter((product) => product.category === category)
    }

    if (stockStatus !== 'all') {
      result = result.filter((product) => product.status === stockStatus)
    }

    result.sort((a, b) => {
      if (sort === 'name-desc') {
        return b.name.localeCompare(a.name)
      }
      if (sort === 'quantity-asc') {
        return a.quantity - b.quantity
      }
      if (sort === 'quantity-desc') {
        return b.quantity - a.quantity
      }
      if (sort === 'price-asc') {
        return a.sellingPrice - b.sellingPrice
      }
      if (sort === 'price-desc') {
        return b.sellingPrice - a.sellingPrice
      }
      return a.name.localeCompare(b.name)
    })

    return result
  }, [alertThreshold, category, products, search, sort, stockStatus])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, safeCurrentPage, pageSize])

  function openAddModal() {
    setEditingProduct(null)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
    setFormError('')
  }

  function handleSubmit(values) {
    setFormError('')
    try {
      if (editingProduct?.id) {
        editProduct({ ...values, id: editingProduct.id })
      } else {
        addProduct(values)
      }
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" (${product.sku})? This action cannot be undone.`,
    )

    if (confirmed) {
      removeProduct(product.id)
    }
  }

  function clearFilters() {
    setSearch('')
    setCategory('all')
    setStockStatus('all')
    setSort('name-asc')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    search.trim() !== '' || category !== 'all' || stockStatus !== 'all'

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Inventory"
        title="Inventory management"
        description="Add, edit, search and track products with stock statuses and low-stock alerts."
      >
        <Button onClick={openAddModal}>
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Button>
      </PageHeader>

      <section aria-labelledby="inventory-summary">
        <h2 id="inventory-summary" className="sr-only">
          Inventory summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">
                  Total products
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.total}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                <Package className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Products stored in this browser.
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">
                  Low stock products
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.lowStock}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Quantity is above 0 and at or below the product or workspace alert
              level.
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-muted">
                  Out of stock products
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.outOfStock}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Quantity is 0.
            </p>
          </Card>
        </div>
      </section>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters and sorting
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <Input
                id="inventory-search"
                label={null}
                placeholder="Search by name or SKU"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              id="inventory-category"
              label="Category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">All categories</option>
              {inventoryCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              id="inventory-status"
              label="Stock status"
              value={stockStatus}
              onChange={(event) => {
                setStockStatus(event.target.value)
                setCurrentPage(1)
              }}
            >
              {stockStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              id="inventory-sort"
              label="Sort by"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value)
                setCurrentPage(1)
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {hasActiveFilters ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Start building your catalogue by adding your first product. Prices, quantities and reorder thresholds are all supported."
          items={[
            'Add product name, SKU and category',
            'Set cost and selling prices in NGN',
            'Track quantities and low-stock thresholds',
            'Edit or remove products at any time',
          ]}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No products match your filters"
          description="Try adjusting your search, category or stock status filters to find what you are looking for."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-y border-line bg-canvas/60">
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Product
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Category
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Cost / Selling
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Quantity
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Product threshold
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Status
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Updated
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-ink-muted">{product.sku}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {product.category}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-ink">
                          {formatProductPrice(product.sellingPrice)}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Cost: {formatProductPrice(product.costPrice)}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-ink">{product.quantity}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        {product.lowStockThreshold}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStockStatusClasses(
                            product.status,
                          )}`}
                        >
                          {getStockStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-muted">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => handleDelete(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-line lg:hidden">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-ink-muted">
                      {product.sku} · {product.category}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStockStatusClasses(
                      product.status,
                    )}`}
                  >
                    {getStockStatusLabel(product.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-ink-muted">Selling price</p>
                    <p className="font-medium text-ink">
                      {formatProductPrice(product.sellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">
                      Quantity / product threshold
                    </p>
                    <p className="text-ink">
                      {product.quantity} / {product.lowStockThreshold}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Cost price</p>
                    <p className="text-ink-muted">
                      {formatProductPrice(product.costPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Updated</p>
                    <p className="text-ink-muted">
                      {formatDate(product.updatedAt)}
                    </p>
                  </div>
                </div>
                {product.description ? (
                  <p className="text-xs leading-5 text-ink-muted">
                    {product.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleDelete(product)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            totalItems={filteredProducts.length}
          />
        </Card>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={editingProduct}
        error={formError}
      />
    </div>
  )
}
