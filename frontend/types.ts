
export interface FoodItem {
  id: number;
  branchId: number;
  name: string;
  price: number;
  image: string;
  cafe: string;
  isVeg: boolean;
  category: String;
}

export interface CafeForUser {
  branch_id: number;
  branch_name: string;
  image_url?: string;
  city_name: string;
  campus_name: string;
  building_name: string | null;

  opens_at: string;
  closes_at: string;
  is_open:boolean;

}


export interface Cafe {
  id: number;
  name: string;
  location: string;
  image: string;
  status: 'Open' | 'Closed';
  branch_id: number;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export interface ScheduledItem {
    id: number;
    date: Date;
    time: string;
}

export interface OrderDetails {
  items: CartItem[];
  subtotal: number;
  convenienceFee: number;
  total: number;
  schedules?: ScheduledItem[];
  paymentMethod?: string;
  paymentOption?: 'full' | 'partial';
  paymentAmount?: number;
}

export interface OrderItem {
    item: FoodItem;
    quantity: number;
}

export interface OrderTimelineItem {
  status: string;
  changed_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  cafe: string;
  date: Date;
  items: OrderItem[];
  total: number;
  status:
    | 'Delivered'
    | 'Pending'
    | 'Cancelled'
    | 'Preparing'
    | 'Ready for Pickup'
    | 'Scheduled'
    | 'Out for Delivery'
    | 'Accepted'
    | 'Rejected';
  placedAt: Date;

  // 🔹 Backend-aligned (optional, non-breaking)
  backendStatus?: string;        // CREATED / ACCEPTED / etc
  orderType?: 'INSTANT' | 'SCHEDULED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  branchId?: number;
  cafeId?: number;

  timeline?: OrderTimelineItem[];
}

