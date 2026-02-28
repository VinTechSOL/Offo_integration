import React, { createContext, useContext, useEffect, useState } from "react";
import { CafeApi } from "@/apis/CafeApi";
import { useCafe } from "./CafeContext";

export interface Branch {
  id: string;
  name: string;
  cafeId: string;
  cityId: string;
  campusId: string;
  buildingId?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface BranchContextType {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  loading: boolean;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentCafeId } = useCafe();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    if (!currentCafeId) {
      setBranches([]);
      return;
    }

    setLoading(true);
    try {
      const data = await CafeApi.getBranchesByCafe(Number(currentCafeId));

      setBranches(
        data.map((b: any) => ({
          id: String(b.branch_id),
          name: b.branch_name,
          cafeId: String(b.cafe_id),
          cityId: String(b.city_id),
          campusId: String(b.campus_id),
          buildingId: b.building_id ? String(b.building_id) : undefined,
          imageUrl: b.image_url,
          isActive: b.is_active
        }))
      );
    } catch (err) {
      console.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentCafeId]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        setBranches,
        currentBranchId,
        setCurrentBranchId,
        loading,
        refreshBranches: fetchBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) throw new Error("useBranch must be used within BranchProvider");
  return context;
};