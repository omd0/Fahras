import React, { useRef, useCallback, useMemo } from 'react';
import { Grid, useGridRef } from 'react-window';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Project } from '@/types';
import { ProjectGridCard } from './ProjectGridCard';

interface VirtualizedProjectGridProps {
  projects: Project[];
  showTopBadge?: boolean;
  containerHeight?: number;
  itemGap?: number;
}

export const VirtualizedProjectGrid: React.FC<VirtualizedProjectGridProps> = ({
  projects,
  containerHeight = 800,
  itemGap = 32,
}) => {
  const theme = useTheme();
  const [gridRef] = useGridRef();

  // Responsive column count based on screen size
  const isXs = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const columnCount = useMemo(() => {
    if (isXs) return 1;
    if (isMd) return 2;
    return 3;
  }, [isXs, isMd]);

  // Calculate item dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(1200);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const itemWidth = Math.floor((containerWidth - itemGap * (columnCount + 1)) / columnCount);
  const itemHeight = 520; // Fixed height for project cards
  const rowCount = Math.ceil(projects.length / columnCount);

  // Cell renderer component
  const CellComponent = useCallback(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= projects.length) return null;

    const project = projects[index];

    return (
      <Box
        style={{
          ...style,
          left: Number(style.left) + itemGap,
          top: Number(style.top) + itemGap,
          width: itemWidth,
          height: itemHeight - itemGap,
        }}
        sx={{ px: 2, py: 2 }}
      >
        <ProjectGridCard project={project} />
      </Box>
    );
  }, [projects, columnCount, itemWidth, itemHeight, itemGap]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: containerHeight }}>
      <Grid
        gridRef={gridRef}
        columnCount={columnCount}
        columnWidth={itemWidth + itemGap}
        defaultHeight={containerHeight}
        defaultWidth={containerWidth}
        rowCount={rowCount}
        rowHeight={itemHeight}
        overscanCount={2}
        style={{
          overflowX: 'hidden',
        }}
        cellComponent={CellComponent}
        cellProps={{}}
      />
    </Box>
  );
};
