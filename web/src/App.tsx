import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import AdminProjectApprovalPage from './pages/AdminProjectApprovalPage';
import { TVTCBranding } from './components/TVTCBranding';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',    // TVTC Professional Blue
      light: '#3b82f6',   // Lighter blue
      dark: '#1e40af',     // Darker blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669',    // TVTC Professional Green
      light: '#10b981',   // Lighter green
      dark: '#047857',    // Darker green
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',  // TVTC Light background
      paper: '#ffffff',     // Clean white cards
    },
    text: {
      primary: '#1f2937',  // TVTC Dark text
      secondary: '#6b7280', // TVTC Gray text
    },
    error: {
      main: '#dc2626',     // TVTC Red for errors
    },
    warning: {
      main: '#d97706',     // TVTC Orange for warnings
    },
    info: {
      main: '#1e3a8a',     // TVTC Blue for info
    },
    success: {
      main: '#059669',     // TVTC Green for success
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1f2937',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1f2937',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1f2937',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#1f2937',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#1f2937',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#6b7280',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e3a8a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
          {/* Public routes */}
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
          <Route
            path="/projects/:id"
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
          
          {/* Evaluations route - restricted for reviewers */}
          <Route
            path="/evaluations"
            element={
              <RoleProtectedRoute restrictedRoles={['reviewer']}>
                <EvaluationsPage />
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
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
          
          {/* TVTC Footer */}
          <TVTCBranding variant="footer" showDescription={true} />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;