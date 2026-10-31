import { normaliseSku } from './ids'

const PRODUCT_SEED = 0x5eed1001
const SALES_SEED = 0x5eed2002
const EXPENSES_SEED = 0x5eed3003
const DAY_IN_MS = 24 * 60 * 60 * 1000

const PRODUCT_GROUPS = [
  {
    category: 'Personal Care',
    names: [
      'Shea Butter Moisturizer',
      'Vitamin C Serum',
      'Sunscreen SPF 50',
      'Charcoal Face Wash',
      'Rose Water Toner',
      'Anti-Aging Cream',
      'Acne Treatment Gel',
      'Body Lotion',
      'Lip Balm',
      'Hand Cream',
    ],
  },
  {
    category: 'Groceries',
    names: [
      'Rice (50kg bag)',
      'Beans (Brown)',
      'Groundnut Oil',
      'Tomato Paste',
      'Salt',
      'Sugar',
      'Flour (Wheat)',
      'Onions',
      'Pepper (Chili)',
      'Maggi Cubes',
      'Milk Powder',
      'Garri',
    ],
  },
  {
    category: 'Beverages',
    names: [
      'Coca-Cola 50cl',
      'Fanta Orange 50cl',
      'Sprite 50cl',
      'Pepsi 50cl',
      'Malt Drink',
      'Fruit Juice',
      'Bottled Water',
      'Energy Drink',
      'Zobo Drink',
      'Chapman Mix',
    ],
  },
  {
    category: 'Bakery',
    names: [
      'White Bread',
      'Wheat Bread',
      'Meat Pie',
      'Egg Roll',
      'Doughnut',
      'Sausage Roll',
      'Cake Slice',
      'Croissant',
    ],
  },
  {
    category: 'Household',
    names: [
      'Detergent Powder',
      'Dishwashing Liquid',
      'Bleach',
      'Toilet Paper',
      'Air Freshener',
      'Bath Soap',
      'Washing Sponge',
      'Trash Bags',
      'Floor Cleaner',
      'Insecticide Spray',
    ],
  },
]

const EXPENSE_DATA = [
  { description: 'Shop Rent - Monthly', category: 'Rent', amount: 45000, dayOffset: 5 },
  { description: 'Electricity Bill', category: 'Utilities', amount: 8500, dayOffset: 3 },
  { description: 'Water Bill', category: 'Utilities', amount: 2500, dayOffset: 7 },
  { description: 'Staff Salaries', category: 'Salaries', amount: 85000, dayOffset: 2 },
  { description: 'Fuel for Delivery', category: 'Transport', amount: 5500, dayOffset: 1 },
  { description: 'Cleaning Supplies', category: 'Inventory/Supplies', amount: 3200, dayOffset: 4 },
  { description: 'Social Media Ads', category: 'Marketing', amount: 12000, dayOffset: 6 },
  { description: 'Generator Maintenance', category: 'Maintenance', amount: 4500, dayOffset: 8 },
  { description: 'Packaging Materials', category: 'Inventory/Supplies', amount: 2800, dayOffset: 10 },
  { description: 'Internet Subscription', category: 'Utilities', amount: 8500, dayOffset: 12 },
]

