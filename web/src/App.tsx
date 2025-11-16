import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { createTvtcTheme, tvtcCSSVariables } from './theme/tvtcTheme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { GuestProjectDetailPage } from './pages/GuestProjectDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { FacultyDashboard } from './components/dashboards/FacultyDashboard';
import AdminProjectApprovalPage from './pages/AdminProjectApprovalPage';
import FacultyPendingApprovalPage from './pages/FacultyPendingApprovalPage';
import StudentMyProjectsPage from './pages/StudentMyProjectsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TestAuthPage } from './pages/TestAuthPage';
import { TVTCBranding } from './components/TVTCBranding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// Apply TVTC CSS variables globally
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tvtcCSSVariables;
  document.head.appendChild(style);
}

const createEmotionCache = (direction: 'ltr' | 'rtl') =>
  createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui',
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
  });

const AppContent: React.FC = () => {
  const { direction } = useLanguage();

  const theme = useMemo(() => createTvtcTheme(direction), [direction]);
  const rtlCache = useMemo(() => createEmotionCache('rtl'), []);
  const ltrCache = useMemo(() => createEmotionCache('ltr'), []);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ThemeProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  gap: 1.5,
                }}
              >
                <LanguageSwitcher />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Routes>
          {/* Public routes */}
          <Route path="/" element={<ExplorePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Project routes - Create and Edit restricted for Reviewer users */}
          <Route
            path="/projects/create"
            element={
              <RoleProtectedRoute restrictedRoles={['reviewer']}>
                <CreateProjectPage />
              </RoleProtectedRoute>
            }
          />
          {/* Public project detail route */}
          <Route
            path="/projects/:id"
            element={<GuestProjectDetailPage />}
          />
          
          {/* Protected project detail route for authenticated users */}
          <Route
            path="/dashboard/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <RoleProtectedRoute restrictedRoles={['reviewer']}>
                <EditProjectPage />
              </RoleProtectedRoute>
            }
          />
          
          {/* Analytics route */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Evaluations route - allowed for faculty and admin */}
          <Route
            path="/evaluations"
            element={
              <RoleProtectedRoute allowedRoles={['faculty', 'admin']}>
                <EvaluationsPage />
              </RoleProtectedRoute>
            }
          />
          
          {/* Advisor Projects route - faculty only */}
          <Route
            path="/advisor-projects"
            element={
              <RoleProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </RoleProtectedRoute>
            }
          />
          
          {/* User Management route - admin only */}
          <Route
            path="/users"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </RoleProtectedRoute>
            }
          />
          
          {/* Profile route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Settings route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Approvals route - admin only */}
          <Route
            path="/approvals"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ApprovalsPage />
              </RoleProtectedRoute>
            }
          />
          
          {/* Admin Project Approval route - admin only */}
          <Route
            path="/admin/projects"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminProjectApprovalPage />
              </RoleProtectedRoute>
            }
          />
          
          {/* Faculty Pending Approval route - faculty only */}
          <Route
            path="/faculty/pending-approval"
            element={
              <RoleProtectedRoute allowedRoles={['faculty']}>
                <ErrorBoundary>
                  <FacultyPendingApprovalPage />
                </ErrorBoundary>
              </RoleProtectedRoute>
            }
          />
          
          {/* Student My Projects route - student only */}
          <Route
            path="/student/my-projects"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <ErrorBoundary>
                  <StudentMyProjectsPage />
                </ErrorBoundary>
              </RoleProtectedRoute>
            }
          />
          
          {/* Notifications route - all authenticated users */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <NotificationsPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          
          {/* Test route for debugging */}
          <Route
            path="/test-auth"
            element={<TestAuthPage />}
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
              
              {/* TVTC Footer */}
              <TVTCBranding variant="footer" showDescription={true} />
            </Box>
          </ThemeProvider>
        </Router>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;