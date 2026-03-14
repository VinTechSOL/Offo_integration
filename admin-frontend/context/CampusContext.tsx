import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { LocationApi } from "@/apis/LocationApi";
import { useCity } from "./CityContext";

export interface Campus {
  id: string;
  name: string;
  cityId: string;
}

interface CampusContextType {
  campuses: Campus[];
  currentCampusId: string;
  setCurrentCampusId: (id: string) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) throw new Error("useCampus must be used within CampusProvider");
  return context;
};

export const CampusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  const { currentCityId } = useCity();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [currentCampusId, setCurrentCampusId] = useState<string>("");

  useEffect(() => {

    if (!currentCityId) return;

    const fetchCampuses = async () => {

      try {

        const data = await LocationApi.getCampuses(currentCityId);

        const mapped = data.map((c: any) => ({
          id: String(c.campus_id),
          name: c.campus_name,
          cityId: String(c.city_id),
        }));

        setCampuses(mapped);

      } catch (err) {
        console.error("Failed to fetch campuses", err);
      }

    };

    fetchCampuses();

  }, [currentCityId]);

  return (
    <CampusContext.Provider
      value={{ campuses, currentCampusId, setCurrentCampusId }}
    >
      {children}
    </CampusContext.Provider>
  );
};