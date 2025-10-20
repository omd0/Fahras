import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Fade,
  Slide,
  Avatar,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon2,
  Create as CreateIcon,
  Group as GroupIcon,
  Tag as TagIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CreateProjectData, Program, User } from '../types';
import { apiService } from '../services/api';
import { getDashboardTheme } from '../config/dashboardThemes';

export const CreateProjectPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectData>({
    program_id: 0,
    title: '',
    abstract: '',
    keywords: [],
    academic_year: '',
    semester: 'fall',
    members: [],
    advisors: [],
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newMember, setNewMember] = useState({ user_id: 0, role: 'MEMBER' as 'LEAD' | 'MEMBER', customName: undefined as string | undefined });
  const [newAdvisor, setNewAdvisor] = useState({ user_id: 0, role: 'MAIN' as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER', customName: undefined as string | undefined });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const dashboardTheme = getDashboardTheme(user?.roles);

  // Redirect reviewers and admins away from this page
  useEffect(() => {
    if (user?.roles?.some(role => role.name === 'reviewer' || role.name === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchPrograms();
    fetchUsers();
  }, []);

  const fetchPrograms = async () => {
    try {
      // For now, use hardcoded programs since the API endpoint is not working
      setPrograms([
        { id: 1, name: 'Computer Science', department_id: 1, degree_level: 'bachelor', created_at: '', updated_at: '' },
        { id: 2, name: 'Information Technology', department_id: 1, degree_level: 'bachelor', created_at: '', updated_at: '' },
        { id: 3, name: 'Software Engineering', department_id: 1, degree_level: 'bachelor', created_at: '', updated_at: '' },
      ]);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // For now, we'll use a mock list of users
      // In a real app, you'd have an API endpoint to get users
      setUsers([
        { id: 1, full_name: 'Admin User', email: 'admin@fahras.edu', status: 'active', roles: [], created_at: '', updated_at: '' },
        { id: 2, full_name: 'Dr. Sarah Johnson', email: 'sarah.johnson@fahras.edu', status: 'active', roles: [], created_at: '', updated_at: '' },
        { id: 3, full_name: 'Ahmed Almansouri', email: 'ahmed.almansouri@student.fahras.edu', status: 'active', roles: [], created_at: '', updated_at: '' },
      ]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const handleAddMember = () => {
    if (newMember.user_id > 0 || newMember.customName) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember }]
      }));
      setNewMember({ user_id: 0, role: 'MEMBER', customName: undefined });
    }
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleAddAdvisor = () => {
    if (newAdvisor.user_id > 0 || newAdvisor.customName) {
      setFormData(prev => ({
        ...prev,
        advisors: [...(prev.advisors || []), { ...newAdvisor }]
      }));
      setNewAdvisor({ user_id: 0, role: 'MAIN', customName: undefined });
    }
  };

  const handleRemoveAdvisor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      advisors: prev.advisors?.filter((_, i) => i !== index) || []
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Add current user as a member if not already added
      const currentUserMember = {
        user_id: user?.id || 0,
        role: 'LEAD' as 'LEAD' | 'MEMBER'
      };

      const membersToSubmit = formData.members.length > 0 
        ? formData.members 
        : [currentUserMember];

      const projectData = {
        ...formData,
        members: membersToSubmit
      };

      console.log('Creating project...', projectData);
      
      // Create the project first
      const createdProject = await apiService.createProject(projectData);
      console.log('Project created:', createdProject);

      // If files are selected, upload them individually
      if (selectedFiles.length > 0 && createdProject?.project?.id) {
        console.log(`Starting file upload: ${selectedFiles.length} files to project ${createdProject.project.id}`);
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            console.log(`[${i + 1}/${selectedFiles.length}] Uploading: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
            
            const uploadResponse = await apiService.uploadFile(createdProject.project.id, file, true);
            
            console.log(`✅ File uploaded successfully:`, uploadResponse);
            uploadedCount++;
          } catch (uploadError: any) {
            console.error(`❌ File upload failed for ${file.name}:`, uploadError);
            console.error('Error details:', uploadError.response?.data);
            failedCount++;
          }
        }
        
        console.log(`File upload complete: ${uploadedCount} succeeded, ${failedCount} failed`);
        
        if (failedCount > 0) {
          setError(`Project created but ${failedCount} file(s) failed to upload. Please try re-uploading them from the project page.`);
          // Wait a bit before navigating so user can see the error
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } else if (selectedFiles.length > 0) {
        console.warn('Files were selected but project ID is missing!', createdProject);
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Project creation failed:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: dashboardTheme.background }}>
      <AppBar 
        position="static"
        elevation={0}
        sx={{ 
          background: dashboardTheme.appBarGradient,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderBottom: `3px solid ${dashboardTheme.primary}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <CreateIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'white' }}>
                Create New Project
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                Start your graduation project journey
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Progress Indicator */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: dashboardTheme.textPrimary, fontWeight: 600 }}>
              Project Setup Progress
            </Typography>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(() => {
                  let completed = 0;
                  if (formData.program_id) completed += 20;
                  if (formData.title) completed += 20;
                  if (formData.abstract) completed += 20;
                  if (formData.academic_year) completed += 20;
                  if (formData.semester) completed += 20;
                  return completed;
                })()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: dashboardTheme.primary,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Complete all required fields to create your project
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={4}>
            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Slide direction="up" in={true} timeout={600}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                    border: `2px solid ${dashboardTheme.borderColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                      transform: 'translateY(-2px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        backgroundColor: dashboardTheme.primary,
                        mr: 2,
                        width: 48,
                        height: 48,
                        boxShadow: `0 4px 12px ${dashboardTheme.primary}40`,
                      }}
                    >
                      <SchoolIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.textPrimary,
                        mb: 0.5,
                      }}>
                        Basic Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Provide the essential details about your project
                      </Typography>
                    </Box>
                  </Box>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl 
                      fullWidth 
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: dashboardTheme.primary,
                          },
                        },
                      }}
                    >
                      <InputLabel id="program-label" sx={{ color: dashboardTheme.textSecondary }}>
                        Program
                      </InputLabel>
                      <Select
                        labelId="program-label"
                        value={formData.program_id}
                        label="Program"
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            py: 1.5,
                          },
                        }}
                      >
                        {(programs || []).map((program) => (
                          <MenuItem key={program.id} value={program.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SchoolIcon sx={{ mr: 1, color: dashboardTheme.primary, fontSize: 20 }} />
                              {program.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Project Title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      helperText="Enter a clear and descriptive title for your project"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: dashboardTheme.primary,
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Abstract"
                      multiline
                      rows={4}
                      value={formData.abstract}
                      onChange={(e) => handleInputChange('abstract', e.target.value)}
                      required
                      helperText="Provide a comprehensive overview of your project's objectives, methodology, and expected outcomes"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: dashboardTheme.primary,
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl 
                      fullWidth 
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: dashboardTheme.primary,
                          },
                        },
                      }}
                    >
                      <InputLabel id="academic-year-label" sx={{ color: dashboardTheme.textSecondary }}>
                        Academic Year
                      </InputLabel>
                      <Select
                        labelId="academic-year-label"
                        value={formData.academic_year}
                        label="Academic Year"
                        onChange={(e) => handleInputChange('academic_year', e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            py: 1.5,
                          },
                        }}
                      >
                        {Array.from({ length: 26 }, (_, i) => {
                          const year = 2025 - i;
                          return (
                            <MenuItem key={year} value={year.toString()}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: dashboardTheme.primary, mr: 1 }} />
                                {year}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl 
                      fullWidth 
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: dashboardTheme.primary,
                          },
                        },
                      }}
                    >
                      <InputLabel id="semester-label" sx={{ color: dashboardTheme.textSecondary }}>
                        Semester
                      </InputLabel>
                      <Select
                        labelId="semester-label"
                        value={formData.semester}
                        label="Semester"
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            py: 1.5,
                          },
                        }}
                      >
                        <MenuItem value="fall">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b', mr: 1 }} />
                            Fall
                          </Box>
                        </MenuItem>
                        <MenuItem value="spring">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981', mr: 1 }} />
                            Spring
                          </Box>
                        </MenuItem>
                        <MenuItem value="summer">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#06b6d4', mr: 1 }} />
                            Summer
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                </Paper>
              </Slide>
            </Grid>

            {/* Keywords Section */}
            <Grid size={{ xs: 12 }}>
              <Slide direction="up" in={true} timeout={800}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                    border: `2px solid ${dashboardTheme.borderColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                      transform: 'translateY(-2px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${dashboardTheme.secondary} 0%, ${dashboardTheme.accent} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        backgroundColor: dashboardTheme.secondary,
                        mr: 2,
                        width: 48,
                        height: 48,
                        boxShadow: `0 4px 12px ${dashboardTheme.secondary}40`,
                      }}
                    >
                      <TagIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.textPrimary,
                        mb: 0.5,
                      }}>
                        Keywords & Tags
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add relevant keywords to help categorize your project
                      </Typography>
                    </Box>
                  </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <TextField
                    size="medium"
                    placeholder="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    sx={{ 
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: dashboardTheme.secondary,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: dashboardTheme.secondary,
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: `0 4px 12px ${dashboardTheme.secondary}40`,
                      '&:hover': {
                        backgroundColor: dashboardTheme.secondary,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 16px ${dashboardTheme.secondary}50`,
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(0,0,0,0.12)',
                        color: 'rgba(0,0,0,0.26)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Add Keyword
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {(formData.keywords || []).map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                      sx={{
                        backgroundColor: `${dashboardTheme.secondary}15`,
                        color: dashboardTheme.secondary,
                        border: `1px solid ${dashboardTheme.secondary}30`,
                        fontWeight: 500,
                        '& .MuiChip-deleteIcon': {
                          color: dashboardTheme.secondary,
                          '&:hover': {
                            color: dashboardTheme.textPrimary,
                          },
                        },
                        '&:hover': {
                          backgroundColor: `${dashboardTheme.secondary}25`,
                          transform: 'scale(1.02)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  ))}
                </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Team Section */}
            <Grid size={{ xs: 12 }}>
              <Slide direction="up" in={true} timeout={1000}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                    border: `2px solid ${dashboardTheme.borderColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                      transform: 'translateY(-2px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${dashboardTheme.accent} 0%, ${dashboardTheme.primary} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        backgroundColor: dashboardTheme.accent,
                        mr: 2,
                        width: 48,
                        height: 48,
                        boxShadow: `0 4px 12px ${dashboardTheme.accent}40`,
                      }}
                    >
                      <GroupIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.textPrimary,
                        mb: 0.5,
                      }}>
                        Project Team
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add team members and advisors to your project
                      </Typography>
                    </Box>
                  </Box>
                
                <Grid container spacing={4}>
                  {/* Members */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      backgroundColor: `${dashboardTheme.primary}08`,
                      border: `1px solid ${dashboardTheme.primary}20`,
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.primary,
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 24 }} />
                        Project Members
                      </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ 
                          flexGrow: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: dashboardTheme.primary,
                            },
                          },
                        }}
                        freeSolo
                        options={users}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') return option;
                          return `${option.full_name} (${option.email})`;
                        }}
                        value={users.find(u => u.id === newMember.user_id) || null}
                        onChange={(_, value) => {
                          if (typeof value === 'string') {
                            setNewMember(prev => ({ ...prev, user_id: -1, customName: value }));
                          } else if (value) {
                            setNewMember(prev => ({ ...prev, user_id: value.id, customName: undefined }));
                          } else {
                            setNewMember(prev => ({ ...prev, user_id: 0, customName: undefined }));
                          }
                        }}
                        onInputChange={(_, value) => {
                          if (value && !users.find(u => `${u.full_name} (${u.email})` === value)) {
                            setNewMember(prev => ({ ...prev, customName: value, user_id: -1 }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Select or Type Member Name" 
                            sx={{
                              '& .MuiInputLabel-root': {
                                color: dashboardTheme.textSecondary,
                              },
                            }}
                          />
                        )}
                      />
                      <FormControl 
                        sx={{ 
                          minWidth: 140,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: dashboardTheme.primary,
                            },
                          },
                        }}
                      >
                        <InputLabel id="member-role-label" sx={{ color: dashboardTheme.textSecondary }}>
                          Role
                        </InputLabel>
                        <Select
                          labelId="member-role-label"
                          value={newMember.role}
                          label="Role"
                          onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1.5,
                            },
                          }}
                        >
                          <MenuItem value="LEAD">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', mr: 1 }} />
                              Lead
                            </Box>
                          </MenuItem>
                          <MenuItem value="MEMBER">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', mr: 1 }} />
                              Member
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleAddMember}
                        disabled={newMember.user_id === 0 && !newMember.customName}
                        startIcon={<AddIcon />}
                        sx={{ 
                          minWidth: 100,
                          backgroundColor: dashboardTheme.primary,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: `0 4px 12px ${dashboardTheme.primary}40`,
                          '&:hover': {
                            backgroundColor: dashboardTheme.primary,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${dashboardTheme.primary}50`,
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack spacing={1.5}>
                      {(formData.members || []).map((member, index) => {
                        const user = users.find(u => u.id === member.user_id);
                        const displayName = member.customName || user?.full_name || 'Unknown';
                        return (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 2, 
                            border: `1px solid ${dashboardTheme.primary}20`,
                            borderRadius: 2,
                            backgroundColor: `${dashboardTheme.primary}05`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.primary}10`,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${dashboardTheme.primary}20`,
                            },
                          }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                backgroundColor: member.role === 'LEAD' ? '#f59e0b' : '#10b981',
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {displayName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                              {displayName}
                            </Typography>
                            <Chip 
                              label={member.role} 
                              size="small" 
                              sx={{ 
                                mr: 1,
                                backgroundColor: member.role === 'LEAD' ? '#f59e0b' : '#10b981',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }} 
                            />
                            <Tooltip title="Remove member">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveMember(index)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'white',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        );
                      })}
                    </Stack>
                    </Box>
                  </Grid>

                  {/* Advisors */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      backgroundColor: `${dashboardTheme.secondary}08`,
                      border: `1px solid ${dashboardTheme.secondary}20`,
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}>
                        <SchoolIcon sx={{ mr: 1, fontSize: 24 }} />
                        Project Advisors (Optional)
                      </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ 
                          flexGrow: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: dashboardTheme.secondary,
                            },
                          },
                        }}
                        freeSolo
                        options={users}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') return option;
                          return `${option.full_name} (${option.email})`;
                        }}
                        value={users.find(u => u.id === newAdvisor.user_id) || null}
                        onChange={(_, value) => {
                          if (typeof value === 'string') {
                            setNewAdvisor(prev => ({ ...prev, user_id: -1, customName: value }));
                          } else if (value) {
                            setNewAdvisor(prev => ({ ...prev, user_id: value.id, customName: undefined }));
                          } else {
                            setNewAdvisor(prev => ({ ...prev, user_id: 0, customName: undefined }));
                          }
                        }}
                        onInputChange={(_, value) => {
                          if (value && !users.find(u => `${u.full_name} (${u.email})` === value)) {
                            setNewAdvisor(prev => ({ ...prev, customName: value, user_id: -1 }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Select or Type Advisor Name" 
                            sx={{
                              '& .MuiInputLabel-root': {
                                color: dashboardTheme.textSecondary,
                              },
                            }}
                          />
                        )}
                      />
                      <FormControl 
                        sx={{ 
                          minWidth: 140,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: dashboardTheme.secondary,
                            },
                          },
                        }}
                      >
                        <InputLabel id="advisor-role-label" sx={{ color: dashboardTheme.textSecondary }}>
                          Role
                        </InputLabel>
                        <Select
                          labelId="advisor-role-label"
                          value={newAdvisor.role}
                          label="Role"
                          onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1.5,
                            },
                          }}
                        >
                          <MenuItem value="MAIN">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7c3aed', mr: 1 }} />
                              Main Advisor
                            </Box>
                          </MenuItem>
                          <MenuItem value="CO_ADVISOR">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6', mr: 1 }} />
                              Co-Advisor
                            </Box>
                          </MenuItem>
                          <MenuItem value="REVIEWER">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669', mr: 1 }} />
                              Reviewer
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleAddAdvisor}
                        disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                        startIcon={<AddIcon />}
                        sx={{ 
                          minWidth: 100,
                          backgroundColor: dashboardTheme.secondary,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: `0 4px 12px ${dashboardTheme.secondary}40`,
                          '&:hover': {
                            backgroundColor: dashboardTheme.secondary,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${dashboardTheme.secondary}50`,
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack spacing={1.5}>
                      {(formData.advisors || []).map((advisor, index) => {
                        const user = users.find(u => u.id === advisor.user_id);
                        const displayName = advisor.customName || user?.full_name || 'Unknown';
                        const roleColor = advisor.role === 'MAIN' ? '#7c3aed' : advisor.role === 'CO_ADVISOR' ? '#8b5cf6' : '#059669';
                        return (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 2, 
                            border: `1px solid ${dashboardTheme.secondary}20`,
                            borderRadius: 2,
                            backgroundColor: `${dashboardTheme.secondary}05`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: `${dashboardTheme.secondary}10`,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${dashboardTheme.secondary}20`,
                            },
                          }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                backgroundColor: roleColor,
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {displayName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                              {displayName}
                            </Typography>
                            <Chip 
                              label={advisor.role.replace('_', ' ')} 
                              size="small" 
                              sx={{ 
                                mr: 1,
                                backgroundColor: roleColor,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }} 
                            />
                            <Tooltip title="Remove advisor">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveAdvisor(index)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'white',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        );
                      })}
                    </Stack>
                    </Box>
                  </Grid>
                </Grid>
                </Paper>
              </Slide>
            </Grid>

            {/* File Upload Section */}
            <Grid size={{ xs: 12 }}>
              <Slide direction="up" in={true} timeout={1200}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                    border: `2px solid ${dashboardTheme.borderColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                      transform: 'translateY(-2px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.accent} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        backgroundColor: dashboardTheme.primary,
                        mr: 2,
                        width: 48,
                        height: 48,
                        boxShadow: `0 4px 12px ${dashboardTheme.primary}40`,
                      }}
                    >
                      <UploadIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 700, 
                        color: dashboardTheme.textPrimary,
                        mb: 0.5,
                      }}>
                        Project Files (Optional)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload documents and resources for your project
                      </Typography>
                    </Box>
                  </Box>
                
                <Box sx={{ 
                  mb: 3,
                  p: 4,
                  border: `2px dashed ${dashboardTheme.primary}40`,
                  borderRadius: 3,
                  backgroundColor: `${dashboardTheme.primary}05`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: dashboardTheme.primary,
                    backgroundColor: `${dashboardTheme.primary}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${dashboardTheme.primary}20`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${dashboardTheme.primary}10 0%, transparent 70%)`,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}>
                  <input
                    accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        mb: 2,
                        backgroundColor: dashboardTheme.primary,
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${dashboardTheme.primary}40`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          backgroundColor: dashboardTheme.primary,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${dashboardTheme.primary}50`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                      }}
                    >
                      Choose Files to Upload
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Drag and drop files here or click to browse
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX (No size limit)
                  </Typography>
                </Box>
                
                {selectedFiles.length > 0 && (
                  <Fade in={selectedFiles.length > 0}>
                    <Box>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          mb: 3, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${dashboardTheme.primary}08 0%, ${dashboardTheme.primary}05 100%)`,
                          border: `1px solid ${dashboardTheme.primary}20`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: `linear-gradient(90deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                          }
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontWeight: 600, 
                          color: dashboardTheme.textPrimary,
                          display: 'flex',
                          alignItems: 'center',
                          mb: 0,
                        }}>
                          <CheckCircleIcon sx={{ mr: 1, color: dashboardTheme.primary }} />
                          Selected Files ({selectedFiles.length})
                        </Typography>
                      </Paper>
                      <Stack spacing={1.5}>
                        {selectedFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              border: `1px solid ${dashboardTheme.primary}20`,
                              borderRadius: 2,
                              backgroundColor: `${dashboardTheme.primary}05`,
                              transition: 'all 0.3s ease-in-out',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                backgroundColor: `${dashboardTheme.primary}10`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${dashboardTheme.primary}25`,
                                borderColor: `${dashboardTheme.primary}40`,
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: `linear-gradient(180deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                                opacity: 0,
                                transition: 'opacity 0.3s ease-in-out',
                              },
                              '&:hover::before': {
                                opacity: 1,
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                backgroundColor: dashboardTheme.primary,
                                width: 40,
                                height: 40,
                              }}
                            >
                              <AttachFileIcon />
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                            </Box>
                            <Tooltip title="Remove file">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(index)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'white',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Fade>
                )}
                </Paper>
              </Slide>
            </Grid>
          </Grid>

          {/* Sticky Footer */}
          <Slide direction="up" in={true} timeout={1400}>
            <Paper 
              elevation={0}
              sx={{ 
                position: 'sticky', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                p: 3, 
                mt: 4,
                backgroundColor: dashboardTheme.cardBackground,
                borderTop: `3px solid ${dashboardTheme.primary}`,
                boxShadow: `0 -8px 32px rgba(0,0,0,0.1)`,
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 50%, ${dashboardTheme.accent} 100%)`,
                },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'flex-end', 
                maxWidth: 'lg', 
                mx: 'auto',
                alignItems: 'center',
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: dashboardTheme.textSecondary,
                    color: dashboardTheme.textSecondary,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: dashboardTheme.primary,
                      color: dashboardTheme.primary,
                      backgroundColor: `${dashboardTheme.primary}10`,
                      transform: 'translateY(-1px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading || !formData.program_id || !formData.title || !formData.abstract || !formData.academic_year}
                  size="large"
                  sx={{ 
                    minWidth: 180,
                    backgroundColor: dashboardTheme.primary,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${dashboardTheme.primary}40`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: dashboardTheme.primary,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 16px ${dashboardTheme.primary}50`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0,0,0,0.12)',
                      color: 'rgba(0,0,0,0.26)',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </Button>
              </Box>
            </Paper>
          </Slide>
        </form>
      </Container>
    </Box>
  );
};
