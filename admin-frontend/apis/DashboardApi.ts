import api from "./client";

export interface RevenueTrendItem {
  label: string;
  date: string;
  revenue: number;
}

export interface TopSellingItem {
  name: string;
  sales: number;
  revenue: number;
}

export interface DashboardOverviewResponse {
  today_orders: number;
  total_revenue: number;
  avg_order_value: number;
  revenue_trend: RevenueTrendItem[];
  top_items: TopSellingItem[];
}

export const DashboardApi = {

  getOverview: async (
    branchIds: string[],
  ): Promise<DashboardOverviewResponse> => {

    const res = await api.get(
      "/staff/dashboard-overview",
      {
        params: {
          branch_ids: branchIds,
        },

        paramsSerializer: (params) =>
          params.branch_ids
            .map(
              (id: string) =>
                `branch_ids=${encodeURIComponent(id)}`
            )
            .join("&"),
      }
    );

    return res.data;
  },

};