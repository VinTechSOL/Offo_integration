import api from "./client";
import { BranchFormData } from "@/components/branch/BranchFormtypes";
import { buildBranchFormData } from "./BranchFormDataBuilder";

export const CafeApi = {
  getCafeterias: async () => {
    const res = await api.get('/vendors/cafeterias');
    return res.data;
  },

  createCafeteria: async (data: {
    cafe_name: string;
    phone_number: string;
    email_id?: string;
  }) => {
    const res = await api.post('/vendors/cafeterias', data);
    return res.data;
  },

  getBranchesByCafe: async (cafeId: number) => {
    const res = await api.get(`/vendors/cafeterias/${cafeId}/branches`);
    return res.data;
  },

  getBranchById: async (branchId: number) => {
    const res = await api.get(`/vendors/branches/${branchId}`);
    return res.data;
  },

  updateBranchStatus: async (branchId: number, isActive: boolean) => {
    const res = await api.patch(`/vendors/branches/${branchId}/status`, {
      is_active: isActive,
    });
    return res.data;
  },

  updateBranch: async (branchId: number, data: BranchFormData) => {
    const formData = buildBranchFormData(null, data);

    const res = await api.patch(`/vendors/branches/${branchId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  createBranch: async (cafeId: string | number, data: BranchFormData) => {
    const formData = buildBranchFormData(cafeId, data);

    const res = await api.post('/vendors/branches', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },
};