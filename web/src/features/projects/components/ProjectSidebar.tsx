import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
} from '@mui/material';
import { Project } from '@/types';
import { colorPalette } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';

interface ProjectSidebarProps {
  project: Project;
  isProfessor?: boolean;
}

const getRoleChipColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
  const lower = role.toLowerCase();
  if (lower.includes('lead') || lower.includes('manager')) return 'primary';
  if (lower.includes('supervisor') || lower.includes('advisor')) return 'warning';
  if (lower.includes('developer') || lower.includes('engineer')) return 'info';
  return 'secondary';
};

const sidebarCardSx = {
  mb: 3,
  border: `1px solid ${colorPalette.border.default}`,
  boxShadow: designTokens.shadows.elevation1,
  borderRadius: designTokens.radii.card,
  overflow: 'hidden',
  background: colorPalette.surface.paper,
  transition: designTokens.transitions.hover,
  '&:hover': {
    boxShadow: designTokens.shadows.elevation2,
    borderColor: colorPalette.primary.main,
  },
} as const;

const sidebarHeaderSx = (bgColor: string) => ({
  background: bgColor,
  color: colorPalette.common.white,
  p: 2.5,
});

const memberPaperSx = {
  mb: 1.5,
  borderRadius: 2,
  border: `1px solid ${colorPalette.border.default}`,
  overflow: 'hidden',
  transition: designTokens.transitions.hover,
  '&:hover': {
    boxShadow: designTokens.shadows.elevation2,
    transform: 'translateY(-1px)',
  },
};

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={sidebarCardSx}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={sidebarHeaderSx(`linear-gradient(135deg, ${colorPalette.secondary.dark} 0%, ${colorPalette.secondary.main} 100%)`)}>
            <Typography variant="h6" fontWeight="700" sx={{ color: colorPalette.common.white }}>
              Program Information
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {project.program ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    Program
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                    {project.program.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.text.secondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    Degree Level
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colorPalette.text.primary }}>
                    {project.program.degree_level}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: colorPalette.text.secondary }}>
                No program information available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={sidebarCardSx}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={sidebarHeaderSx(`linear-gradient(135deg, ${colorPalette.secondary.dark} 0%, ${colorPalette.secondary.main} 100%)`)}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.common.white }}>
              Project Members
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: colorPalette.common.white }}>
              {project.members?.length || 0} {(project.members?.length || 0) !== 1 ? 'members' : 'member'}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {project.members && project.members.length > 0 ? (
              <List sx={{ p: 0 }}>
                {(project.members || []).map((member: any) => (
                  <Paper key={member.id} elevation={0} sx={memberPaperSx}>
                    <ListItem sx={{ p: 2 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.main} 100%)`,
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {member.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600" sx={{ color: colorPalette.text.primary }}>
                            {member.full_name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={member.pivot.role_in_project}
                            size="small"
                            color={getRoleChipColor(member.pivot.role_in_project)}
                            variant="filled"
                            sx={{ fontWeight: 600, mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  background: colorPalette.surface.elevated,
                  border: `2px dashed ${colorPalette.border.default}`,
                }}
              >
                <Typography variant="body2" sx={{ color: colorPalette.text.secondary }}>
                  No members assigned
                </Typography>
              </Paper>
            )}
          </Box>
        </CardContent>
      </Card>

      {project.advisors && project.advisors.length > 0 && (
        <Card elevation={0} sx={sidebarCardSx}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={sidebarHeaderSx(`linear-gradient(135deg, ${colorPalette.warning.dark} 0%, ${colorPalette.warning.main} 100%)`)}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5, color: colorPalette.common.white }}>
                Project Advisors
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: colorPalette.common.white }}>
                {project.advisors.length} {project.advisors.length !== 1 ? 'advisors' : 'advisor'}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <List sx={{ p: 0 }}>
                {(project.advisors || []).map((advisor: any) => (
                  <Paper key={advisor.id} elevation={0} sx={memberPaperSx}>
                    <ListItem sx={{ p: 2 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: `linear-gradient(135deg, ${colorPalette.warning.dark} 0%, ${colorPalette.warning.main} 100%)`,
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {advisor.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600" sx={{ color: colorPalette.text.primary }}>
                            {advisor.full_name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={advisor.pivot.advisor_role}
                            size="small"
                            color={getRoleChipColor(advisor.pivot.advisor_role)}
                            variant="filled"
                            sx={{ fontWeight: 600, mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card elevation={0} sx={{ ...sidebarCardSx, mb: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={sidebarHeaderSx(`linear-gradient(135deg, ${colorPalette.teal.dark} 0%, ${colorPalette.teal.main} 100%)`)}>
            <Typography variant="h6" fontWeight="700" sx={{ color: colorPalette.common.white }}>
              Project Creator
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {project.creator ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${colorPalette.border.default}`,
                  background: colorPalette.surface.elevated,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `linear-gradient(135deg, ${colorPalette.teal.dark} 0%, ${colorPalette.teal.main} 100%)`,
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    {project.creator.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: colorPalette.text.primary }}>
                      {project.creator.full_name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: colorPalette.text.secondary }}>
                      {project.creator.email}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: colorPalette.text.secondary }}>
                No creator information available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
