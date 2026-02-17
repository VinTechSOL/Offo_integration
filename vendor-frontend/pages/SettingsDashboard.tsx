import React, { useEffect, useState } from "react";
import { BuildingOfficeIcon, PhoneIcon } from "../components/icons";
import { SettingsApi } from "@/apis/settings";

interface ProfileData {
  cafe_name: string;
  branch_name: string;
  phone_number: string;
}

const SettingsField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        readOnly
        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 bg-gray-50"
      />
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    cafe_name: "",
    branch_name: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await SettingsApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-fadeIn space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Café & Branch Profile
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Public information for this branch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SettingsField
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          label="Café Name"
          value={profile.cafe_name}
        />

        <SettingsField
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          label="Branch Name"
          value={profile.branch_name}
        />

        <SettingsField
          icon={<PhoneIcon className="w-5 h-5" />}
          label="Contact Phone"
          value={profile.phone_number}
        />
      </div>
    </div>
  );
};
