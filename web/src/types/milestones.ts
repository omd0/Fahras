/**
 * Centralized type definitions for Milestone Template system
 * Provides type safety with enums and interfaces
 */

export enum MilestoneRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
}

export enum MilestoneAction {
  START = 'start',
  PAUSE = 'pause',
  EXTEND = 'extend',
  VIEW = 'view',
  EDIT = 'edit',
  COMPLETE = 'complete',
}

/**
 * Data structure for creating/updating a milestone template item
 */
export interface MilestoneTemplateItemData {
  title: string;
  description?: string;
  estimated_days: number;
  is_required?: boolean;
  order: number;
  allowed_roles?: MilestoneRole[];
  allowed_actions?: MilestoneAction[];
}

/**
 * Data structure for creating/updating a milestone template
 */
export interface MilestoneTemplateData {
  name: string;
  description?: string;
  program_id?: number;
  department_id?: number;
  is_default?: boolean;
  items: MilestoneTemplateItemData[];
}

