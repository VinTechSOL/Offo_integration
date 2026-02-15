import api from "./client";

export const CrmApi = {
  async getCustomers() {
    const res = await api.get("/crm/customers");

    return res.data.map((c: any) => ({
      id: String(c.user_id),
      name: c.name,
      phone: c.phone,
      totalOrders: c.total_orders,
    }));
  },
};
