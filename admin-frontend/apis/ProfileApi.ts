import api from "./client";

export interface ProfileResponse {
  staff_id: number;
  username: string;
  full_name: string;
  role: string;
  access_scope: string;
  is_active: boolean;
  created_at: string;
  branch_id?: number;
}

export interface ChangePasswordResponse {
  message: string;
}

export const ProfileApi = {

  /* ================= Get Profile ================= */

  getProfile: async (): Promise<ProfileResponse> => {
    const res = await api.get("/staff/auth/me");

    return res.data;
  },

  /* ================= Change Password ================= */

  changePassword: async (
    newPassword: string
  ): Promise<ChangePasswordResponse> => {

    const res = await api.post(
      "/staff/auth/change-password",
      {
        new_password: newPassword,
      }
    );

    return res.data;
  },

};