import api from "./client";

export const SettingsApi = {
  async getProfile() {
    const res = await api.get("/vendors/settings/profile");
    return res.data;
  },
};
