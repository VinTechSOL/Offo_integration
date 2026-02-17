

export enum OrderStatus {
  INCOMING = 'Incoming',
  PENDING = 'Pending', // Treated as Incoming usually
  PREPARING = 'Preparing',
  READY_FOR_PICKUP = 'Ready for Pickup',
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  branchId: string; // Added branchId
  customerName: string;
  address?: string; // Added address for UI
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  itemImage?: string; // Added for UI preview
  date: string; // YYYY-MM-DD format
  orderTime: string;
  pickupTime?: string;
  scheduledTime?: string;
  cancellationReason?: string;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  status: 'Active' | 'Disabled';
  manager: string;
  contact: string;
  latitude: string;
  longitude: string;
}


export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  branchId: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
}

export interface MostSellingItem {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
}

export interface VendorInfo {
  logoFile?: File;
  logoPreviewUrl?: string;
  bannerFile?: File;
  bannerPreviewUrl?: string;
  themeColorPrimary: string;
  themeColorSecondary: string;
  cafeName: string;
  address: string;
  phone: string;
  about: string;
  timings: {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export enum PayoutMethod {
  BANK = 'Bank Transfer',
  UPI = 'UPI',
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface UPIAccount {
  upiId: string;
  accountHolderName: string;
}

