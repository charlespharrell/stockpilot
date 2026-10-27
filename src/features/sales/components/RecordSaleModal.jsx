import { useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { formatCurrency } from '../../../utils/formatCurrency'
import { useInventory } from '../../../hooks/useInventory'
import { validateSaleStock } from '../salesService'

const paymentMethods = ['Cash', 'POS/Card', 'Transfer', 'Mobile Money']

export default function RecordSaleModal({ open, onClose, onSubmit }) {
  const { products } = useInventory()
  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)

  function addItem() {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  function updateItem(index, field, value) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].unitPrice = product.sellingPrice
        newItems[index].name = product.name
        newItems[index].sku = product.sku
      }
    }
    
    setItems(newItems)
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isSubmittingRef.current) {
      return
    }

    setError('')

    try {
      validateSaleStock(items, products)
    } catch (validationError) {
      setError(validationError.message)
      return
    }

    const processedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        productId: item.productId,
        name: product?.name || item.name,
        sku: product?.sku || item.sku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.quantity) * Number(item.unitPrice)
      }
    })

    const subtotal = processedItems.reduce((sum, item) => sum + item.lineTotal, 0)

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      await onSubmit({
        items: processedItems,
        subtotal,
        discount: 0,
        total: subtotal,
        paymentMethod,
        customerName,
        notes,
        status: 'Completed',
      })

      setItems([])
      setPaymentMethod('Cash')
      setCustomerName('')
      setNotes('')
      setError('')
    } catch (submitError) {
      setError(
        submitError?.message ||
          'The sale could not be saved. Your inventory was not intentionally changed.',
      )
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setItems([])
    setPaymentMethod('Cash')
    setCustomerName('')
    setNotes('')
    setError('')
    onClose()
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
  }, 0)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Record sale"
      description="Add items and complete a sale. Stock will be deducted automatically."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="sale-form" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Complete sale'}
          </Button>
        </>
      }
    >
      <form id="sale-form" className="grid gap-4" onSubmit={handleSubmit} noValidate>
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Items</p>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Button>
          </div>
          
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-ink-muted">
              No items added yet
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                  <div>
                    <label className="text-xs font-medium text-ink-muted">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink"
                    >
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {formatCurrency(p.sellingPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Unit price (₦)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-rose-600"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end border-t border-line pt-3">
            <div className="text-right">
              <p className="text-sm text-ink-muted">Subtotal</p>
              <p className="text-lg font-semibold text-ink">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="payment-method"
            label="Payment method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </Select>
          <Input
            id="customer-name"
            label="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        
        <Input
          id="sale-notes"
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  )
}
