import api from "./client";

export const CafeApi = {

  getCafeterias: async () => {
    const res = await api.get("/vendors/cafeterias");
    return res.data;
  },

  createCafeteria: async (data: {
    cafe_name: string;
    phone_number: string;
    email_id?: string;
  }) => {
    const res = await api.post("/vendors/cafeterias", data);
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

  updateBranch: async (
    branchId: number,
    payload: {
      branch_name: string;
      city_id: number;
      campus_id: number;
      building_id: number | null;
      opens_at: string;
      closes_at: string;
      is_active: boolean;
    }
  ) => {
    const res = await api.patch(
      `/vendors/branches/${branchId}`,
      payload
    );

    return res.data;
  },

  createBranch: async (formData: FormData) => {
    const res = await api.post("/vendors/branches", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }

};