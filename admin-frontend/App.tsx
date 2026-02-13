
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthScreen } from './components/auth/AuthScreen.tsx';
import { MainLayout } from './components/layout/MainLayout.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
//import { StaffPage } from './pages/StaffPage.tsx';
//import { RoleAccessPage } from './pages/RoleAccessPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { BrandingPage } from './pages/BrandingPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { BranchesPage } from './pages/BranchesPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { constants } from './constants.ts';
import { BranchProvider } from './context/BranchContext.tsx';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [initialBranchId, setInitialBranchId] = useState<string>('1');

  const handleLogin = (isSuccess: boolean, branchId?: string) => {
    if (branchId) {
      setInitialBranchId(branchId);
    }
    setIsAuthenticated(isSuccess);
  };

  return (
    <Router>
      <Routes>
        <Route
          path={constants.routes.LOGIN}
          element={isAuthenticated ? <Navigate to={constants.routes.OVERVIEW} replace /> : <AuthScreen onLogin={handleLogin} />}
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <BranchProvider initialBranchId={initialBranchId}>
                <MainLayout onLogout={() => setIsAuthenticated(false)}>
                  <Routes>
                    <Route path={constants.routes.OVERVIEW} element={<OverviewPage />} />
                    <Route path={constants.routes.ORDERS} element={<OrdersPage />} />
                    <Route path={constants.routes.MENU} element={<MenuPage />} />
                    <Route path={constants.routes.BRANCHES} element={<BranchesPage />} />
                    {/* <Route path={constants.routes.STAFF} element={<StaffPage />} /> */}
                    {/* <Route path={constants.routes.ROLE_ACCESS} element={<RoleAccessPage />} /> */}
                    <Route path={constants.routes.REPORTS} element={<ReportsPage />} />
                    <Route path={constants.routes.BRANDING} element={<BrandingPage />} />
                    <Route path={constants.routes.SETTINGS} element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to={constants.routes.OVERVIEW} replace />} />
                  </Routes>
                </MainLayout>
              </BranchProvider>
            ) : (
              <Navigate to={constants.routes.LOGIN} replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
