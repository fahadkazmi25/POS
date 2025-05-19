import type { Timestamp } from "firebase/firestore"

// Base document interface with common fields
export interface FirestoreDocument {
  id: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Product interface
export interface Product extends FirestoreDocument {
  name: string
  description?: string
  price: number
  cost?: number
  sku?: string
  barcode?: string
  category?: string
  stock?: number
  lowStockThreshold?: number
  imageUrl?: string
  imageBase64?: string
  isActive?: boolean
  attributes?: Record<string, string>
}

// Customer interface
export interface Customer extends FirestoreDocument {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
  totalPurchases?: number
  lastPurchaseDate?: Timestamp
  status?: "active" | "inactive" | "blocked"
  vehicles?: Vehicle[]
}

// Vehicle interface
export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate?: string
  vin?: string
  color?: string
  notes?: string
}

// Sale item interface
export interface SaleItem {
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

// Sale interface
export interface Sale extends FirestoreDocument {
  saleNumber: string
  date: Timestamp
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  notes?: string | null
  status: "completed" | "pending" | "cancelled"
}

// Invoice interface
export interface Invoice extends FirestoreDocument {
  invoiceNumber: string
  saleId?: string
  date: Timestamp
  dueDate: Timestamp
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  taxRate?: number
  total: number
  notes?: string | null
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "overdue" | "cancelled"
}
