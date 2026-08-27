import React, {useEffect} from "react";
import MobileLoginForm from "./MobileLoginForm";
import { constants } from "../../constants";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthScreen: React.FC = () => {

  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();

  // Auto redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated && profile?.role === "SUPER_ADMIN") {
      navigate(constants.routes.OVERVIEW);
    }
  }, [loading, isAuthenticated, profile, navigate]);

  if (loading) return null;


  return (
    <div className="min-h-screen flex w-full font-sans">
      {/* Left Panel */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative bg-${constants.colors.BG_DARK} overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-offoOrange to-offoOrange-dark opacity-90 z-10"></div>
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5')] bg-cover bg-center mix-blend-overlay opacity-50"></div>

        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full">
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight">OFFO.</h1>
          <h2 className="text-3xl font-bold mb-4">Admin Panel</h2>
          <p className="text-lg opacity-90 max-w-md leading-relaxed">
            Manage your restaurants, branches, and analytics all in one place.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-5xl font-extrabold text-offoOrange tracking-tight">
              OFFO.
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Admin Panel</p>
          </div>

          <MobileLoginForm  />

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              © 2026 OFFO. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};