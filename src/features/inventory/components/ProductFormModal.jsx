import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import { inventoryCategories } from '../inventoryCategories'
import { normaliseSku } from '../../../utils/ids'

const emptyValues = {
  id: '',
  name: '',
  sku: '',
  category: inventoryCategories[0],
  description: '',
  costPrice: '',
  sellingPrice: '',
  quantity: '',
  lowStockThreshold: '',
}

function validate(values) {
  const errors = {}

  if (!values.name || !String(values.name).trim()) {
    errors.name = 'Product name is required.'
  }

  if (!normaliseSku(values.sku)) {
    errors.sku = 'SKU is required.'
  }

  if (values.costPrice === '' || values.costPrice === null || values.costPrice === undefined) {
    errors.costPrice = 'Cost price is required.'
  } else if (Number(values.costPrice) < 0) {
    errors.costPrice = 'Cost price cannot be negative.'
  }

  if (values.sellingPrice === '' || values.sellingPrice === null || values.sellingPrice === undefined) {
    errors.sellingPrice = 'Selling price is required.'
  } else if (Number(values.sellingPrice) < 0) {
    errors.sellingPrice = 'Selling price cannot be negative.'
  }

  if (values.quantity === '' || values.quantity === null || values.quantity === undefined) {
    errors.quantity = 'Quantity is required.'
  } else if (Number(values.quantity) < 0) {
    errors.quantity = 'Quantity cannot be negative.'
  }

  if (values.lowStockThreshold === '' || values.lowStockThreshold === null || values.lowStockThreshold === undefined) {
    errors.lowStockThreshold = 'Low stock threshold is required.'
  } else if (Number(values.lowStockThreshold) < 0) {
    errors.lowStockThreshold = 'Low stock threshold cannot be negative.'
  }

  return errors
}

function getInitialValues(product) {
  if (product) {
    return {
      id: product.id || '',
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || inventoryCategories[0],
      description: product.description || '',
      costPrice: product.costPrice ?? '',
      sellingPrice: product.sellingPrice ?? '',
      quantity: product.quantity ?? '',
      lowStockThreshold: product.lowStockThreshold ?? '',
    }
  }
  return { ...emptyValues }
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  product,
  error,
}) {
  const [values, setValues] = useState(() => getInitialValues(product))
  const [formErrors, setFormErrors] = useState({})
  const [lastKey, setLastKey] = useState(null)

  if (open) {
    const key = product?.id || 'new'
    if (lastKey !== key) {
      setLastKey(key)
      setValues(getInitialValues(product))
      setFormErrors({})
    }
  } else if (lastKey !== null) {
    setLastKey(null)
  }

  function handleClose() {
    setFormErrors({})
    onClose()
  }

  function handleChange(field) {
    return (event) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const errors = validate(values)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    onSubmit({
      ...values,
      costPrice: Number(values.costPrice),
      sellingPrice: Number(values.sellingPrice),
      quantity: Number(values.quantity),
      lowStockThreshold: Number(values.lowStockThreshold),
    })
  }

  const isEditing = Boolean(product?.id)
  const formKey = product?.id || 'new'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Edit product' : 'Add product'}
      description={
        isEditing
          ? 'Update product details and stock information.'
          : 'Add a new product to your inventory.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form={`product-form-${formKey}`}>
            {isEditing ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form
        id={`product-form-${formKey}`}
        className="grid gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="product-name"
            label="Product name"
            value={values.name}
            onChange={handleChange('name')}
            error={formErrors.name}
            required
          />
          <Input
            id="product-sku"
            label="SKU"
            value={values.sku}
            onChange={handleChange('sku')}
            error={formErrors.sku}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="product-category"
            label="Category"
            value={values.category}
            onChange={handleChange('category')}
          >
            {inventoryCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input
            id="product-low-stock"
            label="Low stock threshold"
            type="number"
            min="0"
            step="1"
            value={values.lowStockThreshold}
            onChange={handleChange('lowStockThreshold')}
            error={formErrors.lowStockThreshold}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="product-cost"
            label="Cost price (₦)"
            type="number"
            min="0"
            step="0.01"
            value={values.costPrice}
            onChange={handleChange('costPrice')}
            error={formErrors.costPrice}
            required
          />
          <Input
            id="product-selling"
            label="Selling price (₦)"
            type="number"
            min="0"
            step="0.01"
            value={values.sellingPrice}
            onChange={handleChange('sellingPrice')}
            error={formErrors.sellingPrice}
            required
          />
          <Input
            id="product-quantity"
            label="Quantity in stock"
            type="number"
            min="0"
            step="1"
            value={values.quantity}
            onChange={handleChange('quantity')}
            error={formErrors.quantity}
            required
          />
        </div>

        <Textarea
          id="product-description"
          label="Description (optional)"
          value={values.description}
          onChange={handleChange('description')}
          rows={4}
        />
      </form>
    </Modal>
  )
}
