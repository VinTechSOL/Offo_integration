import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import { ProfileApi, ProfileResponse } from "@/apis/ProfileApi";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= Password Reset State ================= */
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword.length > 72) {
      setErrorMsg('Password must not exceed 72 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await ProfileApi.changePassword(newPassword);

      toast.success(response.message || 'Password updated successfully!');

      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      console.error('Failed to change password', err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to update password. Please try again.';

      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 font-medium">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-offoTextDark">My Profile</h1>
        <p className="text-gray-500 mt-1">Account information and security options</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
            <img
              src="https://picsum.photos/seed/admin/200"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-offoOrange font-semibold capitalize">{profile.role}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
          <Info label="Username" value={profile.username} />
          <Info label="Role" value={profile.role} />
          <Info label="Access Scope" value={profile.access_scope} />
          <Info
            label="Account Status"
            value={profile.is_active ? "Active" : "Inactive"}
          />
          <Info
            label="Joined"
            value={new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
        </div>
      </Card>

      {/* Security Info & Reset Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">Security</h3>
          </div>
          
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 text-sm font-semibold text-offoOrange bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              Reset Password
            </button>
          )}
        </div>

        {!showPasswordForm ? (
          <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p>
              Super Admin credentials manage critical system actions. Keep your account details updated and secure.
            </p>
            <p>
              If you require a manual credential reset, contact the platform administration team.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-5 pt-2">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-offoOrange/20 focus:border-offoOrange transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-offoOrange/20 focus:border-offoOrange transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Super Admin Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold">Important Notice:</span> Since you hold <strong>Super Admin</strong> privileges, you are authorized to modify your password independently. If you lose or forget this updated password, you will need to contact the <strong>Tech Team</strong> to recover access.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setErrorMsg(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-offoOrange hover:bg-orange-600 rounded-lg shadow-sm disabled:opacity-50 transition"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

/* ================= Small Component ================= */
const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
  </div>
);