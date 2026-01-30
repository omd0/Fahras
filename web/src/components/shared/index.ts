/**
 * Shared Dashboard Components
 * 
 * Export all shared components from a single entry point
 * for easier imports throughout the application.
 * 
 * Usage:
 * import { DashboardHeader, StatsCard, ProjectCard } from '../shared';
 */

export { DashboardContainer } from './DashboardContainer';
export { DashboardHeader } from './DashboardHeader';
export { StatsCard } from './StatsCard';
export { ProjectCard } from './ProjectCard';
export { BasePortalCard } from './BasePortalCard';
export type { BasePortalCardProps } from './BasePortalCard';
export { QuickActions } from './QuickActions';
export type { QuickAction } from './QuickActions';
export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem } from './Breadcrumb';
export { SkipLink, SkipNavigation } from './SkipLink';

