import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/apis/client";

/* =========================================
   Types
========================================= */

interface AdminProfile {
  staff_id: number;
  username: string;
  role: string;
  branch_id: string | null;
}

interface AuthContextType {
  profile: AdminProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

/* =========================================
   Context
========================================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================================
   Helper: Decode JWT (No external lib)
========================================= */

const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

/* =========================================
   Provider
========================================= */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* =========================================
     Logout
  ========================================= */

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setProfile(null);
    navigate("/login");
  };

  /* =========================================
     Login
  ========================================= */

  const login = (newToken: string) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  };

  /* =========================================
     Fetch Profile
  ========================================= */

  const fetchProfile = async () => {
    try {
      if (!token) return;

      const res = await api.get("/staff/auth/me");
      setProfile(res.data);
    } catch {
      logout();
    }
  };

  /* =========================================
     Token Expiry Handling
  ========================================= */

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
      logout();
      return;
    }

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();

    if (expiryTime < now) {
      logout();
      return;
    }

    // Auto logout at expiry time
    const timeout = expiryTime - now;

    const timer = setTimeout(() => {
      logout();
    }, timeout);

    setLoading(false);

    return () => clearTimeout(timer);
  }, [token]);

  /* =========================================
     Load Profile On Token Change
  ========================================= */

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        profile,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================
   Hook
========================================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};