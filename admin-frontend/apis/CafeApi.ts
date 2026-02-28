import api from "./client";

export const CafeApi = {
  getCafeterias: async () => {
    const res = await api.get("/vendors/cafeterias");
    return res.data;
  },

  getBranchesByCafe: async (cafeId: number) => {
    const res = await api.get(`/vendors/cafeterias/${cafeId}/branches`);
    return res.data;
  },

  updateBranchStatus: async (branchId: number, isActive: boolean) => {
    const res = await api.patch(`/vendors/branches/${branchId}/status`, {
      is_active: isActive
    });
    return res.data;

  },

  createBranch: async (formData: FormData) => {
    const res = await api.post("/vendors/branches", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }
  
};