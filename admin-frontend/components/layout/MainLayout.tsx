import React, { useState, useMemo, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
    setSelectedAreas
  } = useBranch();

  /* ================= Location Context ================= */

  const {
    cities,
    campuses,
    setSelectedCityId,
    setSelectedCampusId
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
    return cities.map(c => c.name);
  }, [cities]);

  /* =========================================
     Areas filtered by city
  ========================================= */

  const allAreas = useMemo(() => {

    if (!selectedCities.length) return [];

    const selectedCity = cities.find(c => c.name === selectedCities[0]);

    if (!selectedCity) return [];

    return campuses
      .filter(c => c.cityId === selectedCity.id)
      .map(c => c.name);

  }, [cities, campuses, selectedCities]);

  /* =========================================
     Branch filter
  ========================================= */

  const filteredBranches = useMemo(() => {

    if (!selectedCities.length || !selectedAreas.length) return [];

    const selectedCity = cities.find(c => c.name === selectedCities[0]);
    const selectedCampus = campuses.find(c => c.name === selectedAreas[0]);

    if (!selectedCity || !selectedCampus) return [];

    return branches.filter(
      b =>
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

      <div className="flex-1 flex flex-col pb-16 md:pb-0">

        {/* ================= Header ================= */}

        <div className="hidden md:flex bg-offoHeaderBg h-24 px-6 text-white items-center justify-between shadow-md">

          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/80">
              Vendor Control Center
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* ================= City Filter ================= */}

            <MultiSelectDropdown
              label="City"
              options={allCities}
              selectedOptions={selectedCities}
              onChange={(citiesSelected) => {

                setSelectedCities(citiesSelected);
                setSelectedAreas([]);
                setSelectedBranchIds([]);

                const city = cities.find(c => c.name === citiesSelected[0]);

                if (city) setSelectedCityId(city.id);

              }}
              placeholder="Select City"
            />

            {/* ================= Area Filter ================= */}

            <MultiSelectDropdown
              label="Area"
              options={allAreas}
              selectedOptions={selectedAreas}
              onChange={(areasSelected) => {

                setSelectedAreas(areasSelected);
                setSelectedBranchIds([]);

                const campus = campuses.find(c => c.name === areasSelected[0]);

                if (campus) setSelectedCampusId(campus.id);

              }}
              placeholder="Select Area"
            />

            {/* ================= Branch Filter ================= */}

            <MultiSelectDropdown
              label="Branch"
              options={filteredBranches.map(b => b.name)}
              selectedOptions={filteredBranches
                .filter(b => selectedBranchIds.includes(b.id))
                .map(b => b.name)}
              onChange={(branchNames) => {

                const ids = filteredBranches
                  .filter(b => branchNames.includes(b.name))
                  .map(b => b.id);

                setSelectedBranchIds(ids);

              }}
              placeholder="Select Branch"
            />

            <div className="h-8 w-px bg-white/30"></div>

            {/* ================= Profile ================= */}

            <div className="relative" ref={dropdownRef}>

              <button
                onClick={() =>
                  setIsProfileDropdownOpen(!isProfileDropdownOpen)
                }
                className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition"
              >

                <span className="text-sm font-semibold">
                  {adminName}
                </span>

                <svg
                  className="w-4 h-4 opacity-80"
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
        </div>

        {/* ================= Page Content ================= */}

        <main className="flex-1 p-6 overflow-auto text-offoTextDark">
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