import { generateId, normaliseSku } from './ids'

const SKINCARE = [
  'Shea Butter Moisturizer', 'Vitamin C Serum', 'Sunscreen SPF 50', 'Charcoal Face Wash',
  'Rose Water Toner', 'Anti-Aging Cream', 'Acne Treatment Gel', 'Body Lotion', 'Lip Balm', 'Hand Cream'
]

const GROCERIES = [
  'Rice (50kg bag)', 'Beans (Brown)', 'Groundnut Oil', 'Tomato Paste', 'Salt',
  'Sugar', 'Flour (Wheat)', 'Onions', 'Pepper (Chili)', 'Maggi Cubes', 'Milk Powder', 'Garri'
]

const BEVERAGES = [
  'Coca-Cola 50cl', 'Fanta Orange 50cl', 'Sprite 50cl', 'Pepsi 50cl', 'Malt Drink',
  'Fruit Juice', 'Bottled Water', 'Energy Drink', 'Zobo Drink', 'Chapman Mix'
]

const BAKERY = [
  'White Bread', 'Wheat Bread', 'Meat Pie', 'Egg Roll', 'Doughnut',
  'Sausage Roll', 'Cake Slice', 'Croissant'
]

const HOUSEHOLD = [
  'Detergent Powder', 'Dishwashing Liquid', 'Bleach', 'Toilet Paper', 'Air Freshener',
  'Bath Soap', 'Washing Sponge', 'Trash Bags', 'Floor Cleaner', 'Insecticide Spray'
]

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPrice(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

export function generateDemoProducts() {
  const products = []
  let skuCounter = 1000

  const addProducts = (names, category) => {
    for (const name of names) {
      skuCounter += 1
      const costPrice = randomPrice(200, 5000)
      const markup = randomPrice(1.2, 1.8)
      const sellingPrice = Math.round(costPrice * markup * 100) / 100
      const quantity = randomInRange(0, 150)
      const lowStockThreshold = randomInRange(5, 30)
      
      products.push({
        id: generateId('prod'),
        name,
        sku: normaliseSku(`DEMO-${skuCounter}`),
        category,
        description: `${name} - Quality product`,
        costPrice,
        sellingPrice,
        quantity,
        lowStockThreshold,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  addProducts(SKINCARE, 'Skincare and personal care')
  addProducts(GROCERIES, 'Groceries and provisions')
  addProducts(BEVERAGES, 'Beverages')
  addProducts(BAKERY, 'Bakery')
  addProducts(HOUSEHOLD, 'Household essentials')

  // Ensure some low stock and out of stock
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
  const sales = []
  const today = new Date()
  const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'POS']
  const customers = ['Walk-in Customer', 'John A.', 'Sarah M.', 'Ahmed K.', 'Grace O.', 'Mike T.']

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    const saleDate = new Date(today)
    saleDate.setHours(0, 0, 0, 0)
    saleDate.setDate(saleDate.getDate() - dayOffset)
    
    const year = saleDate.getFullYear()
    const month = String(saleDate.getMonth() + 1).padStart(2, '0')
    const day = String(saleDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // Random number of sales per day (0-4)
    const numSales = randomInRange(0, 4)
    
    for (let s = 0; s < numSales; s += 1) {
      const numItems = randomInRange(1, 4)
      const items = []
      let subtotal = 0
      
      for (let i = 0; i < numItems; i += 1) {
        const product = products[randomInRange(0, products.length - 1)]
        const quantity = randomInRange(1, 3)
        const unitPrice = product.sellingPrice
        const lineTotal = quantity * unitPrice
        subtotal += lineTotal
        
        items.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          unitPrice,
          costPrice: product.costPrice, // Add cost snapshot for profit calculation
          lineTotal,
        })
      }
      
      const discount = 0
      const total = subtotal - discount
      const reference = `INV-${Date.now().toString().slice(-6)}-${sales.length.toString().padStart(3, '0')}`
      
      sales.push({
        id: generateId('txn'),
        reference,
        date: dateStr,
        time: `${String(randomInRange(8, 18)).padStart(2, '0')}:${String(randomInRange(0, 59)).padStart(2, '0')}`,
        items,
        subtotal,
        discount,
        total,
        paymentMethod: paymentMethods[randomInRange(0, paymentMethods.length - 1)],
        status: 'Completed',
        customerName: customers[randomInRange(0, customers.length - 1)],
        notes: '',
        createdAt: new Date(saleDate.getTime() + randomInRange(0, 86400000)).toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }
  
  return sales.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function generateDemoExpenses() {
  const expenses = []
  const today = new Date()
  
  const expenseData = [
    { desc: 'Shop Rent - Monthly', category: 'Rent', amount: 45000, dayOffset: 5 },
    { desc: 'Electricity Bill', category: 'Utilities', amount: 8500, dayOffset: 3 },
    { desc: 'Water Bill', category: 'Utilities', amount: 2500, dayOffset: 7 },
    { desc: 'Staff Salaries', category: 'Salaries', amount: 85000, dayOffset: 2 },
    { desc: 'Fuel for Delivery', category: 'Transport', amount: 5500, dayOffset: 1 },
    { desc: 'Cleaning Supplies', category: 'Inventory/Supplies', amount: 3200, dayOffset: 4 },
    { desc: 'Social Media Ads', category: 'Marketing', amount: 12000, dayOffset: 6 },
    { desc: 'Generator Maintenance', category: 'Maintenance', amount: 4500, dayOffset: 8 },
    { desc: 'Packaging Materials', category: 'Inventory/Supplies', amount: 2800, dayOffset: 10 },
    { desc: 'Internet Subscription', category: 'Utilities', amount: 8500, dayOffset: 12 },
  ]
  
  for (const exp of expenseData) {
    const expDate = new Date(today)
    expDate.setHours(0, 0, 0, 0)
    expDate.setDate(expDate.getDate() - exp.dayOffset)
    
    const year = expDate.getFullYear()
    const month = String(expDate.getMonth() + 1).padStart(2, '0')
    const day = String(expDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    expenses.push({
      id: generateId('exp'),
      description: exp.desc,
      category: exp.category,
      amount: exp.amount,
      date: dateStr,
      notes: '',
      paymentMethod: exp.category === 'Salaries' ? 'Bank Transfer' : 'Cash',
      createdAt: expDate.toISOString(),
      updatedAt: expDate.toISOString(),
    })
  }
  
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function calculateInventoryQuantities(products, sales) {
  // Start with generated quantities, subtract sold quantities
  const quantities = {}
  for (const product of products) {
    quantities[product.id] = product.quantity
  }
  
  // Subtract sold quantities (historical sales)
  for (const sale of sales) {
    for (const item of sale.items) {
      if (quantities[item.productId] !== undefined) {
        quantities[item.productId] = Math.max(0, quantities[item.productId] - item.quantity)
      }
    }
  }
  
  // Return updated products with calculated quantities
  return products.map(product => ({
    ...product,
    quantity: quantities[product.id] ?? product.quantity,
  }))
}
