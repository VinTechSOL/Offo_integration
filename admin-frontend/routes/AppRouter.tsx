import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthScreen } from "../components/auth/AuthScreen";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "../components/layout/MainLayout";

import { OverviewPage } from "../pages/OverviewPage";
import { BranchesPage } from "../pages/BranchesPage";
import { AddVendorPage } from "../pages/AddVendorPage";
import { ViewCafesPage } from "../pages/ViewCafesPage";
import { ManageUsersPage } from "../pages/ManageUsersPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ProfilePage } from "../pages/ProfilePage";

import { useAuth } from "../context/AuthContext";
import { constants } from "../constants";
import { AddBranchPage } from "@/pages/AddBranchPage";
import { CityProvider } from "../context/CityContext";
import { CampusProvider } from "../context/CampusContext";
import { BuildingProvider } from "@/context/BuildingContext";
import { CafeProvider } from "../context/CafeContext";
import { BranchProvider } from "../context/BranchContext";
import { LocationProvider } from "@/context/LocationContext";

export const AppRouter: React.FC = () => {

  const { logout } = useAuth();

  return (
    <Routes>

      {/* Login */}
      <Route
        path={constants.routes.LOGIN}
        element={<AuthScreen />}
      />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <LocationProvider>
                <CafeProvider>
                  <BranchProvider>
                    <MainLayout onLogout={logout} />
                  </BranchProvider>
                </CafeProvider>
            </LocationProvider>
          </ProtectedRoute>
        }
      >

        <Route path={constants.routes.OVERVIEW} element={<OverviewPage />} />
        <Route path={constants.routes.BRANCHES} element={<BranchesPage />} />
        <Route path={constants.routes.ADD_VENDOR} element={<AddVendorPage />} />
        <Route path={constants.routes.VIEW_CAFES} element={<ViewCafesPage />} />
        <Route path={constants.routes.MANAGE_USERS} element={<ManageUsersPage />} />
        <Route path={constants.routes.REPORTS} element={<ReportsPage />} />
        <Route path={constants.routes.SETTINGS} element={<SettingsPage />} />
        <Route path={constants.routes.PROFILE} element={<ProfilePage />} />
        <Route path={constants.routes.ADD_BRANCH} element={<AddBranchPage />} />

        <Route path="/" element={<Navigate to={constants.routes.OVERVIEW} />} />

      </Route>

    </Routes>
  );
};