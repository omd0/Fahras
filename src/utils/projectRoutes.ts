/**
 * Centralized project URL routing utility
 * Migrated from web/src/utils/projectRoutes.ts
 */

export const getProjectSlug = (project: { slug?: string; id?: number }): string => {
  if (project.slug) {
    return project.slug;
  }
  return String(project.id);
};

export const projectRoutes = {
  detail: (slug: string): string => `/pr/${slug}`,
  edit: (slug: string): string => `/pr/${slug}/edit`,
  follow: (slug: string): string => `/pr/${slug}/follow`,
  code: (slug: string): string => `/pr/${slug}/code`,
  codeFile: (slug: string, filePath: string): string =>
    `/pr/${slug}/code/${encodeURIComponent(filePath)}`,
  create: (): string => '/pr/create',
  explore: (): string => '/explore',
};

export const getProjectDetailUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.detail(getProjectSlug(project));
};

export const getProjectEditUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.edit(getProjectSlug(project));
};

export const getProjectFollowUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.follow(getProjectSlug(project));
};

export const getProjectCodeUrl = (project: { slug?: string; id?: number }): string => {
  return projectRoutes.code(getProjectSlug(project));
};
