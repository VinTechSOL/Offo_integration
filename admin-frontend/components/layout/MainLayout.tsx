
import React, { useState } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { BottomNav } from './BottomNav.tsx';
import { constants } from '../../constants.ts';
import LogoutModal from '../auth/LogoutModal.tsx';
import { useBranch } from '../../context/BranchContext.tsx';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { branches, currentBranchId, setCurrentBranchId } = useBranch();

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  return (
    <div className={`flex min-h-screen bg-${constants.colors.BG_LIGHT}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={() => setIsLogoutModalOpen(true)} />

      <div className="flex-1 flex flex-col md:ml-0 pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className={`bg-offoHeaderBg shadow-lg h-16 flex items-center justify-between px-4 sticky top-0 z-20 md:hidden`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`text-${constants.colors.TEXT_LIGHT} focus:outline-none focus:ring-2 focus:ring-offoOrange rounded-md p-1`}
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-white leading-none">OFFO</h1>
             {/* Mobile Branch Selector (Tiny) */}
             <select 
                value={currentBranchId}
                onChange={(e) => setCurrentBranchId(e.target.value)}
                className="bg-transparent text-white/90 text-xs border-none p-0 focus:ring-0 cursor-pointer text-center font-medium mt-1"
             >
                {branches.map(b => (
                    <option key={b.id} value={b.id} className="text-gray-900">{b.name}</option>
                ))}
             </select>
          </div>
          <button 
             onClick={() => setIsLogoutModalOpen(true)}
             className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:flex bg-offoHeaderBg h-24 p-4 text-white items-center justify-between shadow-md relative z-10">
            <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-white/80">Welcome, Healthy Bites Catering Admin</p>
            </div>
            <div className="flex items-center gap-4">
                {/* Global Branch Selector */}
                <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-offoOrange z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1"></path></svg>
                    </span>
                    <select 
                        value={currentBranchId}
                        onChange={(e) => setCurrentBranchId(e.target.value)}
                        className="pl-10 pr-10 py-2.5 bg-white border-2 border-transparent rounded-xl text-offoDark font-bold shadow-lg shadow-orange-900/10 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white transition-all cursor-pointer appearance-none min-w-[240px] hover:shadow-xl"
                    >
                        {branches.map(b => (
                            <option key={b.id} value={b.id} className="text-offoDark font-medium py-2">
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-offoOrange transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                </div>

                <div className="h-8 w-px bg-white/20 mx-2"></div>

                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <span>Logout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
            </div>
        </div>

        {/* Content Area */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-auto text-${constants.colors.TEXT_DARK}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};
