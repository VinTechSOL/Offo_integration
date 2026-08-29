import api from "./client";
import { BranchFormData } from "@/components/branch/BranchFormtypes";
import { buildBranchFormData } from "./BranchFormDataBuilder";

export interface BranchDocumentResponse {
  document_id: number;
  document_name: string;
  document_url: string;
}

export interface BranchDetailsResponse {
  branch_id: number;
  cafe_id: number;

  branch_name: string;

  city_id: number;
  city_name: string | null;

  campus_id: number;
  campus_name: string | null;

  building_id: number | null;
  building_name: string | null;

  opens_at: string;
  closes_at: string;

  image_url: string | null;

  latitude: number | null;
  longitude: number | null;

  registered_address: string | null;
  business_address: string | null;
  business_type: string | null;

  fssai_license_number: string | null;
  fssai_license_document_url: string | null;

  gst_registration_number: string | null;
  gst_registration_document_url: string | null;

  bank_account_number: string | null;
  ifsc_code: string | null;
  account_holder_name: string | null;
  bank_passbook_url: string | null;

  registered_owner_name: string | null;
  owner_phone_number: string | null;
  owner_email: string | null;
  owner_proof_document_url: string | null;

  is_active: boolean;

  documents: BranchDocumentResponse[];
}

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
    const res = await api.get(
      `/vendors/cafeterias/${cafeId}/branches`,
    );

    return res.data;
  },

  getBranchById: async (
    branchId: number,
  ): Promise<BranchDetailsResponse> => {
    const res = await api.get(
      `/vendors/branches/${branchId}`,
    );

    return res.data;
  },

  updateBranchStatus: async (
    branchId: number,
    isActive: boolean,
  ) => {
    const res = await api.patch(
      `/vendors/branches/${branchId}/status`,
      {
        is_active: isActive,
      },
    );

    return res.data;
  },

  updateBranch: async (
    branchId: number,
    data: BranchFormData,
  ) => {
    const formData = buildBranchFormData(
      null,
      data,
    );

    const res = await api.patch(
      `/vendors/branches/${branchId}`,
      formData,
    );

    return res.data;
  },

  createBranch: async (
    cafeId: string | number,
    data: BranchFormData,
  ) => {
    const formData = buildBranchFormData(
      cafeId,
      data,
    );

    const res = await api.post(
      "/vendors/branches",
      formData,
    );

    return res.data;
  },
};