import React, { useState, useMemo, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import LogoutModal from "../auth/LogoutModal";
import MultiSelectDropdown from "../common/MultiselectDropdown";

import { useBranch } from "../../context/BranchContext";
import { useLocation } from "../../context/LocationContext";
import { ProfileApi } from "@/apis/ProfileApi";

interface MainLayoutProps {
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [adminName, setAdminName] = useState("Admin");

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ================= Branch Context ================= */

  const {
    branches,
    selectedBranchIds,
    setSelectedBranchIds,
    selectedCities,
    selectedAreas,
    setSelectedCities,
    setSelectedAreas,
  } = useBranch();

  /* ================= Location Context ================= */

  const {
    cities,
    campuses,
    setSelectedCityId,
    setSelectedCampusId,
  } = useLocation();

  /* ================= Load Admin Profile ================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await ProfileApi.getProfile();
        setAdminName(data.full_name);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    loadProfile();
  }, []);

  /* ================= Close Dropdown on Outside Click ================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  /* =========================================
     Cities from backend
  ========================================= */

  const allCities = useMemo(() => {
    return cities.map((c) => c.name);
  }, [cities]);

  /* =========================================
     Areas filtered by city
  ========================================= */

  const allAreas = useMemo(() => {
    if (!selectedCities.length) return [];

    const selectedCity = cities.find((c) => c.name === selectedCities[0]);

    if (!selectedCity) return [];

    return campuses
      .filter((c) => c.cityId === selectedCity.id)
      .map((c) => c.name);
  }, [cities, campuses, selectedCities]);

  /* =========================================
     Branch filter
  ========================================= */

  const filteredBranches = useMemo(() => {
    if (!selectedCities.length || !selectedAreas.length) return [];

    const selectedCity = cities.find((c) => c.name === selectedCities[0]);
    const selectedCampus = campuses.find((c) => c.name === selectedAreas[0]);

    if (!selectedCity || !selectedCampus) return [];

    return branches.filter(
      (b) =>
        b.cityId === selectedCity.id &&
        b.campusId === selectedCampus.id
    );
  }, [branches, selectedCities, selectedAreas, cities, campuses]);

  return (
    <div className="flex min-h-screen bg-offoPrimaryBg">
      {/* ================= Sidebar ================= */}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* ================= Header ================= */}

        <header className="bg-offoHeaderBg min-h-[5.5rem] px-4 sm:px-6 py-4 text-white flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-md">
          {/* Header Title & Mobile Sidebar Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Open Sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-white/80">
                  Vendor Control Center
                </p>
              </div>
            </div>

            {/* Profile Dropdown for Mobile / Tablet view top right */}
            <div className="relative xl:hidden" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsProfileDropdownOpen(!isProfileDropdownOpen)
                }
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-xl transition"
              >
                <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none">
                  {adminName}
                </span>
                <svg
                  className="w-4 h-4 opacity-80 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-50 text-gray-800">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls & Filters Container */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full xl:w-auto">
            {/* City Filter */}
            <div className="flex-1 sm:flex-initial min-w-[140px]">
              <MultiSelectDropdown
                label="City"
                options={allCities}
                selectedOptions={selectedCities}
                onChange={(citiesSelected) => {
                  setSelectedCities(citiesSelected);
                  setSelectedAreas([]);
                  setSelectedBranchIds([]);

                  const city = cities.find(
                    (c) => c.name === citiesSelected[0]
                  );

                  if (city) {
                    setSelectedCityId(city.id);
                    toast.success(`City set to ${city.name}`);
                  } else {
                    toast("City selection cleared");
                  }
                }}
                placeholder="Select City"
              />
            </div>

            {/* Area Filter */}
            <div className="flex-1 sm:flex-initial min-w-[140px]">
              <MultiSelectDropdown
                label="Area"
                options={allAreas}
                selectedOptions={selectedAreas}
                onChange={(areasSelected) => {
                  setSelectedAreas(areasSelected);
                  setSelectedBranchIds([]);

                  const campus = campuses.find(
                    (c) => c.name === areasSelected[0]
                  );

                  if (campus) {
                    setSelectedCampusId(campus.id);
                    toast.success(`Area set to ${campus.name}`);
                  } else {
                    toast("Area selection cleared");
                  }
                }}
                placeholder="Select Area"
              />
            </div>

            {/* Branch Filter */}
            <div className="flex-1 sm:flex-initial min-w-[140px]">
              <MultiSelectDropdown
                label="Branch"
                options={filteredBranches.map((b) => b.name)}
                selectedOptions={filteredBranches
                  .filter((b) => selectedBranchIds.includes(b.id))
                  .map((b) => b.name)}
                onChange={(branchNames) => {
                  const ids = filteredBranches
                    .filter((b) => branchNames.includes(b.name))
                    .map((b) => b.id);

                  setSelectedBranchIds(ids);

                  if (branchNames.length > 0) {
                    toast.success(
                      `${branchNames.length} branch(es) selected`
                    );
                  } else {
                    toast("Branch selection cleared");
                  }
                }}
                placeholder="Select Branch"
              />
            </div>

            {/* Profile Dropdown for Desktop View */}
            <div
              className="hidden xl:flex items-center gap-4 border-l border-white/30 pl-4 relative"
              ref={dropdownRef}
            >
              <button
                onClick={() =>
                  setIsProfileDropdownOpen(!isProfileDropdownOpen)
                }
                className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition"
              >
                <span className="text-sm font-semibold">{adminName}</span>

                <svg
                  className="w-4 h-4 opacity-80 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-50 text-gray-800">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= Page Content ================= */}

        <main className="flex-1 p-4 sm:p-6 overflow-auto text-offoTextDark">
          <Outlet />
        </main>
      </div>

      {/* ================= Bottom Nav ================= */}

      <BottomNav />

      {/* ================= Logout Modal ================= */}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};