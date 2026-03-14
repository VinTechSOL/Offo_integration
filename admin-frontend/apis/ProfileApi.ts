import api from "./client";

export interface ProfileResponse {
  staff_id: number
  full_name: string
  username: string
  role: string
  access_scope: string
  is_active: boolean
  created_at: string
}

export const ProfileApi = {

  getProfile: async (): Promise<ProfileResponse> => {

    const res = await api.get("/staff/auth/me");

    return res.data;

  }

};