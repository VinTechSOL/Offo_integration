import api from "./client";

export const ReportsApi = {

  async getOverview() {
    const res = await api.get("/reports/overview");
    return res.data;
  },

  async getMenuPerformance() {
    const res = await api.get("/reports/menu-performance");
    return res.data;
  },

  async getCustomerInsights() {
    const res = await api.get("/reports/customer-insights");
    return res.data;
  },
};
