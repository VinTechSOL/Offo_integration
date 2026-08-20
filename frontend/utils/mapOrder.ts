import type { Order } from "../types";

export function mapBackendOrder(o: any): Order {
  return {
    id: String(o.order_id),

    cafe: o.cafe_name, // later replace with real cafe name
    date: o.scheduled_time
      ? new Date(o.scheduled_time)
      : new Date(o.created_at),

    placedAt: new Date(o.created_at),

    total: Number(o.total_amount),

    status: mapStatus(o.order_status),

    items: (o.items || []).map((i: any) => ({
      orderItemId: Number(i.order_item_id ?? i.orderItemId),
      item: {
        id: i.item_id,
        name: i.name,
        price: Number(i.price_at_time),
        image: i.image ?? "/placeholder.png",
        cafe: "",
        category: "",
        isVeg: true,
      },
      quantity: i.quantity,
    })),

    // 🔹 backend-aligned extras
    backendStatus: o.order_status,
    orderType: o.order_type,
    paymentStatus: o.payment_status,
    branchId: o.branch_id,
    cafeId: o.cafe_id,
  };
}

function mapStatus(status: string): Order["status"] {
  switch (status) {
    case "CREATED":
      return "Pending";
    case "PREPARING":
      return "Preparing";
    case "READY":
      return "Ready for Pickup";
    case "PICKED_UP":
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}
