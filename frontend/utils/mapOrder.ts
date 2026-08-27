import type { Order } from "../types";

export function mapBackendOrder(o: any): Order {
  return {
    id: String(o.order_id),

    cafe: o.cafe_name ?? "Cafe",

    date: o.scheduled_time
      ? new Date(o.scheduled_time)
      : new Date(o.created_at),

    placedAt: new Date(o.created_at),

    total: Number(o.total_amount),

    status: mapStatus(
      o.order_status,
      o.order_type,
    ),

    items: (o.items || []).map((i: any) => ({
      orderItemId: Number(
        i.order_item_id ?? i.orderItemId
      ),

      item: {
        id: Number(i.item_id),

        name: i.name,

        price: Number(i.price_at_time),

        image:
          i.image ??
          i.image_url ??
          "/placeholder.png",

        cafe: o.cafe_name ?? "",

        category: i.category ?? "",

        isVeg: i.is_veg ?? true,

        branchId: Number(
          i.branch_id ?? o.branch_id
        ),
      },

      quantity: Number(i.quantity),
    })),

    // Backend payment/order state
    backendStatus: o.order_status,

    orderType: o.order_type,

    paymentStatus: o.payment_status,

    branchId: o.branch_id,

    cafeId: o.cafe_id,

    timeline: o.timeline ?? undefined,
  };
}

function mapStatus(
  status: string,
  orderType?: string,
): Order["status"] {
  switch (status) {
    case "CREATED":
      return orderType === "SCHEDULED"
        ? "Scheduled"
        : "Pending";

    case "ACCEPTED":
      return "Accepted";

    case "PREPARING":
      return "Preparing";

    case "READY":
      return "Ready for Pickup";

    case "PICKED_UP":
      return "Picked Up";

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