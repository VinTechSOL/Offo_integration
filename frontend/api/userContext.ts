// src/api/userContext.ts
import api from "./client";

export const saveUserContext = async (
  city_id: number,
  campus_id: number,
  building_id: number | null
) => {
  await api.post("/users/context", {
    city_id,
    campus_id,
    building_id,
  });
};

export const getUserContext = async () => {
  const res = await api.get("/users/context");
  return res.data;
};

export const getUserContextDetails = async () => {
  const res = await api.get("/users/context/details");
  return res.data;
};
