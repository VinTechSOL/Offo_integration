import api from "./client";

/* =========================================================
   TYPES
========================================================= */

export interface VendorResponse {
  staff_id: number;
  first_name: string;
  last_name: string;
  username: string;
  branch_id: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateVendorResponse {
  vendor: VendorResponse;
  temporary_password: string;
}

export interface ResetVendorPasswordResponse {
  message: string;
  new_password: string;
}

/* =========================================================
   API
========================================================= */

export const StaffApi = {
  /* ---------------- Create Vendor ---------------- */

  createVendor: async (data: {
    first_name: string;
    last_name: string;
    username: string;
    branch_id: number;
  }): Promise<CreateVendorResponse> => {
    const res = await api.post("/staff/vendors", data);

    return res.data;
  },

  /* ---------------- Update Vendor ---------------- */

  updateVendor: async (
    staffId: number,
    data: {
      first_name: string;
      last_name: string;
      username: string;
      is_active: boolean;
    }
  ): Promise<VendorResponse> => {
    const res = await api.patch(
      `/staff/vendors/${staffId}`,
      data
    );

    return res.data;
  },

  /* ---------------- Get Vendor By Branch ---------------- */

  getVendorByBranch: async (
    branchId: number
  ): Promise<VendorResponse | null> => {
    const res = await api.get("/staff/vendors", {
      params: {
        branch_id: branchId,
      },
    });

    return res.data;
  },

  /* ---------------- Reset Vendor Password ---------------- */

  resetVendorPassword: async (
    staffId: number
  ): Promise<ResetVendorPasswordResponse> => {
    const res = await api.patch(
      `/staff/vendors/${staffId}/reset-password`
    );

    return res.data;
  },
};