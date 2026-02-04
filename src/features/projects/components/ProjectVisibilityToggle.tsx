'use client';

/**
 * ProjectVisibilityToggle - Stub for Next.js migration
 * TODO: Full migration from web/src/features/projects/components/ProjectVisibilityToggle.tsx
 */
import React from 'react';
import type { Project } from '@/types';

interface ProjectVisibilityToggleProps {
  project: Project;
  onToggleComplete?: () => void;
  variant?: 'button' | 'icon';
}

const ProjectVisibilityToggle: React.FC<ProjectVisibilityToggleProps> = () => {
  // Stub - will be fully migrated in a dedicated task
  return null;
};

export default ProjectVisibilityToggle;
