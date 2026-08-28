import api from "./client";

// =========================================================
// LOGIN
// =========================================================

export interface StaffLoginPayload {
  username: string;
  password: string;
}

export interface StaffLoginResponse {
  access_token: string;
  token_type: string;
  staff_id: number;
  role: string;
  branch_id: number | null;
}

export async function staffLogin(
  payload: StaffLoginPayload
): Promise<StaffLoginResponse> {
  const res = await api.post<StaffLoginResponse>(
    "/staff/auth/login",
    payload
  );

  localStorage.setItem(
    "access_token",
    res.data.access_token
  );

  return res.data;
}

// =========================================================
// REFRESH ACCESS TOKEN
// =========================================================

export interface StaffRefreshResponse {
  access_token: string;
  token_type: string;
  staff_id: number;
  role: string;
  branch_id: number | null;
}

export async function refreshStaffAccessToken(): Promise<StaffRefreshResponse> {
  const res = await api.post<StaffRefreshResponse>(
    "/staff/auth/refresh"
  );

  localStorage.setItem(
    "access_token",
    res.data.access_token
  );

  return res.data;
}

// =========================================================
// CURRENT STAFF
// =========================================================

export async function getStaffMe() {
  const res = await api.get("/staff/auth/me");
  return res.data;
}

// =========================================================
// LOGOUT
// =========================================================

export async function staffLogout() {
  try {
    await api.post("/staff/auth/logout");
  } finally {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  }
}

// =========================================================
// FORGOT PASSWORD
// =========================================================

export interface StaffSendOTPRequest {
  mobile_number: string;
}

export interface StaffVerifyOTPRequest {
  mobile_number: string;
  otp: string;
}

export interface StaffVerifyOTPResponse {
  reset_token: string;
}

export interface StaffResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface StaffResetPasswordResponse {
  message: string;
}

export async function sendResetOTP(
  payload: StaffSendOTPRequest
) {
  const res = await api.post(
    "/staff/auth/send-reset-otp",
    payload
  );

  return res.data;
}

export async function verifyResetOTP(
  payload: StaffVerifyOTPRequest
): Promise<StaffVerifyOTPResponse> {
  const res = await api.post<StaffVerifyOTPResponse>(
    "/staff/auth/verify-reset-otp",
    payload
  );

  return res.data;
}

export async function resetStaffPassword(
  payload: StaffResetPasswordRequest
): Promise<StaffResetPasswordResponse> {
  const res = await api.post<StaffResetPasswordResponse>(
    "/staff/auth/reset-password",
    payload
  );

  return res.data;
}