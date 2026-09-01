import api from "./client";
import { Customer, Order, OrderStatus } from "@/types";

/**
 * Normalizes backend order payload to frontend Order interface
 */
const normalizeOrder = (o: any): Order => ({
  id: String(o.order_id),
  displayOrderId: o.display_order_id,
  orderType: o.order_type,
  customerName: o.user_name,
  customerAddress: `${o.campus_name || ""}, ${o.building_name || ""}`.replace(/^,\s*|,\s*$/g, ""),
  status: (o.status ?? o.order_status) as OrderStatus,
  createdAt: new Date(o.created_at),
  scheduledAt: o.scheduled_time ? new Date(o.scheduled_time) : undefined,
  total: Number(o.total_amount || 0),
  payment: o.payment_status === "PAID" ? "Paid" : "Not Paid",
  priority: o.priority ?? null,
  items: Array.isArray(o.items)
    ? o.items.map((i: any) => ({
        id: String(i.item_id),
        name: i.name,
        quantity: i.quantity,
        price: Number(i.price_at_time || 0),
        imageUrl: i.image_url ?? "",
      }))
    : [],
});

export const CrmApi = {
  /**
   * Fetch customer list with stats
   * GET /crm/customers
   */
  async getCustomers(): Promise<Customer[]> {
    const res = await api.get("/crm/customers");

    return res.data.map((c: any) => ({
      id: String(c.user_id ?? c.id),
      name: c.name,
      phone: c.phone,
      totalOrders: c.total_orders ?? c.totalOrders ?? 0,
    }));
  },

  /**
   * Fetch order history for a specific customer
   * GET /crm/customers/{customer_id}/orders
   */
  async getCustomerOrders(customerId: string | number): Promise<Order[]> {
    const res = await api.get(`/crm/customers/${customerId}/orders`);
    return Array.isArray(res.data) ? res.data.map(normalizeOrder) : [];
  },
};