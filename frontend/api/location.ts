// src/api/locations.ts
import api from "./client"; // your existing axios instance

export interface CityResponse {
  city: string;
}

export interface CampusResponse {
  campus: string;
}

export interface BuildingResponse {
  building: string;
}



export const getCities = async () => {
  const res = await api.get("/locations/cities");
  return res.data;
};

export const getCampuses = async (cityId: number) => {
  const res = await api.get("/locations/campuses", {
    params: { city_id: cityId },
  });
  return res.data;
};

export const getBuildings = async (campusId: number) => {
  const res = await api.get("/locations/buildings", {
    params: { campus_id: campusId },
  });
  return res.data;
};
