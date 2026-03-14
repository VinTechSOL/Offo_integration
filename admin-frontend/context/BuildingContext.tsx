import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { LocationApi } from "@/apis/LocationApi";
import { useCampus } from "./CampusContext";

export interface Building {
  id: string;
  name: string;
  campusId: string;
}

interface BuildingContextType {
  buildings: Building[];
  currentBuildingId: string;
  setCurrentBuildingId: (id: string) => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(
  undefined
);

export const useBuilding = () => {
  const context = useContext(BuildingContext);
  if (!context)
    throw new Error("useBuilding must be used within BuildingProvider");
  return context;
};

export const BuildingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  const { currentCampusId } = useCampus();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [currentBuildingId, setCurrentBuildingId] = useState<string>("");

  useEffect(() => {

    if (!currentCampusId) return;

    const fetchBuildings = async () => {

      try {

        const data = await LocationApi.getBuildings(currentCampusId);

        const mapped = data.map((b: any) => ({
          id: String(b.building_id),
          name: b.building_name,
          campusId: String(b.campus_id),
        }));

        setBuildings(mapped);

      } catch (err) {
        console.error("Failed to fetch buildings", err);
      }

    };

    fetchBuildings();

  }, [currentCampusId]);

  return (
    <BuildingContext.Provider
      value={{ buildings, currentBuildingId, setCurrentBuildingId }}
    >
      {children}
    </BuildingContext.Provider>
  );
};