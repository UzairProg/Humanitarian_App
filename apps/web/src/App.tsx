import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { RoleType } from '@al-husseiniya/types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { FoodProgramsPage } from './pages/FoodProgramsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { BusinessesPage } from './pages/BusinessesPage';
import { EventsPage } from './pages/EventsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { VolunteersPage } from './pages/VolunteersPage';
import { ModerationPage } from './pages/ModerationPage';
import { AuditPage } from './pages/AuditPage';
import { LoginPage } from './pages/LoginPage';

const AppLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Main Authenticated / Portal Shell */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/food-programs" element={<FoodProgramsPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />

        {/* Protected Administrative Routes */}
        <Route
          path="/moderation"
          element={
            <ProtectedRoute requiredRoles={[RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN]}>
              <ModerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute requiredRoles={[RoleType.ADMIN, RoleType.SUPER_ADMIN]}>
              <AuditPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
