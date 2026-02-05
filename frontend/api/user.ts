import api from "./client";

export const getMyProfileApi = async () => {
  const res = await api.get("/users/me");
  return res.data;
}

export const updateMyProfileApi = async (payload: {
  first_name: string;
  last_name: string;
}) => {
  const res = await api.put("/users/me", payload);
  return res.data;
}

