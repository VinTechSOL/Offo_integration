import React, { useState } from "react";
import Button from "../common/Button";
import LoadingSpinner from "../common/LoadingSpinner";
import { loginAdmin } from "@/apis/AdminAuth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";



const MobileLoginForm: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!identifier || !password) {
      setError("Please enter username and password.");
      setLoading(false);
      return;
    }

    try {
      const result = await loginAdmin(identifier, password);

      // 🔐 Only SUPER_ADMIN allowed
      if (result.role !== "SUPER_ADMIN") {
        setError("Access denied. Not a super admin account.");
        setLoading(false);
        return;
      }

      // Store token via AuthContext
      await login(result.access_token);
      navigate("/overview");

    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500">
          Login to access your dashboard.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter username"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offoOrange focus:border-offoOrange text-gray-900 text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offoOrange focus:border-offoOrange text-gray-900 text-lg"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Login"}
        </Button>

      </form>
    </div>
  );
};

export default MobileLoginForm;