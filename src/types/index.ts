// src/types/index.ts

export interface CartItem {
  productId: string
  sku: string
  name: string
  priceSell: number
  qty: number
  discountItem: number
  subtotal: number
  stockQty: number
  unit: string
}

export interface DashboardStats {
  todayRevenue: number
  todayTransactions: number
  lowStockCount: number
  totalProducts: number
}

export interface SalesReport {
  date: string
  revenue: number
  transactions: number
  hpp: number
  profit: number
}
