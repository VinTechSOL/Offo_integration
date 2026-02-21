import api from "./client";

export const placeOrderApi = async (payload: {
  order_type: "INSTANT" | "SCHEDULED";
  schedules?: {
    scheduled_date: string;
    scheduled_time: string;
  }[];
  repeat_weekly?: boolean;
}) => {
  const res = await api.post("/orders/place", payload);
  return res.data;
};


export const getMyOrdersApi = async () => {
  const res = await api.get("/users/orders");
  return res.data;
};


export const getMyActiveOrdersApi = async () => {
  const res = await api.get("/users/orders/active");
  return res.data;
};


export const getOrderTimelineApi = async (orderId: string) => {
  const res = await api.get(`/users/orders/${orderId}/timeline`);
  return res.data;
};
