import React, { useEffect, useState } from "react";
import { BuildingOfficeIcon, PhoneIcon } from "../components/icons";
import { SettingsApi } from "@/apis/settings";

interface ProfileData {
  cafe_name: string;
  branch_name: string;
  phone_number: string;
  cafe_image?: string;
  opens_at?: string;
  closes_at?: string;
  is_active: boolean;
}

const SettingsField: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <input
        type="text"
        value={value}
        readOnly
        className={`block w-full ${icon ? "pl-10" : "pl-3"} sm:text-sm border-gray-300 rounded-md py-2 bg-gray-50`}
      />
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    cafe_name: "",
    branch_name: "",
    phone_number: "",
    cafe_image: "",
    opens_at: "",
    closes_at: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleToggle = async () => {
    try {
      setSaving(true);
      const updated = { ...profile, is_active: !profile.is_active };
      setProfile(updated);
      await SettingsApi.updateStatus(updated.is_active);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setSaving(false);
    }
  };

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

      {/* Image */}
      {profile.cafe_image && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Café Image
          </label>
          <img
            src={profile.cafe_image}
            alt="Cafe"
            className="w-full max-w-md h-56 object-contain rounded-lg border bg-gray-50 p-2"
          />
        </div>
      )}

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

        <SettingsField label="Opens At" value={profile.opens_at || '-'} />

        <SettingsField label="Closes At" value={profile.closes_at || '-'} />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Branch Active Status
          </h3>
          <p className="text-xs text-text-secondary">
            If disabled, this branch will not be visible to users.
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            profile.is_active ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              profile.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
       
      </div>
    </div>
  );
};