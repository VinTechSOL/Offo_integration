import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "@/apis/client";

/* =========================================================
   TYPES
========================================================= */

interface AdminProfile {
  staff_id: number;
  username: string;
  role: string;
  branch_id: string | null;
  full_name?: string;
}

interface AuthContextType {
  profile: AdminProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

/* =========================================================
   RAW REFRESH REQUEST
========================================================= */

const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/staff/auth/refresh`,
    {},
    {
      withCredentials: true,
      timeout: 10000,
    }
  );

  const newToken = response.data?.access_token;

  if (!newToken) {
    throw new Error(
      "Refresh response did not contain access token"
    );
  }

  localStorage.setItem(
    "access_token",
    newToken
  );

  return newToken;
};

/* =========================================================
   PROVIDER
========================================================= */

export const AuthProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {

  const navigate = useNavigate();

  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem("access_token")
    );

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const fetchProfile = async () => {

    const response = await api.get(
      "/staff/auth/me"
    );

    const data = response.data;

    if (data.role !== "SUPER_ADMIN") {
      throw new Error(
        "Access denied. Super admin required."
      );
    }

    setProfile(data);

    const latestToken =
      localStorage.getItem("access_token");

    setToken(latestToken);
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = async (newToken: string) => {

    localStorage.setItem(
      "access_token",
      newToken
    );

    setToken(newToken);

    try {

      const response = await api.get(
        "/staff/auth/me"
      );

      if (
        response.data.role !==
        "SUPER_ADMIN"
      ) {
        throw new Error(
          "Access denied. Super admin required."
        );
      }

      setProfile(response.data);

    } catch (error) {

      localStorage.removeItem(
        "access_token"
      );

      setToken(null);
      setProfile(null);

      throw error;
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = async () => {

    try {

      await api.post(
        "/staff/auth/logout"
      );

    } catch (error) {

      console.error(
        "Logout request failed:",
        error
      );

    } finally {

      localStorage.removeItem(
        "access_token"
      );

      setToken(null);
      setProfile(null);

      navigate("/login", {
        replace: true,
      });
    }
  };

  /* =======================================================
     INITIAL SESSION RESTORATION
  ======================================================= */

  useEffect(() => {

    let mounted = true;

    const restoreSession = async () => {

      setLoading(true);

      try {

        const storedToken =
          localStorage.getItem(
            "access_token"
          );

        /* -------------------------------------------------
           CASE 1:
           Access token exists
        ------------------------------------------------- */

        if (storedToken) {

          setToken(storedToken);

          try {

            await fetchProfile();

            return;

          } catch (error: any) {

            /*
             * /me failed.
             *
             * Axios interceptor may already have
             * attempted refresh.
             *
             * If that also failed, try one direct
             * refresh as a final recovery attempt.
             */

            console.warn(
              "Access token validation failed. Trying refresh..."
            );
          }
        }

        /* -------------------------------------------------
           CASE 2:
           No valid access token.
           
           Try refresh cookie directly.
        ------------------------------------------------- */

        const newToken =
          await refreshAccessToken();

        if (!mounted) return;

        setToken(newToken);

        await fetchProfile();

      } catch (error) {

        /*
         * This is expected when:
         *
         * - cookies were cleared
         * - refresh token expired
         * - refresh token revoked
         * - user never logged in
         */

        console.log(
          "No valid staff session."
        );

        if (!mounted) return;

        localStorage.removeItem(
          "access_token"
        );

        setToken(null);
        setProfile(null);

      } finally {

        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };

  }, []);

  /* =======================================================
     CONTEXT
  ======================================================= */

  return (
    <AuthContext.Provider
      value={{
        profile,
        token,
        isAuthenticated:
          !!token && !!profile,
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

/* =========================================================
   HOOK
========================================================= */

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};