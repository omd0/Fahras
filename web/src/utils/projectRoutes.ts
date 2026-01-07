/**
 * Centralized project URL routing utility
 *
 * This module provides a single source of truth for all project-related URLs
 * in the application. Use these functions instead of hardcoding URLs to ensure
 * consistency and make future routing changes easier.
 */

/**
 * Helper to extract slug from project object
 * Falls back to ID for backward compatibility during migration
 */
export const getProjectSlug = (project: { slug?: string; id?: number }): string => {
  if (project.slug) {
    return project.slug;
  }
  // Fallback to ID during migration period
  return String(project.id);
};

/**
 * Project routing functions
 *
 * All functions return absolute paths that can be used with navigate() or <Link to={...}>
 */
export const projectRoutes = {
  /**
   * Main project detail view (unified for guest and authenticated users)
   * @param slug - Project slug (e.g., "244k3n") or ID for backward compatibility
   * @example projectRoutes.detail("244k3n") // => "/pr/244k3n"
   */
  detail: (slug: string): string => `/pr/${slug}`,

  /**
   * Project edit page
   * @param slug - Project slug or ID
   * @example projectRoutes.edit("244k3n") // => "/pr/244k3n/edit"
   */
  edit: (slug: string): string => `/pr/${slug}/edit`,

  /**
   * Project follow/tracking page
   * @param slug - Project slug or ID
   * @example projectRoutes.follow("244k3n") // => "/pr/244k3n/follow"
   */
  follow: (slug: string): string => `/pr/${slug}/follow`,

  /**
   * Project code repository view (root)
   * @param slug - Project slug or ID
   * @example projectRoutes.code("244k3n") // => "/pr/244k3n/code"
   */
  code: (slug: string): string => `/pr/${slug}/code`,

  /**
   * Project code repository with specific file path
   * @param slug - Project slug or ID
   * @param filePath - Relative file path within the repository
   * @example projectRoutes.codeFile("244k3n", "src/App.tsx") // => "/pr/244k3n/code/src%2FApp.tsx"
   */
  codeFile: (slug: string, filePath: string): string =>
    `/pr/${slug}/code/${encodeURIComponent(filePath)}`,

  /**
   * Create new project page
   * @example projectRoutes.create() // => "/pr/create"
   */
  create: (): string => '/pr/create',

  /**
   * Explore/browse all projects page
   * @example projectRoutes.explore() // => "/explore"
   */
  explore: (): string => '/explore',
};

/**
 * Convenience function to get project detail URL from project object
 * @param project - Project object with slug or id field
 * @example getProjectDetailUrl(project) // => "/pr/244k3n"
 */
export const getProjectDetailUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.detail(getProjectSlug(project));
};

/**
 * Convenience function to get project edit URL from project object
 * @param project - Project object with slug or id field
 * @example getProjectEditUrl(project) // => "/pr/244k3n/edit"
 */
export const getProjectEditUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.edit(getProjectSlug(project));
};

/**
 * Convenience function to get project follow URL from project object
 * @param project - Project object with slug or id field
 * @example getProjectFollowUrl(project) // => "/pr/244k3n/follow"
 */
export const getProjectFollowUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.follow(getProjectSlug(project));
};

/**
 * Convenience function to get project code URL from project object
 * @param project - Project object with slug or id field
 * @example getProjectCodeUrl(project) // => "/pr/244k3n/code"
 */
export const getProjectCodeUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.code(getProjectSlug(project));
};
