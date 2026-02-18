import React, { createContext, useContext, useEffect, useState } from "react";
import { SettingsApi } from "@/apis/settings";

interface VendorProfile {
  cafe_name: string;
  branch_name: string;
  phone_number: string;
}

interface VendorContextType {
  profile: VendorProfile | null;
  refreshProfile: () => void;
  clearProfile: () => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const data = await SettingsApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch failed");
      setProfile(null);
    }
  };

  const clearProfile = () => {
    setProfile(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <VendorContext.Provider value={{ profile, refreshProfile: fetchProfile, clearProfile }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) throw new Error("useVendor must be used within VendorProvider");
  return context;
};
