import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface HealthScoreData {
  overall: number;
  activity: number;
  milestones: number;
  timeliness: number;
  engagement: number;
  files: number;
  recommendations?: string[];
}

interface ProjectHealthScoreProps {
  score: HealthScoreData;
}

export const ProjectHealthScore: React.FC<ProjectHealthScoreProps> = ({ score }) => {
  const theme = useTheme();

  const getScoreColor = (value: number): string => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreLabel = (value: number): string => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreIcon = (value: number) => {
    if (value >= 80) return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    if (value >= 60) return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
    return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
  };

  const categories = [
    { label: 'Activity', value: score.activity, max: 25 },
    { label: 'Milestones', value: score.milestones, max: 30 },
    { label: 'Timeliness', value: score.timeliness, max: 20 },
    { label: 'Engagement', value: score.engagement, max: 15 },
    { label: 'Files', value: score.files, max: 10 },
  ];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Project Health Score
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(score.overall)} 0deg ${(score.overall / 100) * 360}deg, ${theme.palette.grey[300]} ${(score.overall / 100) * 360}deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              position: 'relative',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(score.overall) }}>
                {score.overall}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                / 100
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {getScoreIcon(score.overall)}
            <Typography variant="h6" sx={{ fontWeight: 600, color: getScoreColor(score.overall) }}>
              {getScoreLabel(score.overall)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Score Breakdown
          </Typography>
          {categories.map((category) => (
            <Box key={category.label} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {category.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(category.value) }}>
                  {category.value}/{category.max}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(category.value / category.max) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
              backgroundColor: theme.palette.grey[300],
              '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(category.value),
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {score.recommendations && score.recommendations.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
              Recommendations
            </Typography>
            <List dense sx={{ p: 0 }}>
              {score.recommendations.map((rec, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={rec}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                    sx={{ m: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

