import api from "./client";

export const SettingsApi = {
  async getProfile() {
    const res = await api.get("/vendors/settings/profile");
    return res.data;
  },

  async updateStatus(isActive: boolean) {
    const res = await api.patch("/vendors/settings/status", {
      is_active: isActive,
    });
  }
};
