export enum OrderStatus {
  Incoming = "CREATED",
  Preparing = "PREPARING",
  Ready = "READY",
  PickedUp = "PICKED_UP",
  Completed = "COMPLETED",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
}

export interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface Order {
  id:string;
  displayOrderId?: string;
  orderType?: "INSTANT" | "SCHEDULED";
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  payment: 'Paid' | 'Not Paid';
  priority?: "HIGH" | "NORMAL" | "LOW" | "EXPIRED";
  status: OrderStatus;
  createdAt: Date;
  scheduledAt?: Date;
}

export interface Menucategory {
  category_id: number;
  category_name: string;
}

export interface MenuItem {
  id: string;
  baseItemId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  categoryId: number;
  available: boolean;
  foodType: 'veg' | 'non-veg';
  description?: string;
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  category: string;
  categoryId: number;
  price: number;
  foodType: 'veg' | 'non-veg';
  imageFile: File | null;
  
  
}


export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
}

