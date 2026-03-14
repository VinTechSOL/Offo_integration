/* =========================================
   LOCATION TYPES
========================================= */

export interface City {
  id: string
  name: string
}

export interface Campus {
  id: string
  name: string
  cityId: string
}

/* =========================================
   CAFE / VENDOR TYPES
========================================= */

export interface Cafe {
  id: string
  name: string
  phone: string
  email?: string
  isActive: boolean
}

export interface Branch {
  id: string

  cafeId: string

  name: string

  cityId: string
  cityName: string

  campusId: string
  campusName: string

  buildingName?: string

  imageUrl?: string

  status: "Active" | "Disabled"
}

/* =========================================
   USERS
========================================= */

export interface AppUser {
  id: string
  branchId: string

  name: string
  phone: string

  totalOrders: number
  totalSpent: number
  lastOrderDate: string

  status: "Active" | "Inactive" | "No Orders"
}

/* =========================================
   STAFF
========================================= */

export interface Staff {
  id: string

  branchId: string

  role: "VENDOR"

  firstName: string
  lastName: string

  username: string
  password: string

  isActive: boolean

  createdAt: string
  lastReset?: string
}

/* =========================================
   ORDER TYPES
========================================= */

export enum OrderStatus {
  INCOMING = "Incoming",
  PENDING = "Pending",
  PREPARING = "Preparing",
  READY_FOR_PICKUP = "Ready for Pickup",
  SCHEDULED = "Scheduled",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string

  branchId: string

  customerName: string

  address?: string

  totalAmount: number

  status: OrderStatus

  items: OrderItem[]

  itemImage?: string

  date: string
  orderTime: string
  pickupTime?: string
  scheduledTime?: string

  cancellationReason?: string

  paymentMethod: "Cash" | "Card" | "UPI"
}

/* =========================================
   MENU TYPES
========================================= */

export interface MenuCategory {
  id: string
  name: string
  description?: string
  branchId: string
}

export interface MenuItem {
  id: string

  categoryId: string
  branchId: string

  name: string
  description: string

  price: number

  isVeg: boolean
  isAvailable: boolean

  imageUrl?: string
}

/* =========================================
   ANALYTICS
========================================= */

export interface SalesDataPoint {
  date: string
  sales: number
}

export interface CategorySalesData {
  category: string
  sales: number
}

export interface MostSellingItem {
  id: string
  name: string
  salesCount: number
  revenue: number
}

/* =========================================
   PAYOUT
========================================= */

export enum PayoutMethod {
  BANK = "Bank Transfer",
  UPI = "UPI",
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  ifscCode: string
  accountHolderName: string
}

export interface UPIAccount {
  upiId: string
  accountHolderName: string
}