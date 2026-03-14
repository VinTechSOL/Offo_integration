import api from "./client";

export const DashboardApi = {

  getOverview: async (branchIds: string[]) => {

    const res = await api.get("/staff/dashboard-overview", {
      params: { branch_ids: branchIds },
      paramsSerializer: params =>
        params.branch_ids
          .map((id: string) => `branch_ids=${id}`)
          .join("&")
    });

    return res.data;

  }

};