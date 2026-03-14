import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { LocationApi } from "@/apis/LocationApi";

export interface City {
  id: string;
  name: string;
}

interface CityContextType {
  cities: City[];
  currentCityId: string;
  setCurrentCityId: (id: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error("useCity must be used within CityProvider");
  return context;
};

export const CityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  const [cities, setCities] = useState<City[]>([]);
  const [currentCityId, setCurrentCityId] = useState<string>("");

  useEffect(() => {

    const fetchCities = async () => {
      try {

        const data = await LocationApi.getCities();

        const mapped = data.map((c: any) => ({
          id: String(c.city_id),
          name: c.city_name,
        }));

        setCities(mapped);

      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };

    fetchCities();

  }, []);

  return (
    <CityContext.Provider
      value={{ cities, currentCityId, setCurrentCityId }}
    >
      {children}
    </CityContext.Provider>
  );
};