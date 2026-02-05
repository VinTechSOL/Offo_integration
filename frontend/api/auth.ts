import api from "./client";

export const sendOtp = (mobileNumber: string) => {
  return api.post("/auth/send-otp", {
    mobile_number: mobileNumber
  });
};

export const verifyOtp = async (mobileNumber: string, otp: string) => {
  const res = await api.post("/auth/verify-otp", {
    mobile_number: mobileNumber,
    otp,
  });
  return res.data; // <-- access_token
};


// SIGNUP – SEND OTP
export const signupInit = (
  phone: string,
  firstName: string,
  lastName: string
) => {
  return api.post("/auth/signup/init", {
    phone,
    first_name: firstName,
    last_name: lastName,
  });
};

// SIGNUP – VERIFY OTP
export const signupVerify = async (phone: string, otp: string) => {
  const res = await api.post("/auth/signup/verify", {
    phone: phone,
    otp,
  });
  return res.data; // <-- access_token
};



