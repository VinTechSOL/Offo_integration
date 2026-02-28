import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import { AuthScreen } from "./components/auth/AuthScreen";
import { MainLayout } from "./components/layout/MainLayout";

import { ViewCafesPage } from "./pages/ViewCafesPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BranchesPage } from "./pages/BranchesPage";
import { OrdersPage } from "./pages/OrdersPage";
import { AddVendorPage } from "./pages/AddVendorPage";
import { ManageUsersPage } from "./pages/ManageUsersPage";

import { BranchProvider } from "./context/BranchContext";
import { CityProvider } from "./context/CityContext";
import { CampusProvider } from "./context/CampusContext";
import { CafeProvider } from "./context/CafeContext";

import { constants } from "./constants";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* ================= LOGIN ================= */}
          <Route
            path={constants.routes.LOGIN}
            element={<AuthScreen />}
          />

          {/* ================= PROTECTED AREA ================= */}
          <Route
            element={
              <ProtectedRoute>
                <CityProvider>
                  <CampusProvider>
                    <CafeProvider>
                      <BranchProvider>
                        <MainLayout />
                      </BranchProvider>
                    </CafeProvider>
                  </CampusProvider>
                </CityProvider>
              </ProtectedRoute>
            }
          >
            <Route
              path={constants.routes.OVERVIEW}
              element={<OverviewPage />}
            />

            <Route
              path={constants.routes.ORDERS}
              element={<OrdersPage />}
            />

            <Route
              path={constants.routes.BRANCHES}
              element={<BranchesPage />}
            />

            <Route
              path={constants.routes.ADD_VENDOR}
              element={<AddVendorPage />}
            />

            <Route
              path={constants.routes.VIEW_CAFES}
              element={<ViewCafesPage />}
            />

            <Route
              path={constants.routes.MANAGE_USERS}
              element={<ManageUsersPage />}
            />

            <Route
              path={constants.routes.REPORTS}
              element={<ReportsPage />}
            />

            <Route
              path={constants.routes.SETTINGS}
              element={<SettingsPage />}
            />

            {/* Default */}
            <Route
              path="/"
              element={<Navigate to={constants.routes.OVERVIEW} replace />}
            />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;