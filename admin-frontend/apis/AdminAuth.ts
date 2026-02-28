import api from "./client";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  staff_id: number;
  role: string;
  branch_id: string | null;
}

export const loginAdmin = async (
  username: string,
  password: string
): Promise<LoginResponse> => {

  const response = await api.post("/staff/auth/login", {
    username,
    password,
  });

  return response.data;
};