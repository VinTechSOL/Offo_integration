import api from "./client";

export interface StaffLoginPayload {
  username: string;
  password: string;
}

export interface StaffLoginResponse {
  access_token: string;
  role: string;
}

export async function staffLogin(
  payload: StaffLoginPayload
): Promise<StaffLoginResponse> {
  const res = await api.post<StaffLoginResponse>(
    "/staff/auth/login",
    payload
  );

  localStorage.setItem("access_token", res.data.access_token);
  return res.data;
}

export async function getStaffMe() {
  const res = await api.get("/staff/auth/me");
  return res.data;
}

export function staffLogout() {
  localStorage.removeItem("access_token");
  window.location.href = "/";
}
