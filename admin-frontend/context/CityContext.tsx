import React, { createContext, useContext, useState, useEffect } from "react";
import { LocationApi } from "@/apis/LocationApi";

export interface City {
  id: string;
  name: string;
}

interface CityContextType {
  cities: City[];
  currentCityId: string;
  setCurrentCityId: (id: string) => void;
  loading: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [currentCityId, setCurrentCityId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await LocationApi.getCities();

        setCities(
          data.map((c: any) => ({
            id: String(c.city_id),
            name: c.city_name,
          }))
        );
      } catch (err) {
        console.error("Failed to load cities");
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <CityContext.Provider
      value={{ cities, currentCityId, setCurrentCityId, loading }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error("useCity must be used within CityProvider");
  return context;
};