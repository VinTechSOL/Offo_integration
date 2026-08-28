import api from "./client";
import { MenuItem } from "@/types";

export interface MenuCategory {
  category_id: number;
  category_name: string;
}

const normalizeMenu = (rows: any[]): MenuItem[] => {
  return rows.map((r) => ({
    id: String(r.branch_menu_item_id),
    baseItemId: String(r.item_id),

    name: r.name,
    imageUrl: r.image_url ?? "",

    price: Number(r.price),

    category: r.category_name,

    // IMPORTANT
    categoryId: Number(r.category_id),

    available: Boolean(r.is_available),

    foodType:
      r.food_type === "veg"
        ? "veg"
        : "non-veg",

    description:
      r.item_description ?? "",
  }));
};

export const VendorMenuApi = {

  async getMenu(): Promise<MenuItem[]> {
    const res =
      await api.get("/menu/branchMenu");

    return normalizeMenu(res.data);
  },

  async getCategories(): Promise<MenuCategory[]> {
    const res =
      await api.get("/menu/categories");

    return res.data;
  },

  async updateBranchItem(
    id: string,
    payload: {
      price?: number;
      is_available?: boolean;
      category_id?: number;
    }
  ) {
    return api.patch(
      `/menu/branch-items/${id}`,
      payload
    );
  },

  async updateMenuItem(
    baseItemId: string,
    data: {
      name?: string;
      description?: string;
      foodType?: "veg" | "non-veg";
      imageFile?: File | null;
    }
  ) {
    const formData = new FormData();

    if (data.name !== undefined) {
      formData.append(
        "item_name",
        data.name
      );
    }

    if (data.description !== undefined) {
      formData.append(
        "item_description",
        data.description
      );
    }

    if (data.foodType !== undefined) {
      formData.append(
        "item_type_id",
        data.foodType === "veg"
          ? "1"
          : "2"
      );
    }

    // Only send image when a NEW image
    // was actually selected.
    if (data.imageFile) {
      formData.append(
        "image",
        data.imageFile
      );
    }

    return api.patch(
      `/menu/items/${baseItemId}`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  },

  async addItem(payload: {
    name: string;
    description?: string;
    category: string;
    price: number;
    foodType: "veg" | "non-veg";
    imageFile: File;
  }) {

    // 1. Create base item
    const formData = new FormData();

    formData.append(
      "item_name",
      payload.name
    );

    formData.append(
      "item_description",
      payload.description || ""
    );

    formData.append(
      "item_type_id",
      payload.foodType === "veg"
        ? "1"
        : "2"
    );

    formData.append(
      "image",
      payload.imageFile
    );

    const itemRes =
      await api.post(
        "/menu/items",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    const itemId =
      itemRes.data.item_id;

    // 2. Get category
    const categoriesRes =
      await api.get(
        "/menu/categories"
      );

    let category =
      categoriesRes.data.find(
        (c: MenuCategory) =>
          c.category_name ===
          payload.category
      );

    // Create category if needed
    if (!category) {
      const newCategory =
        await api.post(
          "/menu/categories",
          {
            category_name:
              payload.category,
          }
        );

      category =
        newCategory.data;
    }

    // 3. Attach item to branch
    await api.post(
      "/menu/branch-items",
      {
        item_id: itemId,
        category_id:
          category.category_id,
        price: payload.price,
      }
    );
  },
};