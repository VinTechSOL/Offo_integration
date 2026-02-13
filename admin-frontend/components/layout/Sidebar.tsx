
import React from 'react';
import { NavLink } from 'react-router-dom';
import { constants } from '../../constants.ts';
import LogoutModal from '../auth/LogoutModal.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState<boolean>(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  const navLinks = [
    {
      group: null,
      name: 'Overview',
      path: constants.routes.OVERVIEW,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
    },
    {
      group: 'OPERATIONS',
      name: 'Orders',
      path: constants.routes.ORDERS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
    },
    {
        name: 'Menu',
        path: constants.routes.MENU,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        )
    },
    {
      group: 'MANAGEMENT',
      name: 'Branches',
      path: constants.routes.BRANCHES,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1"></path>
        </svg>
      ),
    },
    {
      name: 'Staff',
      path: constants.routes.STAFF,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h2m0 0l4-4m-4 4l-4-4m4 4v-4m-6 4h16"></path>
        </svg>
      ),
    },
    {
      name: 'Roles & Access',
      path: constants.routes.ROLE_ACCESS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V9a2 2 0 012-2h2zM7 15a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4zM12 9v6m-4-6V9m8 0V9m-4 4h.01M17 19h.01M13 13h.01"></path>
        </svg>
      ),
    },
    {
      group: 'SYSTEM',
      name: 'Reports',
      path: constants.routes.REPORTS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
      ),
    },
    {
      name: 'Branding',
      path: constants.routes.BRANDING,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2 0l2-2m-6.5-6.5L12 10.5m-2.5 2.5L7 10.5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      ),
    },
    {
      name: 'Settings',
      path: constants.routes.SETTINGS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div
      id="sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-${constants.colors.BG_DARK} text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:relative md:flex md:flex-col`}
    >
      <div className="flex items-center justify-center h-16 bg-offoDark-light border-b border-offoDark-light px-4">
        <h1 className="text-5xl font-bold text-offoOrange">OFFO</h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navLinks.map((link, index) => (
          <React.Fragment key={index}>
            {link.group && (
              <h3 className={`text-offoSlate text-xs uppercase font-medium mt-4 mb-2 px-3`}>
                {link.group}
              </h3>
            )}
            <NavLink
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg text-offoTextLight hover:bg-offoDark-light transition-colors duration-200 ${
                  isActive ? `bg-offoDark-light font-semibold` : ''
                }`
              }
            >
              <span className="mr-3 text-current">{link.icon}</span>
              <span className="text-current">{link.name}</span>
            </NavLink>
          </React.Fragment>
        ))}
      </nav>

      <div className="p-4 border-t border-offoDark-light">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-offoDark-light transition-colors duration-200"
          aria-label="Logout"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};