function createRandom(seed) {
  let state = seed >>> 0

  return function random() {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randomInRange(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min
}

function randomPrice(random, min, max) {
  return Math.round((random() * (max - min) + min) * 100) / 100
}

function getBaseDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toIsoAt(date, hour, minute) {
  const value = new Date(date)
  value.setHours(hour, minute, 0, 0)
  return value.toISOString()
}

export function generateDemoProducts() {
  const random = createRandom(PRODUCT_SEED)
  const base = getBaseDate()
  const createdAt = new Date(base.getTime() - 30 * DAY_IN_MS).toISOString()
  const products = []
  let skuCounter = 1000

  for (const group of PRODUCT_GROUPS) {
    for (const name of group.names) {
      skuCounter += 1
      const costPrice = randomPrice(random, 200, 5000)
      const markup = randomPrice(random, 1.2, 1.8)
      const sellingPrice = Math.round(costPrice * markup * 100) / 100

      products.push({
        id: `demo-prod-${String(products.length + 1).padStart(3, '0')}`,
        name,
        sku: normaliseSku(`DEMO-${skuCounter}`),
        category: group.category,
        description: `${name} - Quality product`,
        costPrice,
        sellingPrice,
        quantity: randomInRange(random, 0, 150),
        lowStockThreshold: randomInRange(random, 5, 30),
        createdAt,
        updatedAt: createdAt,
      })
    }
  }

  if (products.length > 0) {
    products[5].quantity = 3
    products[12].quantity = 2
    products[20].quantity = 0
    products[25].quantity = 4
    products[30].quantity = 0
  }

  return products
}

export function generateDemoSales(products) {
  const random = createRandom(SALES_SEED)
  const base = getBaseDate()
  const productList = Array.isArray(products) ? products : []

  if (productList.length === 0) {
    return []
  }

  const available = new Map(
    productList.map((product) => [
      product.id,
      Math.max(0, Math.floor(Number(product.quantity) || 0)),
    ]),
  )
  const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'POS']
  const customers = [
    'Walk-in Customer',
    'John A.',
    'Sarah M.',
    'Ahmed K.',
    'Grace O.',
    'Mike T.',
  ]
  const sales = []
  let saleCounter = 0

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    const saleDate = new Date(base)
    saleDate.setDate(saleDate.getDate() - dayOffset)
    const dateStr = toLocalDateString(saleDate)
    const numSales = randomInRange(random, 1, 4)

    for (let s = 0; s < numSales; s += 1) {
      const numItems = randomInRange(random, 1, 4)
      const items = []
      let subtotal = 0

      for (let i = 0; i < numItems; i += 1) {
        const candidates = productList.filter(
          (product) => (available.get(product.id) || 0) > 0,
        )

        if (candidates.length === 0) {
          break
        }

        const product = candidates[randomInRange(random, 0, candidates.length - 1)]
        const remaining = available.get(product.id) || 0
        const quantity = Math.min(randomInRange(random, 1, 3), remaining)

        if (quantity <= 0) {
          continue
        }

        available.set(product.id, remaining - quantity)
        const unitPrice = product.sellingPrice
        const lineTotal = quantity * unitPrice
        subtotal += lineTotal

        items.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          unitPrice,
          lineTotal,
        })
      }

      if (items.length === 0) {
        continue
      }

      saleCounter += 1
      const discount = 0
      const total = subtotal - discount
      const hour = randomInRange(random, 8, 18)
      const minute = randomInRange(random, 0, 59)
      const createdAt = toIsoAt(saleDate, hour, minute)

      sales.push({
        id: `demo-txn-${String(saleCounter).padStart(4, '0')}`,
        reference: `INV-DEMO-${String(saleCounter).padStart(4, '0')}`,
        date: dateStr,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        items,
        subtotal,
        discount,
        total,
        paymentMethod: paymentMethods[randomInRange(random, 0, paymentMethods.length - 1)],
        status: 'Completed',
        customerName: customers[randomInRange(random, 0, customers.length - 1)],
        notes: '',
        createdAt,
        updatedAt: createdAt,
      })
    }
  }

  return sales.sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
  )
}

export function generateDemoExpenses() {
  const random = createRandom(EXPENSES_SEED)
  const base = getBaseDate()

  const expenses = EXPENSE_DATA.map((expense, index) => {
    const expenseDate = new Date(base)
    expenseDate.setDate(expenseDate.getDate() - expense.dayOffset)
    const date = toLocalDateString(expenseDate)
    const createdAt = toIsoAt(expenseDate, 9, randomInRange(random, 0, 59))

    return {
      id: `demo-exp-${String(index + 1).padStart(3, '0')}`,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date,
      notes: '',
      paymentMethod: expense.category === 'Salaries' ? 'Bank Transfer' : 'Cash',
      createdAt,
      updatedAt: createdAt,
    }
  })

  return expenses.sort((a, b) => b.date.localeCompare(a.date))
}

export function calculateInventoryQuantities(products, sales) {
  const quantities = {}

  for (const product of products) {
    quantities[product.id] = Math.max(
      0,
      Math.floor(Number(product.quantity) || 0),
    )
  }

  for (const sale of sales) {
    for (const item of sale.items) {
      if (quantities[item.productId] !== undefined) {
        quantities[item.productId] = Math.max(
          0,
          quantities[item.productId] - item.quantity,
        )
      }
    }
  }

  return products.map((product) => ({
    ...product,
    quantity: quantities[product.id] ?? product.quantity,
  }))
}
