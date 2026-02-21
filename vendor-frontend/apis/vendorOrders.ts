import api from "./client";
import { Order, OrderStatus } from "@/types";

/**
 * Normalize backend order → frontend Order interface
 */
const normalizeOrder = (o: any): Order => ({
  id: String(o.order_id),

  customerName: o.user_name,

  customerAddress: `${o.campus_name}, ${o.building_name}`,

  status: (o.status ?? o.order_status) as OrderStatus,

  createdAt: new Date(o.created_at),

  scheduledAt: o.scheduled_time
    ? new Date(o.scheduled_time)
    : undefined,

  total: Number(o.total_amount),

  payment: o.payment_status === "PAID" ? "Paid" : "Not Paid",

  priority: o.priority ?? null,

  // items are OPTIONAL for live dashboard
  // backend may not send them yet
  items: Array.isArray(o.items)
    ? o.items.map((i: any) => ({
        id: String(i.item_id),
        name: i.name,
        quantity: i.quantity,
        price: Number(i.price_at_time),
        imageUrl: i.image_url ?? "",
      }))
    : [],
});

export const VendorOrdersApi = {
  /**
   * Live / Incoming orders
   * GET /orders/incoming
   */
  async getLive(): Promise<Order[]> {
    const res = await api.get("/orders/live");
    return res.data.map(normalizeOrder);
    
  },

  async getToday(): Promise<Order[]> {
    const res = await api.get("/orders/today");
    return res.data.map(normalizeOrder);
    
  },

  /**
   * Scheduled orders
   * GET /orders/scheduled?filter=today|tomorrow|date&date=YYYY-MM-DD
   */
  async getScheduled(): Promise<Order[]> {
    const res = await api.get("/orders/scheduled");

    return res.data.map((o: any) => 
      normalizeOrder({
      ...o,
      order_status: o.order_status ?? "CREATED",
      })
    );
  },

  /**
   * Accept order
   * POST /orders/{order_id}/accept
   */
  async accept(orderId: string) {
    return api.post(`/orders/${orderId}/accept`);
  },

  /**
   * Move order status
   * POST /orders/{order_id}/move?status=READY|PICKED_UP
   */
  async move(orderId: string, status: OrderStatus) {
    return api.post(`/orders/${orderId}/move`, null, {
      params: { status },
    });
  },
};
