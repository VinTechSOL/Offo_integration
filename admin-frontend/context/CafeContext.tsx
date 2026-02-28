import React, { createContext, useContext, useEffect, useState } from "react";
import { CafeApi } from "@/apis/CafeApi";

export interface Cafe {
  id: string;
  name: string;
}

interface CafeContextType {
  cafes: Cafe[];
  currentCafeId: string;
  setCurrentCafeId: (id: string) => void;
  loading: boolean;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [currentCafeId, setCurrentCafeId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const data = await CafeApi.getCafeterias();

        setCafes(
          data.map((c: any) => ({
            id: String(c.cafe_id),
            name: c.cafe_name,
          }))
        );
      } catch (err) {
        console.error("Failed to load cafeterias");
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  return (
    <CafeContext.Provider
      value={{ cafes, currentCafeId, setCurrentCafeId, loading }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error("useCafe must be used within CafeProvider");
  return context;
};