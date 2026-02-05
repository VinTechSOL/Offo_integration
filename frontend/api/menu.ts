import api from "./client";


export const getBranchMenuForUser = async (
  branchId: number
) => {
  const res = await api.get(`/menu/branch/${branchId}/public`);
  return res.data;
};
