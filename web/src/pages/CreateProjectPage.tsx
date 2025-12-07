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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { CreateProjectData, Program, User } from '../types';
import { apiService } from '../services/api';

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
  const { t } = useLanguage();

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
            console.log('File details:', {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: new Date(file.lastModified).toISOString()
            });
            
            const uploadResponse = await apiService.uploadFile(createdProject.project.id, file, true);
            
            console.log(`✅ File uploaded successfully:`, uploadResponse);
            uploadedCount++;
          } catch (uploadError: any) {
            console.error(`❌ File upload failed for ${file.name}:`, uploadError);
            console.error('Error status:', uploadError.response?.status);
            console.error('Error details:', uploadError.response?.data);
            console.error('Error message:', uploadError.message);
            console.error('Full error:', uploadError);
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
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', // Subtle gradient background
      position: 'relative',
      zIndex: 1,
    }}>
      <AppBar 
        position="static"
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Elegant gradient header
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          color: '#FFFFFF',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2, 
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#FFFFFF', fontWeight: 700, fontSize: '1.4rem' }}>
            {t('Create New Project')}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Container with Clear Header Separation */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          pt: 8, // Increased top padding for clear separation from header
          pb: 4,
          px: 4, // Enhanced horizontal padding
          position: 'relative',
          zIndex: 2,
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(244, 67, 54, 0.2)',
              border: '1px solid #ffcdd2',
              backgroundColor: '#ffebee',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Form with Enhanced Spacing */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={5}> {/* Increased spacing between sections */}
            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
                  border: '2px solid #667eea',
                  mb: 3,
                  position: 'relative',
                  zIndex: 3,
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.18)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mr: 3,
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
                    <SchoolIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: '#667eea', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    textShadow: '0 2px 4px rgba(102, 126, 234, 0.1)'
                  }}>
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="program-label" sx={{ color: '#667eea', fontWeight: 600 }}>Program</InputLabel>
                      <Select
                        labelId="program-label"
                        value={formData.program_id}
                        label="Program"
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                        sx={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: '#e0e7ff',
                              borderWidth: 2,
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                          },
                        }}
                      >
                        {(programs || []).map((program) => (
                          <MenuItem key={program.id} value={program.id}>
                            {program.name}
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
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: '#e0e7ff',
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#667eea',
                          fontWeight: 600,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea',
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
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: '#e0e7ff',
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#667eea',
                          fontWeight: 600,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea',
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      placeholder="2024-2025"
                      value={formData.academic_year}
                      onChange={(e) => handleInputChange('academic_year', e.target.value)}
                      required
                      helperText="Format: YYYY-YYYY"
                      sx={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: '#e0e7ff',
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#667eea',
                          fontWeight: 600,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#667eea',
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="semester-label" sx={{ color: '#667eea', fontWeight: 600 }}>Semester</InputLabel>
                      <Select
                        labelId="semester-label"
                        value={formData.semester}
                        label="Semester"
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        sx={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: '#e0e7ff',
                              borderWidth: 2,
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            },
                          },
                        }}
                      >
                        <MenuItem value="fall">Fall</MenuItem>
                        <MenuItem value="spring">Spring</MenuItem>
                        <MenuItem value="summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Keywords Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.12)',
                  border: '2px solid #22c55e',
                  mb: 3,
                  position: 'relative',
                  zIndex: 3,
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.18)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    mr: 3,
                    boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
                  }}>
                    <DescriptionIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: '#22c55e', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    textShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
                  }}>
                    Keywords & Tags
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder={t('Add keyword')}
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    sx={{ 
                      minWidth: 200,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#dcfce7',
                          borderWidth: 2,
                        },
                        '&:hover fieldset': {
                          borderColor: '#22c55e',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#22c55e',
                          boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#22c55e',
                        fontWeight: 600,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#22c55e',
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: 2,
                      borderColor: '#22c55e',
                      color: '#22c55e',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#16a34a',
                        backgroundColor: '#dcfce7',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                      },
                      '&:disabled': {
                        borderColor: '#d1d5db',
                        color: '#9ca3af',
                      },
                    }}
                  >
                    {t('Add Keyword')}
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {(formData.keywords || []).map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                      sx={{
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        border: '1px solid #22c55e',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#bbf7d0',
                          transform: 'scale(1.05)',
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: '#16a34a',
                          '&:hover': {
                            color: '#15803d',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Team Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5,
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(251, 146, 60, 0.12)',
                  border: '2px solid #fb923c',
                  mb: 3,
                  position: 'relative',
                  zIndex: 3,
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(251, 146, 60, 0.18)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                    mr: 3,
                    boxShadow: '0 4px 16px rgba(251, 146, 60, 0.3)'
                  }}>
                    <PersonIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: '#fb923c', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    textShadow: '0 2px 4px rgba(251, 146, 60, 0.1)'
                  }}>
                    {t('Project Team')}
                  </Typography>
                </Box>
                
                <Grid container spacing={4}> {/* Increased internal spacing within sections */}
                  {/* Members */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: '#fb923c', mb: 2 }}>
                      {t('Project Members')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ 
                          flexGrow: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: '#fed7aa',
                              borderWidth: 2,
                            },
                            '&:hover fieldset': {
                              borderColor: '#fb923c',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#fb923c',
                              boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.1)',
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
                            label={t('Select or Type Member Name')}
                            sx={{
                              '& .MuiInputLabel-root': {
                                color: '#fb923c',
                                fontWeight: 600,
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#fb923c',
                              },
                            }}
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel id="member-role-label" sx={{ color: '#fb923c', fontWeight: 600 }}>{t('Role')}</InputLabel>
                        <Select
                          labelId="member-role-label"
                          value={newMember.role}
                          label={t('Role')}
                          onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                          sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#fed7aa',
                                borderWidth: 2,
                              },
                              '&:hover fieldset': {
                                borderColor: '#fb923c',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#fb923c',
                                boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.1)',
                              },
                            },
                          }}
                        >
                          <MenuItem value="LEAD">{t('Lead')}</MenuItem>
                          <MenuItem value="MEMBER">{t('Member')}</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        onClick={handleAddMember}
                        disabled={newMember.user_id === 0 && !newMember.customName}
                        startIcon={<AddIcon />}
                        sx={{ 
                          minWidth: 100,
                          borderRadius: 2,
                          borderColor: '#fb923c',
                          color: '#fb923c',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#ea580c',
                            backgroundColor: '#fed7aa',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                          },
                          '&:disabled': {
                            borderColor: '#d1d5db',
                            color: '#9ca3af',
                          },
                        }}
                      >
                        {t('Add')}
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {(formData.members || []).map((member, index) => {
                        const user = users.find(u => u.id === member.user_id);
                        const displayName = member.customName || user?.full_name || 'Unknown';
                        return (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1, 
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper'
                          }}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {displayName} <Chip label={member.role} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveMember(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Grid>

                  {/* Advisors */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: '#fb923c', mb: 2 }}>
                      Project Advisors (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ 
                          flexGrow: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: '#fed7aa',
                              borderWidth: 2,
                            },
                            '&:hover fieldset': {
                              borderColor: '#fb923c',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#fb923c',
                              boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.1)',
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
                                color: '#fb923c',
                                fontWeight: 600,
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#fb923c',
                              },
                            }}
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel id="advisor-role-label" sx={{ color: '#fb923c', fontWeight: 600 }}>Role</InputLabel>
                        <Select
                          labelId="advisor-role-label"
                          value={newAdvisor.role}
                          label="Role"
                          onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                          sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': {
                                borderColor: '#fed7aa',
                                borderWidth: 2,
                              },
                              '&:hover fieldset': {
                                borderColor: '#fb923c',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#fb923c',
                                boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.1)',
                              },
                            },
                          }}
                        >
                          <MenuItem value="MAIN">Main Advisor</MenuItem>
                          <MenuItem value="CO_ADVISOR">Co-Advisor</MenuItem>
                          <MenuItem value="REVIEWER">Reviewer</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        onClick={handleAddAdvisor}
                        disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                        startIcon={<AddIcon />}
                        sx={{ 
                          minWidth: 100,
                          borderRadius: 2,
                          borderColor: '#fb923c',
                          color: '#fb923c',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#ea580c',
                            backgroundColor: '#fed7aa',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                          },
                          '&:disabled': {
                            borderColor: '#d1d5db',
                            color: '#9ca3af',
                          },
                        }}
                      >
                        {t('Add')}
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {(formData.advisors || []).map((advisor, index) => {
                        const user = users.find(u => u.id === advisor.user_id);
                        const displayName = advisor.customName || user?.full_name || 'Unknown';
                        return (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1, 
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper'
                          }}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {displayName} <Chip label={advisor.role} size="small" color="secondary" variant="outlined" sx={{ ml: 1 }} />
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveAdvisor(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* File Upload Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5,
                  background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(168, 85, 247, 0.12)',
                  border: '2px solid #a855f7',
                  mb: 3,
                  position: 'relative',
                  zIndex: 3,
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(168, 85, 247, 0.18)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    mr: 3,
                    boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)'
                  }}>
                    <AttachFileIcon2 sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: '#a855f7', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    textShadow: '0 2px 4px rgba(168, 85, 247, 0.1)'
                  }}>
                    Project Files (Optional)
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
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
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        borderColor: '#a855f7',
                        color: '#a855f7',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                          borderColor: '#7c3aed',
                          backgroundColor: '#f3e8ff',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                        },
                      }}
                    >
                      Upload Files
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ color: '#7c3aed', fontWeight: 500 }}>
                    Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX (No size limit)
                  </Typography>
                </Box>
                
                {selectedFiles.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Files ({selectedFiles.length}):
                    </Typography>
                    <Stack spacing={1}>
                      {selectedFiles.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper'
                          }}
                        >
                          <AttachFileIcon color="action" />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Enhanced Sticky Footer with Better Spacing */}
          <Paper 
            elevation={0} 
            sx={{ 
              position: 'sticky', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 4,
              mt: 8,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderTop: '3px solid',
              borderColor: '#e2e8f0',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
              zIndex: 4
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', maxWidth: 'lg', mx: 'auto' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                size="large"
                sx={{
                  borderRadius: 2,
                  borderColor: '#94a3b8',
                  color: '#64748b',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#64748b',
                    backgroundColor: '#f1f5f9',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(100, 116, 139, 0.2)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                size="large"
                sx={{ 
                  minWidth: 180,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  },
                  '&:disabled': {
                    background: '#d1d5db',
                    color: '#9ca3af',
                    boxShadow: 'none',
                    transform: 'none',
                  },
                }}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </Box>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};
