import React from 'react';
import { Project } from '@/types';
import { ProjectGrid } from './ProjectGrid';
import { VirtualizedProjectGrid } from './VirtualizedProjectGrid';
import { useOptimalVirtualization } from '@/hooks/useVirtualization';

interface SmartProjectGridProps {
  projects: Project[];
  showTopBadge?: boolean;
  /** Force virtualization on/off (default: auto-detect based on item count) */
  forceVirtualization?: boolean;
  /** Threshold for enabling virtualization (default: 50) */
  virtualizationThreshold?: number;
}

/**
 * Smart wrapper that automatically chooses between regular and virtualized grid
 * based on the number of projects. Uses virtualization for large lists (>50 items)
 * to maintain performance.
 * 
 * @example
 * ```tsx
 * <SmartProjectGrid projects={projects} showTopBadge={true} />
 * ```
 */
export const SmartProjectGrid: React.FC<SmartProjectGridProps> = ({
  projects,
  showTopBadge = false,
  forceVirtualization,
  virtualizationThreshold = 50,
}) => {
  const { enabled, config } = useOptimalVirtualization(projects.length);
  
  // Use forced setting if provided, otherwise use auto-detection
  const shouldVirtualize = forceVirtualization !== undefined 
    ? forceVirtualization 
    : projects.length > virtualizationThreshold;

  if (shouldVirtualize) {
    return (
      <VirtualizedProjectGrid
        projects={projects}
        showTopBadge={showTopBadge}
        containerHeight={config.containerHeight}
        itemGap={config.itemGap}
      />
    );
  }

  return (
    <ProjectGrid
      projects={projects}
      showTopBadge={showTopBadge}
    />
  );
};

export default SmartProjectGrid;
