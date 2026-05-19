import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { ConfirmProvider } from './components/common/ConfirmDialog';
import Sidebar from './components/Layout/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import KanbanPage from './pages/KanbanPage';
import GitHubPage from './pages/GitHubPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import './index.css';

import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';

const ProjectInit = () => {
  const { fetchProjects } = useProject();
  useEffect(() => { fetchProjects(); }, []);
  return null;
};

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 8 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <ProjectInit />
        <Outlet />
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/github" element={<GitHubPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'system';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <ConfirmProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: { iconTheme: { primary: '#00B894', secondary: 'white' } },
                error: { iconTheme: { primary: '#FF6B6B', secondary: 'white' } },
              }}
            />
            <AppRoutes />
          </ConfirmProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
