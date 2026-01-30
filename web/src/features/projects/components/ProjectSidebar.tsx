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
import { designTokens } from '@/styles/designTokens';

interface ProjectSidebarProps {
  project: Project;
  isProfessor: boolean;
  getRoleColor: (role: string) => any;
  professorCardStyle: any;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  isProfessor,
  getRoleColor,
  professorCardStyle,
}) => {
  return (
    <>
      {/* Program Information */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: `2px solid ${designTokens.colors.primary[500]}`,
          boxShadow: 'none',
          borderRadius: designTokens.radii.card,
          overflow: 'hidden',
          background: 'white',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: designTokens.colors.primary[600],
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: designTokens.colors.secondary[700],
              color: 'white',
              p: 2.5,
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5, color: 'white' }}>
              Program Information
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {project.program ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                    Program
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {project.program.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                    Degree Level
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {project.program.degree_level}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No program information available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Project Members */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: `2px solid ${designTokens.colors.primary[500]}`,
          boxShadow: 'none',
          borderRadius: designTokens.radii.card,
          overflow: 'hidden',
          background: 'white',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: designTokens.colors.primary[600],
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: designTokens.colors.secondary[700],
              color: 'white',
              p: 2.5,
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5, color: 'white' }}>
              Project Members
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
              {project.members?.length || 0} {project.members?.length !== 1 ? 'members' : 'member'}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {project.members && project.members.length > 0 ? (
              <List sx={{ p: 0 }}>
                {(project.members || []).map((member) => (
                  <Paper
                    key={member.id}
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    <ListItem sx={{ p: 2 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: designTokens.colors.status.success,
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {member.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            {member.full_name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={member.pivot.role_in_project}
                            size="small"
                            color={getRoleColor(member.pivot.role_in_project)}
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                            }}
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
                  background: designTokens.colors.surface[50],
                  border: '2px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No members assigned
                </Typography>
              </Paper>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Project Advisors */}
      {project.advisors && project.advisors.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: `2px solid ${designTokens.colors.primary[500]}`,
            boxShadow: 'none',
            borderRadius: designTokens.radii.card,
            overflow: 'hidden',
            background: 'white',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              borderColor: designTokens.colors.primary[600],
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                background: designTokens.colors.status.warning,
                color: 'white',
                p: 2.5,
              }}
            >
              <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                Project Advisors
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {project.advisors.length} {project.advisors.length !== 1 ? 'advisors' : 'advisor'}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <List sx={{ p: 0 }}>
                {(project.advisors || []).map((advisor) => (
                  <Paper
                    key={advisor.id}
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    <ListItem sx={{ p: 2 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: designTokens.colors.status.warning,
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {advisor.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            {advisor.full_name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={advisor.pivot.advisor_role}
                            size="small"
                            color={getRoleColor(advisor.pivot.advisor_role)}
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                            }}
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

      {/* Project Creator */}
      <Card
        elevation={0}
        sx={{
          border: `2px solid ${designTokens.colors.primary[500]}`,
          boxShadow: 'none',
          borderRadius: designTokens.radii.card,
          overflow: 'hidden',
          background: 'white',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: designTokens.colors.primary[600],
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: designTokens.colors.status.error,
              color: 'white',
              p: 2.5,
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
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
                  border: '1px solid',
                  borderColor: 'divider',
                  background: designTokens.colors.surface[50],
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: designTokens.colors.status.error,
                      fontWeight: 600,
                      fontSize: '1.2rem',
                    }}
                  >
                    {project.creator.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                      {project.creator.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {project.creator.email}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No creator information available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
