import React, { useState, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import LogoutModal from '../auth/LogoutModal';

import { useBranch } from '../../context/BranchContext';
import { useCity } from '../../context/CityContext';
import { useCampus } from '../../context/CampusContext';

import { useAuth } from '@/context/AuthContext';

/* =========================================
   Premium Select Types
========================================= */

interface SelectOption {
  id: string;
  name: string;
}

interface PremiumSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
}

const PremiumSelect: React.FC<PremiumSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false
}) => (
  <div className="relative group min-w-[180px]">
    <select
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className="appearance-none w-full px-4 py-2.5 pr-10 bg-white rounded-xl text-offoDark font-semibold shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offoOrange transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map(item => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>

    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-offoOrange transition-colors">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div>
);

/* =========================================
   Main Layout
========================================= */

export const MainLayout: React.FC = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { branches, currentBranchId, setCurrentBranchId } = useBranch();
  const { cities, currentCityId, setCurrentCityId } = useCity();
  const { campuses, currentCampusId, setCurrentCampusId } = useCampus();

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  /* =========================================
     Hierarchy Filtering
  ========================================= */

  const filteredCampuses = useMemo(() => {
    if (!currentCityId) return [];
    return campuses.filter(c => c.cityId === currentCityId);
  }, [campuses, currentCityId]);

  const filteredBranches = useMemo(() => {
    if (!currentCampusId) return [];
    return branches.filter(b => b.campusId === currentCampusId);
  }, [branches, currentCampusId]);

  /* Reset Logic */

  useEffect(() => {
    setCurrentCampusId('');
    setCurrentBranchId('');
  }, [currentCityId]);

  useEffect(() => {
    if (currentCampusId) {
      setCurrentBranchId('');
    }
  }, [currentCampusId]);

  return (
    <div className="flex min-h-screen bg-offoPrimaryBg">

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      <div className="flex-1 flex flex-col md:ml-0 pb-16 md:pb-0">

        {/* =========================================
            Mobile Header
        ========================================= */}
        <header className="bg-offoHeaderBg shadow-lg h-16 flex items-center justify-between px-4 sticky top-0 z-20 md:hidden">

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white focus:outline-none focus:ring-2 focus:ring-offoOrange rounded-md p-1"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-white">OFFO</h1>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

        </header>

        {/* =========================================
            Desktop Header
        ========================================= */}
        <div className="hidden md:flex bg-offoHeaderBg h-24 px-6 text-white items-center justify-between shadow-md">

          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/80">
              Welcome, Healthy Bites Catering Admin
            </p>
          </div>

          <div className="flex items-center gap-5">

            <PremiumSelect
              value={currentCityId}
              onChange={(e) => setCurrentCityId(e.target.value)}
              options={cities}
              placeholder="Select City"
            />

            <PremiumSelect
              value={currentCampusId}
              onChange={(e) => setCurrentCampusId(e.target.value)}
              options={filteredCampuses}
              placeholder="Select Campus"
              disabled={!currentCityId}
            />

            <PremiumSelect
              value={currentBranchId}
              onChange={(e) => setCurrentBranchId(e.target.value)}
              options={filteredBranches}
              placeholder="Select Branch"
              disabled={!currentCampusId}
            />

            <div className="h-8 w-px bg-white/30"></div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <span>Logout</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

          </div>
        </div>

        {/* =========================================
            Page Content
        ========================================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto text-offoTextDark">
          <Outlet />
        </main>

      </div>

      <BottomNav />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};