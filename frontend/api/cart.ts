import api from "./client";

export const getActiveCart = async () => {
  const res = await api.get("/cart/active");
  return res.data;
};

export const addToCartApi = async (data: {
  branch_id: number;
  item_id: number;
  quantity: number;
}) => {
  return api.post("/cart/add", data);
};

export const updateCartItemApi = async (
  itemId: number,
  quantity: number
) => {
  return api.patch("/cart/item", {
    item_id: itemId,
    quantity,
  });
};

export const clearCartApi = async () => {
  return api.delete("/cart/clear");
};
