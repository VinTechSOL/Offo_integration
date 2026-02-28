import api from "./client";

export const StaffApi = {
  createVendor: async (data: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    branch_id: number;
  }) => {
    const res = await api.post("/staff/vendors", data);
    return res.data;
  },

  getVendorByBranch: async (branchId: number) => {
    const res = await api.get("/staff/vendors", {
      params: { branch_id: branchId }
    });
    return res.data;
  },

  resetVendorPassword: async (staffId: number) => {
    const res = await api.patch(
      `/staff/vendors/${staffId}/reset-password`
    );
    return res.data;
  }
};