import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { SmartProjectGrid } from '@/components/explore/SmartProjectGrid';
import VirtualizedProjectTable from '@/components/shared/VirtualizedProjectTable';
import { Project } from '@/types';
import { useVirtualizationPerformance } from '@/hooks/useVirtualization';

/**
 * Generate mock project data for testing virtualization
 */
const generateMockProjects = (count: number): Project[] => {
  const programs = ['Computer Science', 'Software Engineering', 'Data Science', 'Cybersecurity'];
  const departments = ['IT', 'Engineering', 'Business', 'Design'];
  const keywords = ['AI', 'Web', 'Mobile', 'IoT', 'Cloud', 'Security', 'Data'];
  const semesters = ['fall', 'spring', 'summer'];
  const years = ['2023/2024', '2024/2025', '2025/2026'];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    slug: `project-${index + 1}`,
    title: `Project ${index + 1}: ${programs[index % programs.length]} Innovation`,
    abstract: `This is a groundbreaking project exploring ${keywords[index % keywords.length]} technology. It demonstrates cutting-edge solutions and practical applications in modern software development. The project aims to solve real-world problems using innovative approaches.`,
    status: 'approved',
    approval_status: 'approved',
    visibility: 'public' as const,
    academic_year: years[index % years.length],
    semester: semesters[index % semesters.length],
    keywords: [
      keywords[index % keywords.length],
      keywords[(index + 1) % keywords.length],
      keywords[(index + 2) % keywords.length],
    ],
    program: {
      id: (index % programs.length) + 1,
      name: programs[index % programs.length],
    },
    department: {
      id: (index % departments.length) + 1,
      name: departments[index % departments.length],
    },
    creator: {
      id: index + 1,
      full_name: `Student ${index + 1}`,
      email: `student${index + 1}@example.com`,
    },
    files: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      id: i + 1,
      name: `file${i + 1}.pdf`,
      path: `/files/file${i + 1}.pdf`,
    })),
    average_rating: 3 + Math.random() * 2, // 3.0 to 5.0
    rating_count: Math.floor(Math.random() * 50) + 1,
    created_at: new Date(2024, index % 12, (index % 28) + 1).toISOString(),
    updated_at: new Date(2024, index % 12, (index % 28) + 1).toISOString(),
  })) as unknown as Project[];
};

export const VirtualizationTestPage: React.FC = () => {
  const [projectCount, setProjectCount] = useState(1000);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [forceVirtualization, setForceVirtualization] = useState<boolean | undefined>(undefined);

  const projects = useMemo(() => generateMockProjects(projectCount), [projectCount]);
  
  const metrics = useVirtualizationPerformance(
    forceVirtualization !== false && projectCount > 50,
    projectCount
  );

  const handleCountChange = (delta: number) => {
    setProjectCount(prev => Math.max(10, Math.min(5000, prev + delta)));
  };

  const handleToggleVirtualization = () => {
    setForceVirtualization(prev => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
  };

  const getVirtualizationStatus = () => {
    if (forceVirtualization === true) return 'Forced ON';
    if (forceVirtualization === false) return 'Forced OFF';
    return 'Auto (based on count)';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" fontWeight="bold">
              Virtual Scrolling Performance Test
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Test virtualization with large datasets to see performance improvements
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Controls */}
        <Stack spacing={3}>
          {/* Project Count Control */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Dataset Size
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => handleCountChange(-100)}
              >
                -100
              </Button>
              <Button
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => handleCountChange(-10)}
              >
                -10
              </Button>
              <TextField
                value={projectCount}
                onChange={(e) => setProjectCount(Number(e.target.value) || 10)}
                type="number"
                inputProps={{ min: 10, max: 5000 }}
                sx={{ width: 120 }}
              />
              <Button
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={() => handleCountChange(10)}
              >
                +10
              </Button>
              <Button
                variant="outlined"
                endIcon={<AddIcon />}
                onClick={() => handleCountChange(100)}
              >
                +100
              </Button>
            </Stack>
          </Box>

          {/* View Mode Control */}
          <Box>
            <Typography variant="h6" gutterBottom>
              View Mode
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon sx={{ mr: 1 }} />
                Grid View
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <ListViewIcon sx={{ mr: 1 }} />
                Table View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Virtualization Control */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Virtualization Mode
            </Typography>
            <Button
              variant="outlined"
              onClick={handleToggleVirtualization}
              sx={{ minWidth: 200 }}
            >
              {getVirtualizationStatus()}
            </Button>
          </Box>

          {/* Performance Metrics */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                label={`Render Time: ${metrics.renderTime.toFixed(2)}ms`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Items Rendered: ${metrics.itemsRendered} / ${metrics.itemsTotal}`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={`Memory Saved: ~${((1 - metrics.itemsRendered / metrics.itemsTotal) * 100).toFixed(1)}%`}
                color="success"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Performance Tip:</strong> With {projectCount} projects, virtualization will {' '}
            {projectCount > 50 ? (
              <strong>significantly improve performance</strong>
            ) : (
              'have minimal impact (dataset is small)'
            )}
            . Try increasing the count to 1000+ to see the difference!
          </Typography>
        </Alert>
      </Paper>

      {/* Projects Display */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {viewMode === 'grid' ? 'Grid View' : 'Table View'} - {projectCount} Projects
        </Typography>

        {viewMode === 'grid' ? (
          <SmartProjectGrid
            projects={projects}
            forceVirtualization={forceVirtualization}
            virtualizationThreshold={50}
          />
        ) : (
          <VirtualizedProjectTable
            projects={projects}
            showProgram={true}
            showStatus={true}
            showCreator={true}
            showActions={true}
            onView={(project) => console.log('View:', project)}
            onEdit={(project) => console.log('Edit:', project)}
            onDelete={(project) => console.log('Delete:', project)}
            containerHeight={800}
          />
        )}
      </Paper>

      {/* Info Section */}
      <Paper sx={{ p: 4, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          About Virtual Scrolling
        </Typography>
        <Typography variant="body1" paragraph>
          Virtual scrolling (also called windowing) is a technique that renders only the visible items in a list,
          dramatically improving performance with large datasets. Instead of rendering all {projectCount} projects,
          only ~20-30 visible items are actually in the DOM at any time.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Benefits:</strong>
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              <strong>Faster initial render:</strong> Only visible items are rendered
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Lower memory usage:</strong> Fewer DOM nodes to manage
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Smooth scrolling:</strong> Maintains 60fps even with thousands of items
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Better UX:</strong> Instant load times regardless of dataset size
            </Typography>
          </li>
        </ul>
        <Alert severity="success" sx={{ mt: 2 }}>
          The SmartProjectGrid component automatically enables virtualization when there are more than 50 projects,
          providing optimal performance without any configuration needed!
        </Alert>
      </Paper>
    </Container>
  );
};

export default VirtualizationTestPage;
