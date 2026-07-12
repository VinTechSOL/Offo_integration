import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { LocationApi } from "@/apis/LocationApi";

interface City {
  id: string;
  name: string;
}

interface Campus {
  id: string;
  name: string;
  cityId: string;
}

interface Building {
  id: string;
  name: string;
  campusId: string;
}

interface LocationContextType {
  cities: City[];
  campuses: Campus[];
  buildings: Building[];

  selectedCityId: string;
  selectedCampusId: string;
  selectedBuildingId: string;

  setSelectedCityId: (id: string) => void;
  setSelectedCampusId: (id: string) => void;
  setSelectedBuildingId: (id: string) => void;

  reloadCities: () => Promise<void>;
  reloadCampuses: (cityId: string) => Promise<void>;
  reloadBuildings: (campusId: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = () => {
  const ctx = useContext(LocationContext);

  if (!ctx) {
    throw new Error(
      "useLocation must be used inside LocationProvider"
    );
  }

  return ctx;
};

export const LocationProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {

  const [cities, setCities] = useState<City[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  /* =====================================================
     Reload Cities
  ===================================================== */

  const reloadCities = async () => {

    try {

      const data = await LocationApi.getCities();

      setCities(
        data.map((c: any) => ({
          id: String(c.city_id),
          name: c.city_name,
        }))
      );

    } catch (err) {

      console.error("Cities load failed", err);

    }

  };

  /* =====================================================
     Reload Campuses
  ===================================================== */

  const reloadCampuses = async (
    cityId: string
  ) => {

    if (!cityId) {

      setCampuses([]);

      return;

    }

    try {

      const data = await LocationApi.getCampuses(cityId);

      setCampuses(
        data.map((c: any) => ({
          id: String(c.campus_id),
          name: c.campus_name,
          cityId: String(c.city_id),
        }))
      );

    } catch (err) {

      console.error("Campus load failed", err);

    }

  };

  /* =====================================================
     Reload Buildings
  ===================================================== */

  const reloadBuildings = async (
    campusId: string
  ) => {

    if (!campusId) {

      setBuildings([]);

      return;

    }

    try {

      const data = await LocationApi.getBuildings(campusId);

      setBuildings(
        data.map((b: any) => ({
          id: String(b.building_id),
          name: b.building_name,
          campusId: String(b.campus_id),
        }))
      );

    } catch (err) {

      console.error("Buildings load failed", err);

    }

  };

  /* =====================================================
     Initial Load
  ===================================================== */

  useEffect(() => {

    reloadCities();

  }, []);

  /* =====================================================
     Selected City Changed
  ===================================================== */

  useEffect(() => {

    reloadCampuses(selectedCityId);

    setSelectedCampusId("");
    setSelectedBuildingId("");
    setBuildings([]);

  }, [selectedCityId]);

  /* =====================================================
     Selected Campus Changed
  ===================================================== */

  useEffect(() => {

    reloadBuildings(selectedCampusId);

    setSelectedBuildingId("");

  }, [selectedCampusId]);

  return (

    <LocationContext.Provider
      value={{
        cities,
        campuses,
        buildings,

        selectedCityId,
        selectedCampusId,
        selectedBuildingId,

        setSelectedCityId,
        setSelectedCampusId,
        setSelectedBuildingId,

        reloadCities,
        reloadCampuses,
        reloadBuildings,
      }}
    >
      {children}
    </LocationContext.Provider>

  );

};