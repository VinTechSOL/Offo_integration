import api from "./client";

export const ReportsApi = {

  async getOverview(params?: any) {

    const res = await api.get(
      "/reports/overview",
      {
        params,
      }
    );

    return res.data;
  },

  async getMenuPerformance(params?: any) {

    const res = await api.get(
      "/reports/menu-performance",
      {
        params,
      }
    );

    return res.data;
  },

  async getCustomerInsights(params?: any) {

    const res = await api.get(
      "/reports/customer-insights",
      {
        params,
      }
    );

    return res.data;
  },
};