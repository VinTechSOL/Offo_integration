import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { ProfileApi, ProfileResponse } from "@/apis/ProfileApi";

export const ProfilePage: React.FC = () => {

  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const [loading, setLoading] = useState(true);

  /* ================= Load Profile ================= */

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const data = await ProfileApi.getProfile();

        setProfile(data);

      } catch (err) {

        console.error("Failed to load profile", err);

      } finally {

        setLoading(false);

      }

    };

    loadProfile();

  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-offoTextDark">
          My Profile
        </h1>

        <p className="text-gray-500 mt-1">
          Account information
        </p>

      </div>

      {/* Profile Card */}

      <Card className="p-6 space-y-6">

        <div className="flex items-center gap-6">

          <div className="w-20 h-20 rounded-full overflow-hidden border">

            <img
              src="https://picsum.photos/seed/admin/200"
              className="w-full h-full object-cover"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold">
              {profile.full_name}
            </h2>

            <p className="text-offoOrange font-semibold">
              {profile.role}
            </p>

          </div>

        </div>

        {/* Info Grid */}

        <div className="grid grid-cols-2 gap-6">

          <Info label="Username" value={profile.username} />

          <Info label="Role" value={profile.role} />

          <Info label="Access Scope" value={profile.access_scope} />

          <Info
            label="Account Status"
            value={profile.is_active ? "Active" : "Inactive"}
          />

          <Info
            label="Joined"
            value={new Date(profile.created_at).toLocaleDateString()}
          />

        </div>

      </Card>

      {/* Security Info */}

      <Card className="p-6">

        <h3 className="text-lg font-bold mb-4">
          Security
        </h3>

        <div className="space-y-3 text-sm text-gray-600">

          <p>
            Super Admin password is managed securely through the
            system administrator.
          </p>

          <p>
            If you need to reset your password, contact the
            platform administrator.
          </p>

        </div>

      </Card>

    </div>
  );
};

/* ================= Small Component ================= */

const Info = ({ label, value }: { label: string; value: string }) => (

  <div>

    <p className="text-xs text-gray-400 uppercase">
      {label}
    </p>

    <p className="font-semibold text-gray-900">
      {value}
    </p>

  </div>

);