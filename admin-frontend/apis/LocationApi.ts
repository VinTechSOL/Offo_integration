import api from "./client";

export const LocationApi = {

  /* ================= Dropdown APIs ================= */

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

  getBuildings: async (campusId: string) => {
    const res = await api.get("/locations/buildings", {
      params: { campus_id: campusId },
    });

    return res.data;
  },

  /* ================= Location Master ================= */

  getLocationTree: async () => {
    const res = await api.get("/locations/tree");
    return res.data;
  },

  createCity: async (city_name: string) => {
    const res = await api.post("/locations/cities", {
      city_name,
    });

    return res.data;
  },

  createCampus: async (
    city_id: number,
    campus_name: string
  ) => {

    const res = await api.post("/locations/campuses", {
      city_id,
      campus_name,
    });

    return res.data;
  },

  createBuilding: async (
    campus_id: number,
    building_name: string
  ) => {

    const res = await api.post("/locations/buildings", {
      campus_id,
      building_name,
    });

    return res.data;
  }

};