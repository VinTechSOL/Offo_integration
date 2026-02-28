import api from "./client";

export const LocationApi = {
  getCities: async () => {
    const res = await api.get("/locations/cities");
    return res.data;
  },

  getCampuses: async (cityId: string) => {
    const res = await api.get("/locations/campuses", {
      params: { city_id: cityId },
    });
    return res.data;
  },
};