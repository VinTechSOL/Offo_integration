import api from "./client";

export const ReportsApi = {

  getReports: async (
    branchIds: string[],
    range: "today" | "week" | "month"
  ) => {

    const res = await api.get("/staff/customised-reports", {
      params: {
        branch_ids: branchIds,
        range
      },
      paramsSerializer: params =>
        params.branch_ids
          .map((id: string) => `branch_ids=${id}`)
          .join("&") + `&range=${params.range}`
    });

    return res.data;

  }

};