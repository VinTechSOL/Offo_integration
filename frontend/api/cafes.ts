// src/api/cafes.ts
import api from "./client";

export const getCafesForUser = async () => {
  const res = await api.get("/vendors/cafes/for-user");
  return res.data;
};
