import api from "./client";

export const AdminUsersApi = {

  getUsersByBranches: async (branchIds: string[]) => {

    if (!branchIds.length) return [];

    const res = await api.get("/staff/get-customised-user-info", {
      params: {
        branch_ids: branchIds
      },
      paramsSerializer: params =>
        params.branch_ids.map((id: string) => `branch_ids=${id}`).join("&")
    });

    return res.data;
  }

};