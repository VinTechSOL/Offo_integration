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
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  /* ---------- Load Cities ---------- */

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await LocationApi.getCities();

        const mapped = data.map((c: any) => ({
          id: String(c.city_id),
          name: c.city_name,
        }));

        setCities(mapped);
      } catch (err) {
        console.error("Cities load failed", err);
      }
    };

    loadCities();
  }, []);

  /* ---------- Load Campuses ---------- */

  useEffect(() => {
    if (!selectedCityId) {
      setCampuses([]);
      return;
    }

    const loadCampuses = async () => {
      try {
        const data = await LocationApi.getCampuses(selectedCityId);

        const mapped = data.map((c: any) => ({
          id: String(c.campus_id),
          name: c.campus_name,
          cityId: String(c.city_id),
        }));

        setCampuses(mapped);
      } catch (err) {
        console.error("Campus load failed", err);
      }
    };

    loadCampuses();
  }, [selectedCityId]);

  /* ---------- Load Buildings ---------- */

  useEffect(() => {
    if (!selectedCampusId) {
      setBuildings([]);
      return;
    }

    const loadBuildings = async () => {
      try {
        const data = await LocationApi.getBuildings(selectedCampusId);

        const mapped = data.map((b: any) => ({
          id: String(b.building_id),
          name: b.building_name,
          campusId: String(b.campus_id),
        }));

        setBuildings(mapped);
      } catch (err) {
        console.error("Buildings load failed", err);
      }
    };

    loadBuildings();
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
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};