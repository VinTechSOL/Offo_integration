import React, { useState } from "react";
import { LockClosedIcon, UserIcon } from "../icons";
import { staffLogin } from "../../apis/auth";

interface LoginFormProps {
  onLoginSuccess: () => void;
   
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await staffLogin({
        username: username.trim(),
        password,
      });

      onLoginSuccess();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.code === "ERR_NETWORK") {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg animate-fadeIn w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-text-primary mb-1">
        Vendor Login
      </h2>
      <p className="text-center text-text-secondary mb-6">
        Login to manage orders & menu
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
            <UserIcon className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Username or phone number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
            <LockClosedIcon className="w-5 h-5" />
          </span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
            required
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 font-medium text-center">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
      </form>
    </div>
  );
};

export default LoginForm;
