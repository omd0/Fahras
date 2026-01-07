# Component Library Archive

## Document Purpose

This archive contains the **foundation component library** and **implementation patterns** derived from our platform research (GitHub, Behance, Dribbble, Figma, Notion). These components form the building blocks for implementing the Quick Wins and larger UI/UX improvements.

**Status:** Reference document for implementation phases

---

## Table of Contents

1. [Foundation Components](#foundation-components)
2. [Explore Page Components](#explore-page-components)
3. [Project Detail Components](#project-detail-components)
4. [Comments & Feedback Components](#comments--feedback-components)
5. [Repository/File Components](#repositoryfile-components)
6. [Design Tokens & Theme](#design-tokens--theme)
7. [Implementation Patterns](#implementation-patterns)

---

## Foundation Components

### 1. Breadcrumbs Component

**Inspiration:** GitHub + Notion
**Priority:** Quick Win - Week 1

```typescript
// web/src/components/common/Breadcrumbs.tsx

import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2 }}
      aria-label="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return isLast || !item.path ? (
          <Typography
            key={index}
            color="text.primary"
            variant="body2"
          >
            {item.label}
          </Typography>
        ) : (
          <Link
            key={index}
            component={RouterLink}
            to={item.path}
            color="inherit"
            variant="body2"
            underline="hover"
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}

// Usage Example
<Breadcrumbs
  items={[
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: 'Computer Science', path: '/explore?program=cs' },
    { label: project.title } // No path = last item
  ]}
/>
```

### 2. StatusChip Component

**Inspiration:** Unified across all platforms
**Priority:** Quick Win - Week 1

```typescript
// web/src/components/common/StatusChip.tsx

import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type ProjectStatus = 'approved' | 'pending' | 'hidden';

interface StatusChipProps {
  status: ProjectStatus;
  size?: 'small' | 'medium';
}

const statusConfig = {
  approved: {
    label: 'Approved',
    color: 'success' as const,
    icon: <CheckCircleIcon />,
    bgcolor: '#E8F5E9',
    textColor: '#2E7D32'
  },
  pending: {
    label: 'Pending Review',
    color: 'warning' as const,
    icon: <PendingIcon />,
    bgcolor: '#FFF3E0',
    textColor: '#E65100'
  },
  hidden: {
    label: 'Hidden',
    color: 'default' as const,
    icon: <VisibilityOffIcon />,
    bgcolor: '#F5F5F5',
    textColor: '#616161'
  }
};

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{
        bgcolor: config.bgcolor,
        color: config.textColor,
        '& .MuiChip-icon': {
          color: config.textColor
        }
      }}
    />
  );
}
```

### 3. VisibilityChip Component

**Inspiration:** GitHub (Public/Private badges)
**Priority:** Quick Win - Week 1

```typescript
// web/src/components/common/VisibilityChip.tsx

import { Chip } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';

type Visibility = 'public' | 'private';

interface VisibilityChipProps {
  visibility: Visibility;
  size?: 'small' | 'medium';
}

export function VisibilityChip({ visibility, size = 'small' }: VisibilityChipProps) {
  const config = {
    public: {
      label: 'Public',
      icon: <PublicIcon />,
      color: 'primary' as const
    },
    private: {
      label: 'Private',
      icon: <LockIcon />,
      color: 'default' as const
    }
  };

  const { label, icon, color } = config[visibility];

  return (
    <Chip
      label={label}
      icon={icon}
      color={color}
      size={size}
      variant="outlined"
    />
  );
}
```

### 4. StatRow Component

**Inspiration:** Figma sidebar metrics
**Priority:** Quick Win - Week 1

```typescript
// web/src/components/common/StatRow.tsx

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface StatRowProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1
      }}
    >
      <Box
        sx={{
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium">
        {value}
      </Typography>
    </Box>
  );
}

// Usage
<StatRow icon={<VisibilityIcon />} label="Views" value={234} />
<StatRow icon={<FileIcon />} label="Files" value={8} />
<StatRow icon={<UpdateIcon />} label="Updated" value="2 days ago" />
```

---

## Explore Page Components

### 1. FilterSidebar Component

**Inspiration:** GitHub + Figma persistent filters
**Priority:** Week 1-2

```typescript
// web/src/components/explore/FilterSidebar.tsx

import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FilterGroup } from './FilterGroup';

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  filters: FilterGroupConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (groupId: string, value: any) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  open,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onClearAll
}: FilterSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const hasActiveFilters = Object.values(activeFilters).some(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          p: 2,
          borderRight: 1,
          borderColor: 'divider',
          // On desktop, account for AppBar
          top: { xs: 0, md: 64 },
          height: { xs: '100%', md: 'calc(100% - 64px)' }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Box>
          {hasActiveFilters && (
            <Button size="small" onClick={onClearAll} sx={{ mr: 1 }}>
              Clear all
            </Button>
          )}
          {isMobile && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Filter Groups */}
      {filters.map(group => (
        <FilterGroup
          key={group.id}
          config={group}
          value={activeFilters[group.id]}
          onChange={value => onFilterChange(group.id, value)}
        />
      ))}
    </Drawer>
  );
}
```

### 2. FilterGroup Component

**Inspiration:** Figma collapsible sections
**Priority:** Week 1-2

```typescript
// web/src/components/explore/FilterGroup.tsx

import {
  Box,
  Button,
  Collapse,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

type FilterType = 'checkbox' | 'select' | 'toggle';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FilterGroupConfig {
  id: string;
  title: string;
  type: FilterType;
  defaultExpanded?: boolean;
  options: FilterOption[];
}

interface FilterGroupProps {
  config: FilterGroupConfig;
  value: any;
  onChange: (value: any) => void;
}

export function FilterGroup({ config, value, onChange }: FilterGroupProps) {
  const [expanded, setExpanded] = useState(config.defaultExpanded ?? true);

  const renderFilter = () => {
    switch (config.type) {
      case 'checkbox':
        return (
          <FormGroup>
            {config.options.map(option => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onChange={e => {
                      const newValue = e.target.checked
                        ? [...(value || []), option.value]
                        : (value || []).filter((v: string) => v !== option.value);
                      onChange(newValue);
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option.label}</span>
                    {option.count && (
                      <Typography variant="caption" color="text.secondary">
                        {option.count}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        );

      case 'select':
        return (
          <Select
            fullWidth
            size="small"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {config.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );

      case 'toggle':
        return (
          <ToggleButtonGroup
            orientation="vertical"
            value={value || ''}
            exclusive
            onChange={(_, newValue) => onChange(newValue)}
            fullWidth
          >
            {config.options.map(option => (
              <ToggleButton key={option.value} value={option.value}>
                {option.icon && <Box sx={{ mr: 1 }}>{option.icon}</Box>}
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        fullWidth
        onClick={() => setExpanded(!expanded)}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{
          justifyContent: 'space-between',
          mb: 1,
          color: 'text.primary',
          fontWeight: 'medium'
        }}
      >
        {config.title}
      </Button>
      <Collapse in={expanded}>
        <Box sx={{ pl: 1 }}>
          {renderFilter()}
        </Box>
      </Collapse>
    </Box>
  );
}
```

### 3. ActiveFiltersChips Component

**Inspiration:** Figma active filters
**Priority:** Quick Win - Week 1

```typescript
// web/src/components/explore/ActiveFiltersChips.tsx

import { Box, Chip, Button, Typography } from '@mui/material';

interface ActiveFilter {
  id: string;
  groupLabel: string;
  optionLabel: string;
}

interface ActiveFiltersChipsProps {
  filters: ActiveFilter[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersChips({
  filters,
  onRemove,
  onClearAll
}: ActiveFiltersChipsProps) {
  if (filters.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        mt: 2
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Active filters:
      </Typography>

      {filters.map(filter => (
        <Chip
          key={filter.id}
          label={`${filter.groupLabel}: ${filter.optionLabel}`}
          onDelete={() => onRemove(filter.id)}
          size="small"
          sx={{
            bgcolor: 'primary.50',
            '& .MuiChip-deleteIcon': {
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark'
              }
            }
          }}
        />
      ))}

      {filters.length > 1 && (
        <Button size="small" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </Box>
  );
}
```

### 4. ProjectCard Component

**Inspiration:** Dribbble uniform cards
**Priority:** Week 1

```typescript
// web/src/components/explore/ProjectCard.tsx

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  IconButton,
  Box,
  Avatar
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { projectRoutes } from '@/utils/projectRoutes';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onBookmark?: (projectId: string) => void;
  isBookmarked?: boolean;
}

export function ProjectCard({
  project,
  onBookmark,
  isBookmarked = false
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(projectRoutes.detail(project.slug));
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onBookmark?.(project.id);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={handleClick}
    >
      {/* Cover Image */}
      <CardMedia
        component="img"
        height="200"
        image={project.cover_image || '/placeholder-project.jpg'}
        alt={project.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {project.title}
        </Typography>

        {/* Abstract Preview */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2
          }}
        >
          {project.abstract}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {(project.tags || []).slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
      </CardContent>

      {/* Footer */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        {/* Author */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={project.creator?.avatar}
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="caption" color="text.secondary">
            {project.creator?.name}
          </Typography>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {project.views || 0}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={handleBookmark}
            color={isBookmarked ? 'primary' : 'default'}
          >
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}
```

---

## Project Detail Components

### 1. ProjectSidebar Component

**Inspiration:** Figma sticky sidebar
**Priority:** Week 2

```typescript
// web/src/components/project/ProjectSidebar.tsx

import { Box, Card, CardContent, Stack, Button, Divider } from '@mui/material';
import { TeamMemberList } from './TeamMemberList';
import { ProjectStats } from './ProjectStats';
import { RelatedProjects } from './RelatedProjects';

interface ProjectSidebarProps {
  project: Project;
  onBookmark: () => void;
  onFollow: () => void;
  isBookmarked: boolean;
  isFollowing: boolean;
}

export function ProjectSidebar({
  project,
  onBookmark,
  onFollow,
  isBookmarked,
  isFollowing
}: ProjectSidebarProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 80, // Below AppBar
        maxHeight: 'calc(100vh - 96px)',
        overflowY: 'auto'
      }}
    >
      {/* Team & Advisor */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TeamMemberList
            members={project.team_members}
            advisor={project.advisor}
          />
        </CardContent>
      </Card>

      {/* Primary Actions */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<BookmarkIcon />}
          onClick={onBookmark}
          fullWidth
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark Project'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<NotificationsIcon />}
          onClick={onFollow}
          fullWidth
        >
          {isFollowing ? 'Following' : 'Follow Updates'}
        </Button>
      </Stack>

      {/* Stats */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <ProjectStats project={project} />
        </CardContent>
      </Card>

      {/* Related Projects */}
      <Card>
        <CardContent>
          <RelatedProjects project={project} />
        </CardContent>
      </Card>
    </Box>
  );
}
```

### 2. TeamMemberList Component

**Inspiration:** Figma team display
**Priority:** Week 2

```typescript
// web/src/components/project/TeamMemberList.tsx

import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface TeamMemberListProps {
  members: TeamMember[];
  advisor?: TeamMember;
}

export function TeamMemberList({ members, advisor }: TeamMemberListProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team
      </Typography>

      <Stack spacing={1.5}>
        {(members || []).map(member => (
          <Box
            key={member.id}
            component={Link}
            to={`/users/${member.id}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                '& .MuiTypography-root': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Avatar src={member.avatar} sx={{ width: 40, height: 40 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {member.name}
              </Typography>
              {member.role && (
                <Typography variant="caption" color="text.secondary">
                  {member.role}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>

      {advisor && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Advisor
          </Typography>
          <Box
            component={Link}
            to={`/users/${advisor.id}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Avatar src={advisor.avatar} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {advisor.name}
              </Typography>
              <Chip label="Advisor" size="small" color="primary" />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
```

---

## Comments & Feedback Components

### 1. CommentThread Component

**Inspiration:** GitHub comments
**Priority:** Week 2

```typescript
// web/src/components/comments/CommentThread.tsx

import { Box, Stack, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { CommentInput } from './CommentInput';
import { CommentCard } from './CommentCard';
import { apiService } from '@/services/api';

interface CommentThreadProps {
  projectId: string;
}

export function CommentThread({ projectId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [projectId]);

  const loadComments = async () => {
    try {
      const response = await apiService.getProjectComments(projectId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (text: string) => {
    try {
      await apiService.createComment(projectId, { text });
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>

      <Stack spacing={2}>
        {/* Comment Input */}
        <CommentInput onSubmit={handleSubmit} />

        {/* Comment List */}
        {loading ? (
          <Typography>Loading comments...</Typography>
        ) : comments.length === 0 ? (
          <Typography color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={handleSubmit}
              onEdit={loadComments}
              onDelete={loadComments}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
```

---

## Design Tokens & Theme

### Platform-Inspired Tokens

**Inspiration:** All platforms analyzed
**Priority:** Foundation - Week 1

```typescript
// web/src/theme/platformTokens.ts

export const platformTokens = {
  // GitHub-inspired spacing (8px scale)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },

  // Dribbble-inspired card elevation
  elevation: {
    card: '0 1px 3px rgba(0,0,0,0.12)',
    cardHover: '0 4px 12px rgba(0,0,0,0.15)',
    sticky: '0 -2px 8px rgba(0,0,0,0.08)',
    modal: '0 8px 24px rgba(0,0,0,0.15)'
  },

  // Figma-inspired CTA prominence
  cta: {
    primary: {
      height: 48,
      fontSize: 16,
      fontWeight: 600
    },
    secondary: {
      height: 40,
      fontSize: 14,
      fontWeight: 500
    }
  },

  // GitHub-inspired layout dimensions
  layout: {
    sidebarWidth: 280,
    maxContentWidth: 1280,
    contentPadding: { xs: 16, sm: 24, md: 32 },
    stickyTopOffset: 80 // AppBar height + padding
  },

  // Unified status colors
  status: {
    approved: {
      bg: '#E8F5E9',
      text: '#2E7D32',
      border: '#66BB6A'
    },
    pending: {
      bg: '#FFF3E0',
      text: '#E65100',
      border: '#FFA726'
    },
    hidden: {
      bg: '#F5F5F5',
      text: '#616161',
      border: '#BDBDBD'
    }
  },

  // Behance-inspired hover transitions
  transitions: {
    cardHover: 'all 0.2s ease-in-out',
    pageTransition: 'all 0.3s ease-in-out',
    modal: 'all 0.25s ease'
  },

  // Notion-inspired typography
  typography: {
    pageTitle: {
      fontSize: { xs: 28, md: 36 },
      fontWeight: 700,
      lineHeight: 1.2
    },
    sectionTitle: {
      fontSize: { xs: 20, md: 24 },
      fontWeight: 600,
      lineHeight: 1.3
    },
    body: {
      fontSize: 16,
      lineHeight: 1.6
    },
    caption: {
      fontSize: 13,
      lineHeight: 1.4
    }
  }
};
```

---

## Implementation Patterns

### 1. Lazy Loading Components

**Pattern:** Code splitting for performance
**Priority:** Week 3

```typescript
// web/src/pages/ProjectDetailPage.tsx

import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load heavy components
const SoftwareLayout = lazy(() => import('@/layouts/projectLayouts/SoftwareLayout'));
const DesignLayout = lazy(() => import('@/layouts/projectLayouts/DesignLayout'));
// ... other layouts

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

export default function ProjectDetailPage() {
  // ...

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LayoutComponent project={project} />
    </Suspense>
  );
}
```

### 2. Optimistic UI Updates

**Pattern:** Instant feedback for user actions
**Priority:** Week 2

```typescript
// Example: Bookmark action

const [isBookmarked, setIsBookmarked] = useState(false);

const handleBookmark = async () => {
  // Optimistic update
  setIsBookmarked(!isBookmarked);

  try {
    await apiService.toggleBookmark(projectId);
  } catch (error) {
    // Rollback on error
    setIsBookmarked(!isBookmarked);
    showErrorToast('Failed to bookmark project');
  }
};
```

### 3. Intersection Observer for Infinite Scroll

**Pattern:** Load more results on scroll
**Priority:** Week 2

```typescript
// web/src/hooks/useInfiniteScroll.ts

import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  loading: boolean
) {
  const observerRef = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, callback]
  );

  return lastElementRef;
}

// Usage
const lastProjectRef = useInfiniteScroll(
  loadMoreProjects,
  hasMore,
  loading
);

<ProjectCard ref={lastProjectRef} project={lastProject} />
```

---

## Component Dependency Graph

```
Foundation Components
├── Breadcrumbs ──────────────► Used by all pages
├── StatusChip ───────────────► ProjectCard, ProjectDetail
├── VisibilityChip ───────────► ProjectCard, ProjectDetail
└── StatRow ──────────────────► ProjectSidebar

Explore Page Components
├── FilterSidebar ────────────► ExplorePage
│   └── FilterGroup ──────────► FilterSidebar
├── ActiveFiltersChips ───────► ExplorePage
└── ProjectCard ──────────────► ExplorePage, Dashboard

Project Detail Components
├── ProjectSidebar ───────────► ProjectDetailPage
│   ├── TeamMemberList ───────► ProjectSidebar
│   ├── ProjectStats ─────────► ProjectSidebar
│   └── RelatedProjects ──────► ProjectSidebar
└── ProjectHeader ────────────► ProjectDetailPage

Comments Components
├── CommentThread ────────────► ProjectDetailPage
│   ├── CommentInput ─────────► CommentThread
│   └── CommentCard ──────────► CommentThread
└── ReactionButton ───────────► CommentCard
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// web/src/components/common/__tests__/StatusChip.test.tsx

import { render, screen } from '@testing-library/react';
import { StatusChip } from '../StatusChip';

describe('StatusChip', () => {
  it('renders approved status correctly', () => {
    render(<StatusChip status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('applies correct color for pending status', () => {
    const { container } = render(<StatusChip status="pending" />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toHaveStyle({ backgroundColor: '#FFF3E0' });
  });
});
```

### Component Storybook

```typescript
// web/src/components/common/StatusChip.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { StatusChip } from './StatusChip';

const meta: Meta<typeof StatusChip> = {
  title: 'Common/StatusChip',
  component: StatusChip,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof StatusChip>;

export const Approved: Story = {
  args: {
    status: 'approved'
  }
};

export const Pending: Story = {
  args: {
    status: 'pending'
  }
};

export const Hidden: Story = {
  args: {
    status: 'hidden'
  }
};
```

---

## Conclusion

This component library provides the foundation for implementing all UI/UX improvements identified in our platform research. Each component is:

- **Platform-tested:** Based on proven patterns from GitHub, Behance, Dribbble, Figma, and Notion
- **Accessible:** Built with ARIA labels and keyboard navigation
- **Responsive:** Works across mobile, tablet, and desktop
- **Performant:** Optimized with lazy loading and code splitting
- **Type-safe:** Full TypeScript definitions

Use this archive as a reference during implementation phases.
