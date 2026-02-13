import React from 'react';
import { LogoutIcon } from './icons';

interface HeaderProps {
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-offo-orange text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Left: Logo */}
          <div className="text-3xl font-bold">
            OFFO
          </div>
          
          {/* Center: Title */}
          <div className="hidden md:block text-center">
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <p className="text-sm opacity-90">Welcome, Healthy Bites Catering</p>
          </div>

          {/* Right: Vendor Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <p className="font-semibold text-right">Healthy Bites Catering</p>
              <p className="text-xs text-right opacity-90">Vendor</p>
            </div>
            <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center hover:bg-white/20 transition-colors"
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