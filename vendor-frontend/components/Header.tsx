import React, { useEffect, useState } from "react";
import { LogoutIcon } from "./icons";
import { useVendor } from "@/context/VendorContext";

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { profile } = useVendor();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock (frontend only)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="bg-offo-orange text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Left - Logo */}
          <div className="text-3xl font-bold tracking-wide">
            OFFO.
          </div>

          {/* Center - Title */}
          <div className="hidden md:flex flex-col items-center">
            <h1 className="text-xl font-semibold">
              Vendor Dashboard
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-8">

            {/* Clock Block */}
            <div className="flex flex-col items-end leading-tight">
              <span className="text-lg font-semibold tracking-wide">
                {formattedTime}
              </span>
              <span className="text-sm opacity-90">
                {formattedDate}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-10 w-px bg-white/40" />

            {/* Cafe + Branch */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-base font-semibold">
                {profile?.cafe_name ?? "-"}
              </span>
              <span className="text-sm opacity-90">
                {profile?.branch_name ?? "-"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Logout"
            >
              <LogoutIcon className="w-5 h-5 text-white" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};