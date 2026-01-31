import React from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/features/auth/components/RoleProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { EmailVerificationPage } from '@/features/auth/pages/EmailVerificationPage';
import { DashboardPage } from '@/features/dashboards/pages/DashboardPage';
import { ExplorePage } from '@/features/projects/pages/ExplorePage';
import { CreateProjectPage } from '@/features/projects/pages/CreateProjectPage';
import { EditProjectPage } from '@/features/projects/pages/EditProjectPage';
import { ProjectDetailPage } from '@/features/projects/pages/ProjectDetailPage';
import { RepositoryPage } from '@/features/repository/pages/RepositoryPage';
import { MyBookmarksPage } from '@/features/bookmarks/pages/MyBookmarksPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { EvaluationsPage } from '@/pages/EvaluationsPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ApprovalsPage } from '@/pages/ApprovalsPage';
import { AccessControlPage } from '@/features/access-control/pages/AccessControlPage';
import { ProjectFollowPage } from '@/features/project-follow/pages/ProjectFollowPage';
import { MilestoneTemplateConfigPage } from '@/features/milestones/pages/MilestoneTemplateConfigPage';
import { FacultyDashboard } from '@/features/dashboards/components/FacultyDashboard';
import AdminProjectApprovalPage from '@/pages/AdminProjectApprovalPage';
import FacultyPendingApprovalPage from '@/pages/FacultyPendingApprovalPage';
import StudentMyProjectsPage from '@/pages/StudentMyProjectsPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { TestAuthPage } from '@/pages/TestAuthPage';
import { AppLayout } from '@/components/layout/AppLayout';

/** Redirects legacy /projects/:id and /project/:id to /pr/:id */
function RedirectProjectIdToPr() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/pr/${id}` : '/explore'} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
       // Public routes
       { index: true, element: <ExplorePage /> },
       { path: 'home', element: <HomePage /> },
       { path: 'explore', element: <ExplorePage /> },
       { path: 'bookmarks', element: <MyBookmarksPage /> },
       { path: 'login', element: <LoginPage /> },
       { path: 'register', element: <RegisterPage /> },
       { path: 'forgot-password', element: <ForgotPasswordPage /> },
       { path: 'reset-password', element: <ResetPasswordPage /> },
       { path: 'verify-email', element: <EmailVerificationPage /> },
       { path: 'terms', element: <TermsOfServicePage /> },
       { path: 'privacy', element: <PrivacyPolicyPage /> },

      // Protected routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },

      // Project routes - New /pr/ prefix with slug-based routing
      {
        path: 'pr/create',
        element: (
          <RoleProtectedRoute restrictedRoles={['reviewer']}>
            <CreateProjectPage />
          </RoleProtectedRoute>
        ),
      },

      // Unified project detail route (works for both guest and authenticated users)
      {
        path: 'pr/:slug',
        element: <ProjectDetailPage />,
      },

      // Project edit route
      {
        path: 'pr/:slug/edit',
        element: (
          <RoleProtectedRoute restrictedRoles={['reviewer']}>
            <EditProjectPage />
          </RoleProtectedRoute>
        ),
      },

      // Project Follow Manager route
      {
        path: 'pr/:slug/follow',
        element: (
          <ProtectedRoute>
            <ProjectFollowPage />
          </ProtectedRoute>
        ),
      },

      // Repository-style routes (GitHub-like interface)
      {
        path: 'pr/:slug/code/*',
        element: (
          <ProtectedRoute>
            <RepositoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pr/:slug/code',
        element: (
          <ProtectedRoute>
            <RepositoryPage />
          </ProtectedRoute>
        ),
      },

      // Analytics route
      {
        path: 'analytics',
        element: (
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },

      // Evaluations route - allowed for faculty and admin
      {
        path: 'evaluations',
        element: (
          <RoleProtectedRoute allowedRoles={['faculty', 'admin']}>
            <EvaluationsPage />
          </RoleProtectedRoute>
        ),
      },

      // Advisor Projects route - faculty only
      {
        path: 'advisor-projects',
        element: (
          <RoleProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </RoleProtectedRoute>
        ),
      },

      // User Management route - admin only
      {
        path: 'users',
        element: (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </RoleProtectedRoute>
        ),
      },

      // Profile route
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // Settings route
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },

      // Approvals route - admin only
      {
        path: 'approvals',
        element: (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <ApprovalsPage />
          </RoleProtectedRoute>
        ),
      },

      // Admin Project Approval route - admin only
      {
        path: 'admin/approvals',
        element: (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminProjectApprovalPage />
          </RoleProtectedRoute>
        ),
      },

      // Faculty Pending Approval route - faculty only
      {
        path: 'faculty/pending-approvals',
        element: (
          <RoleProtectedRoute allowedRoles={['faculty']}>
            <FacultyPendingApprovalPage />
          </RoleProtectedRoute>
        ),
      },

      // Student My Projects route - student only
      {
        path: 'student/my-projects',
        element: (
          <RoleProtectedRoute allowedRoles={['student']}>
            <StudentMyProjectsPage />
          </RoleProtectedRoute>
        ),
      },

      // Access Control (Roles & Permissions) - admin only
      {
        path: 'access-control',
        element: (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AccessControlPage />
          </RoleProtectedRoute>
        ),
      },

      // Milestone Templates Configuration - admin only
      {
        path: 'milestone-templates',
        element: (
          <RoleProtectedRoute allowedRoles={['admin']}>
            <MilestoneTemplateConfigPage />
          </RoleProtectedRoute>
        ),
      },

      // Notifications route
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },

      // Test Auth Page (development only)
      {
        path: 'test-auth',
        element: <TestAuthPage />,
      },

      // Legacy redirects for backward compatibility (must be after more specific paths)
      {
        path: 'projects/create',
        element: <Navigate to="/pr/create" replace />,
      },
      {
        path: 'projects/:id',
        element: <RedirectProjectIdToPr />,
      },
      {
        path: 'project/:id',
        element: <RedirectProjectIdToPr />,
      },
    ],
  },
]);
