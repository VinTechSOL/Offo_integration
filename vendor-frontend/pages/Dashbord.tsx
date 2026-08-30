import React, { useState } from 'react';
import { Header } from '../components/Header';
import { OrdersDashboard } from '../components/OrdersDashboard';
import { MenuDashboard } from '../components/MenuDashboard';
import { ReportsDashboard } from '../pages/ReportDashboard';
import { SettingsPage } from '../pages/SettingsDashboard';
import { ConfirmationModal } from '../components/Confirmationsmodal';
import { CrmDashboard } from '../pages/CrmDashboard';
import { TicketsAndFeedback } from '../pages/TicketsAndFeedback'; // Import Tickets & Feedback component

type View = 'orders' | 'today' | 'scheduled' | 'menu' | 'reports' | 'crm' | 'support' | 'settings';

const TopNav: React.FC<{ currentView: View; setCurrentView: (view: View) => void }> = ({ currentView, setCurrentView }) => {
  const baseClasses = "py-2 px-6 rounded-md font-semibold transition-colors duration-200";
  const activeClasses = "bg-offo-orange text-white shadow-md";
  const inactiveClasses = "bg-white text-text-primary hover:bg-gray-100 shadow-sm";

  const navItems: { key: View; label: string }[] = [
    { key: 'orders', label: 'Live Orders' },
    { key: 'today', label: 'Today Orders' },
    { key: 'scheduled', label: 'Scheduled Orders' },
    { key: 'menu', label: 'Manage Menu' },
    { key: 'reports', label: 'Reports' },
    { key: 'crm', label: 'CRM' },
    { key: 'support', label: 'Tickets & Feedback' }, // Added Tickets & Feedback navigation item
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex items-center space-x-2 mb-6 p-1 bg-offo-tan-light rounded-lg overflow-x-auto">
      {navItems.map(item => (
        <button 
          key={item.key}
          onClick={() => setCurrentView(item.key)}
          className={`${baseClasses} ${currentView === item.key ? activeClasses : inactiveClasses} flex-shrink-0`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('orders');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'orders':
        return <OrdersDashboard isScheduledView={false} />;
      case 'today':
        return <OrdersDashboard isTodayView={true}/>;
      case 'scheduled':
        return <OrdersDashboard isScheduledView={true} />;
      case 'menu':
        return <MenuDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'crm':
        return <CrmDashboard />;
      case 'support':
        return <TicketsAndFeedback />; // Render the Tickets and Feedback Dashboard
      case 'settings':
        return <SettingsPage />;
      default:
        return <OrdersDashboard isScheduledView={false} />;
    }
  }

  return (
    <div className="bg-offo-tan-light min-h-screen font-sans">
      <Header onLogout={handleLogoutRequest} />
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <TopNav currentView={currentView} setCurrentView={setCurrentView} />
        {renderContent()}
      </main>
      {isLogoutModalOpen && (
        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to log out of your account?"
          confirmText="Logout"
          confirmColor="red"
        />
      )}
    </div>
  );
};