import React, { createContext, useContext, useState, useEffect } from "react";
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
  loading: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentCityId } = useCity();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [currentCampusId, setCurrentCampusId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentCityId) {
      setCampuses([]);
      setCurrentCampusId("");
      return;
    }

    const fetchCampuses = async () => {
      setLoading(true);
      try {
        const data = await LocationApi.getCampuses(currentCityId);

        setCampuses(
          data.map((c: any) => ({
            id: String(c.campus_id),
            name: c.campus_name,
            cityId: String(c.city_id)
          }))
        );
      } catch (err) {
        console.error("Failed to load campuses");
      } finally {
        setLoading(false);
      }
    };

    fetchCampuses();
  }, [currentCityId]);

  return (
    <CampusContext.Provider
      value={{ campuses, currentCampusId, setCurrentCampusId, loading }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) throw new Error("useCampus must be used within CampusProvider");
  return context;
};