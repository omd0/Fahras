import React, { useRef, useCallback, useMemo } from 'react';
import { Grid, useGridRef } from 'react-window';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Project } from '@/types';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Rating,
  Stack,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Computer as ComputerIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getProjectDetailUrl } from '@/utils/projectRoutes';
import { guestColors, backgroundPatterns } from '@/styles/theme/guestTheme';
import { useLanguage } from '@/providers/LanguageContext';
import { BookmarkButton } from '@/features/bookmarks/components/BookmarkButton';

const COLORS = guestColors;

interface VirtualizedProjectGridProps {
  projects: Project[];
  showTopBadge?: boolean;
  containerHeight?: number;
  itemGap?: number;
}

const getProjectIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('web') || lowerTitle.includes('app') || lowerTitle.includes('software')) {
    return <CodeIcon />;
  } else if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
    return <DesignIcon />;
  } else if (lowerTitle.includes('business') || lowerTitle.includes('management') || lowerTitle.includes('marketing')) {
    return <BusinessIcon />;
  } else if (lowerTitle.includes('engineering') || lowerTitle.includes('mechanical') || lowerTitle.includes('electrical')) {
    return <EngineeringIcon />;
  } else if (lowerTitle.includes('computer') || lowerTitle.includes('ai') || lowerTitle.includes('machine learning')) {
    return <ComputerIcon />;
  } else {
    return <ScienceIcon />;
  }
};

interface ProjectCardProps {
  project: Project;
  showTopBadge: boolean;
  style: React.CSSProperties;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showTopBadge, style }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box style={style} sx={{ px: 2, py: 2 }}>
      <Card
        sx={{
          ...backgroundPatterns.card,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          border: showTopBadge ? `2px solid ${alpha(COLORS.lightSkyBlue, 0.2)}` : undefined,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(COLORS.almostBlack, 0.15)}`,
            borderColor: COLORS.almostBlack,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: showTopBadge ? guestColors.secondaryGradient : guestColors.primaryGradient,
            opacity: showTopBadge ? 1 : 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
        onClick={() => navigate(getProjectDetailUrl(project))}
      >
        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Project Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
              {/* Title and Year Tag */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: COLORS.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '1.2rem',
                    lineHeight: 1.3,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {project.title}
                </Typography>
                <Tooltip title={`Created: ${new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
                  <Chip
                    label={project.academic_year}
                    size="small"
                    sx={{
                      background: guestColors.secondaryGradient,
                      color: COLORS.textPrimary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              </Stack>
            </Box>
            {/* Icon */}
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: guestColors.primaryGradient,
                flexShrink: 0,
              }}
            >
              {getProjectIcon(project.title)}
            </Avatar>
          </Stack>

          {/* Project Abstract */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: COLORS.textSecondary,
              mb: 3, 
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.6,
              fontSize: '1rem',
            }}
          >
            {project.abstract}
          </Typography>

          {/* Keywords */}
          {project.keywords && project.keywords.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {project.keywords.slice(0, 3).map((keyword, idx) => (
                  <Chip
                    key={idx}
                    label={keyword}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 28,
                      borderColor: alpha(COLORS.lightSkyBlue, 0.35),
                      color: COLORS.deepPurple,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.lightSkyBlue, 0.1),
                        borderColor: COLORS.deepPurple,
                      },
                    }}
                  />
                ))}
                {project.keywords.length > 3 && (
                  <Chip
                    label={`+${project.keywords.length - 3} ${t('more')}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 28,
                      borderColor: alpha(COLORS.lightSkyBlue, 0.35),
                      color: COLORS.deepPurple,
                      fontWeight: 500,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Rating */}
          {project.average_rating && project.rating_count && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Rating
                  value={project.average_rating}
                  readOnly
                  precision={0.1}
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: COLORS.deepPurple,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  {project.average_rating.toFixed(1)} ({project.rating_count} {t('ratings')})
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Metadata Row */}
          <Box 
            sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {/* Left: Author and Files */}
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.textSecondary, 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.creator?.full_name || 'Unknown'}
                </Typography>
              </Stack>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: COLORS.textSecondary,
                  mx: 0.5,
                }}
              >
                ·
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AttachFileIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  {project.files?.length || 0} {t('files')}
                </Typography>
              </Stack>
            </Stack>

            {/* Right: Action Icons */}
            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Tooltip title={t('View Comments')}>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: alpha(COLORS.textSecondary, 0.7),
                    '&:hover': {
                      color: COLORS.textSecondary,
                      backgroundColor: alpha(COLORS.textSecondary, 0.08),
                    },
                  }}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                  }}
                >
                  <CommentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <BookmarkButton 
                projectId={project.id} 
                size="small" 
                sx={{ 
                  color: alpha(COLORS.textSecondary, 0.7),
                  '&:hover': {
                    color: COLORS.textSecondary,
                    backgroundColor: alpha(COLORS.textSecondary, 0.08),
                  },
                }}
              />
              <Tooltip title={t('Share Project')}>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: alpha(COLORS.textSecondary, 0.7),
                    '&:hover': {
                      color: COLORS.textSecondary,
                      backgroundColor: alpha(COLORS.textSecondary, 0.08),
                    },
                  }}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Action Icon - View Project */}
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
            <Tooltip 
              title={t('View Project')} 
              placement="bottom"
              arrow
              PopperProps={{
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ],
              }}
            >
              <IconButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                }}
                sx={{
                  background: guestColors.primaryGradient,
                  color: COLORS.white,
                  width: 48,
                  height: 48,
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(COLORS.deepPurple, 0.9)} 0%, ${alpha(COLORS.lightSkyBlue, 0.9)} 100%)`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export const VirtualizedProjectGrid: React.FC<VirtualizedProjectGridProps> = ({ 
  projects, 
  showTopBadge = false,
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

  // Scroll to item function
  const scrollToItem = useCallback((index: number) => {
    if (gridRef.current) {
      const rowIndex = Math.floor(index / columnCount);
      gridRef.current.scrollToCell({ columnIndex: 0, rowIndex });
    }
  }, [columnCount, gridRef]);

  // Cell renderer component - now using the new cellComponent prop
  const CellComponent = useCallback(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= projects.length) return null;

    const project = projects[index];
    
    return (
      <ProjectCard
        project={project}
        showTopBadge={showTopBadge}
        style={{
          ...style,
          left: Number(style.left) + itemGap,
          top: Number(style.top) + itemGap,
          width: itemWidth,
          height: itemHeight - itemGap,
        }}
      />
    );
  }, [projects, columnCount, showTopBadge, itemWidth, itemHeight, itemGap]);

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
