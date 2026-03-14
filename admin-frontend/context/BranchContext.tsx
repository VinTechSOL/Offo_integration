import React, { createContext, useContext, useState, ReactNode } from "react";
import { Branch } from "../types";

export interface AppUser {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "Active" | "Inactive" | "No Orders";
}

export interface Staff {
  id: string;
  branchId: string;
  role: "VENDOR";
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  lastReset?: string;
}

interface BranchContextType {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;

  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;

  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;

  /* ===== Filters used in Dashboard ===== */

  selectedBranchIds: string[];
  setSelectedBranchIds: React.Dispatch<React.SetStateAction<string[]>>;

  selectedCities: string[];
  setSelectedCities: React.Dispatch<React.SetStateAction<string[]>>;

  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return ctx;
};

export const BranchProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {

  /* ================= Branches ================= */

  const [branches, setBranches] = useState<Branch[]>([]);

  /* ================= Users ================= */

  const [users, setUsers] = useState<AppUser[]>([]);

  /* ================= Staff ================= */

  const [staffList, setStaffList] = useState<Staff[]>([]);

  /* ================= Filters ================= */

  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        setBranches,

        users,
        setUsers,

        staffList,
        setStaffList,

        selectedBranchIds,
        setSelectedBranchIds,

        selectedCities,
        setSelectedCities,

        selectedAreas,
        setSelectedAreas
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};