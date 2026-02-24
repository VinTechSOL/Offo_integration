import React, { useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthScreen } from './components/auth/AuthScreen';
import { MainLayout } from './components/layout/MainLayout';
import { ViewCafesPage } from './pages/ViewCafesPage';
import { OverviewPage } from './pages/OverviewPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BranchesPage } from './pages/BranchesPage';
import { OrdersPage } from './pages/OrdersPage';
import { AddVendorPage } from './pages/AddVendorPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { constants } from './constants';

import { BranchProvider } from './context/BranchContext';
import { CityProvider } from './context/CityContext';
import { CampusProvider } from './context/CampusContext';
import { CafeProvider

 } from './context/CafeContext';
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

        {/* ================= LOGIN ROUTE ================= */}
        <Route
          path={constants.routes.LOGIN}
          element={
            isAuthenticated
              ? <Navigate to={constants.routes.OVERVIEW} replace />
              : <AuthScreen onLogin={handleLogin} />
          }
        />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          element={
            isAuthenticated ? (
              <CityProvider>
                <CampusProvider>
                  <CafeProvider>
                    <BranchProvider>
                      <MainLayout onLogout={() => setIsAuthenticated(false)} />
                    </BranchProvider>
                  </CafeProvider>
                </CampusProvider>
              </CityProvider>
            ) : (
              <Navigate to={constants.routes.LOGIN} replace />
            )
          }
        >

          {/* Child Routes rendered inside <Outlet /> */}
          <Route path={constants.routes.OVERVIEW} element={<OverviewPage />} />
          <Route path={constants.routes.ORDERS} element={<OrdersPage />} />
          <Route path={constants.routes.BRANCHES} element={<BranchesPage />} />
          <Route path={constants.routes.ADD_VENDOR} element={<AddVendorPage />} />
          <Route path={constants.routes.VIEW_CAFES} element={<ViewCafesPage />} />
          <Route path={constants.routes.MANAGE_USERS} element={<ManageUsersPage  />} />
          <Route path={constants.routes.REPORTS} element={<ReportsPage />} />
          <Route path={constants.routes.SETTINGS} element={<SettingsPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={constants.routes.OVERVIEW} replace />} />

        </Route>

      </Routes>
    </Router>
  );
};

export default App;