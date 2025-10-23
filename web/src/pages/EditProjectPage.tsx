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
  Paper,
  Divider,
  Stack,
  Fade,
  Slide,
  Avatar,
  LinearProgress,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Group as GroupIcon,
  Tag as TagIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CreateProjectData, Program, User, Project } from '../types';
import { apiService } from '../services/api';

export const EditProjectPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectData>({
    program_id: 0,
    title: '',
    abstract: '',
    keywords: [],
    academic_year: '',
    semester: 'fall',
    status: 'draft',
    members: [],
    advisors: [],
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newMember, setNewMember] = useState({ user_id: 0, role: 'MEMBER' as 'LEAD' | 'MEMBER', customName: undefined as string | undefined });
  const [newAdvisor, setNewAdvisor] = useState({ user_id: 0, role: 'MAIN' as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER', customName: undefined as string | undefined });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Redirect reviewers away from this page
  useEffect(() => {
    if (user?.roles?.some(role => role.name === 'reviewer')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
    fetchPrograms();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      setInitialLoading(true);
      const response = await apiService.getProject(parseInt(id!));
      const project = response.project;
      
      setFormData({
        program_id: project.program_id,
        title: project.title,
        abstract: project.abstract,
        keywords: project.keywords || [],
        academic_year: project.academic_year,
        semester: project.semester,
        status: project.status,
        members: (project.members || []).map(member => ({
          user_id: member.id || -1,
          role: member.pivot.role_in_project,
          customName: member.is_custom ? member.full_name : undefined
        })),
        advisors: (project.advisors || []).map(advisor => ({
          user_id: advisor.id || -1,
          role: advisor.pivot.advisor_role,
          customName: advisor.is_custom ? advisor.full_name : undefined
        })),
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await apiService.getPrograms();
      setPrograms(response.data || response);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
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
      console.log('Updating project...', formData);
      
      // Update the project first
      await apiService.updateProject(parseInt(id!), formData);
      console.log('Project updated successfully');

      // If files are selected, upload them
      if (selectedFiles.length > 0) {
        console.log(`Starting file upload: ${selectedFiles.length} files to project ${id}`);
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            console.log(`[${i + 1}/${selectedFiles.length}] Uploading: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
            
            const uploadResponse = await apiService.uploadFile(parseInt(id!), file, true);
            
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
          setError(`Project updated but ${failedCount} file(s) failed to upload.`);
          // Wait a bit before navigating so user can see the error
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      navigate(`/dashboard/projects/${id}`);
    } catch (error: any) {
      console.error('Project update failed:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#FFFFFF', // Pure White background
      position: 'relative',
      zIndex: 1,
      // Override any inherited dashboard theme styles
      '& *': {
        backgroundColor: 'transparent !important',
        backgroundImage: 'none !important',
        background: 'transparent !important',
      }
    }}>
      <AppBar 
        position="static"
        sx={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          color: '#000000',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(`/dashboard/projects/${id}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#000000' }}>
                Edit Project
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: '#000000' }}>
                Update project details and information
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4,
          backgroundColor: '#FFFFFF',
          position: 'relative',
          zIndex: 2,
          // Ensure clean white background overrides any inherited styles
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: -1,
          }
        }}
      >
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Slide direction="up" in={true} timeout={600}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${dashboardTheme.borderColor}`,
          }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                {/* Basic Information Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.primary, mr: 2 }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Basic Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Project details and academic information
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      {/* Program Selection */}
                      <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>Program</InputLabel>
                          <Select
                            value={formData.program_id}
                            onChange={(e) => handleInputChange('program_id', e.target.value)}
                            label="Program"
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            {programs.map((program) => (
                              <MenuItem key={program.id} value={program.id}>
                                {program.name} - {program.department?.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Title */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Project Title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>

                      {/* Abstract */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Abstract"
                          multiline
                          rows={4}
                          value={formData.abstract}
                          onChange={(e) => handleInputChange('abstract', e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Keywords Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.secondary, mr: 2 }}>
                        <TagIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Keywords
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add relevant keywords to categorize your project
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {(formData.keywords || []).map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          onDelete={() => handleRemoveKeyword(keyword)}
                          sx={{
                            background: `linear-gradient(135deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${dashboardTheme.secondary} 0%, ${dashboardTheme.primary} 100%)`,
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <TextField
                        label="Add Keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                        size="small"
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddKeyword}
                        disabled={!newKeyword.trim()}
                        sx={{
                          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                            boxShadow: 'none',
                            transform: 'none',
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Academic Details Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.accent, mr: 2 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Academic Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Academic year, semester, and project status
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Academic Year"
                          value={formData.academic_year}
                          onChange={(e) => handleInputChange('academic_year', e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Semester</InputLabel>
                          <Select
                            value={formData.semester}
                            onChange={(e) => handleInputChange('semester', e.target.value)}
                            label="Semester"
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem value="fall">Fall</MenuItem>
                            <MenuItem value="spring">Spring</MenuItem>
                            <MenuItem value="summer">Summer</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Project Status</InputLabel>
                          <Select
                            value={formData.status || 'draft'}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            label="Project Status"
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="submitted">Submitted</MenuItem>
                            <MenuItem value="under_review">Under Review</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Project Members Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.primary, mr: 2 }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Project Members
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add team members and assign their roles
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Autocomplete
                        sx={{ minWidth: 250, flexGrow: 1 }}
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
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={newMember.role}
                          onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                          label="Role"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        >
                          <MenuItem value="LEAD">Lead</MenuItem>
                          <MenuItem value="MEMBER">Member</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddMember}
                        disabled={newMember.user_id === 0 && !newMember.customName}
                        sx={{
                          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                            boxShadow: 'none',
                            transform: 'none',
                          }
                        }}
                      >
                        Add Member
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {formData.members.map((member, index) => {
                        const user = users.find(u => u.id === member.user_id);
                        const displayName = member.customName || user?.full_name || 'Unknown';
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${displayName} (${member.role})`}
                              onDelete={() => handleRemoveMember(index)}
                              sx={{
                                background: `linear-gradient(135deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                                color: 'white',
                                fontWeight: 500,
                                '&:hover': {
                                  background: `linear-gradient(135deg, ${dashboardTheme.secondary} 0%, ${dashboardTheme.primary} 100%)`,
                                }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>

                {/* Project Advisors Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.secondary, mr: 2 }}>
                        <SupervisorAccountIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Project Advisors
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Assign advisors and reviewers to your project
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Autocomplete
                        sx={{ minWidth: 250, flexGrow: 1 }}
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
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={newAdvisor.role}
                          onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                          label="Role"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        >
                          <MenuItem value="MAIN">Main Advisor</MenuItem>
                          <MenuItem value="CO_ADVISOR">Co-Advisor</MenuItem>
                          <MenuItem value="REVIEWER">Reviewer</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddAdvisor}
                        disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                        sx={{
                          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                            boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                            boxShadow: 'none',
                            transform: 'none',
                          }
                        }}
                      >
                        Add Advisor
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(formData.advisors || []).map((advisor, index) => {
                        const user = users.find(u => u.id === advisor.user_id);
                        const displayName = advisor.customName || user?.full_name || 'Unknown';
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${displayName} (${advisor.role})`}
                              onDelete={() => handleRemoveAdvisor(index)}
                              sx={{
                                background: `linear-gradient(135deg, ${dashboardTheme.secondary} 0%, ${dashboardTheme.accent} 100%)`,
                                color: 'white',
                                fontWeight: 500,
                                '&:hover': {
                                  background: `linear-gradient(135deg, ${dashboardTheme.accent} 0%, ${dashboardTheme.secondary} 100%)`,
                                }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>

                {/* File Upload Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: dashboardTheme.accent, mr: 2 }}>
                        <FileUploadIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: dashboardTheme.textPrimary }}>
                          Upload Additional Files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add supporting documents and files to your project
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <input
                        accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
                        style={{ display: 'none' }}
                        id="file-upload-edit"
                        multiple
                        type="file"
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="file-upload-edit">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ 
                            mb: 2,
                            background: `linear-gradient(135deg, ${dashboardTheme.accent} 0%, ${dashboardTheme.primary} 100%)`,
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.accent} 100%)`,
                            }
                          }}
                        >
                          Choose Files to Upload
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                        Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX (No size limit)
                      </Typography>
                    </Box>
                    
                    {selectedFiles.length > 0 && (
                      <Fade in={selectedFiles.length > 0}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                            Selected Files ({selectedFiles.length}):
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {selectedFiles.map((file, index) => (
                              <Paper
                                key={index}
                                elevation={1}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, #f8fafc 100%)`,
                                  border: `1px solid ${dashboardTheme.borderColor}`,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-1px)',
                                  }
                                }}
                              >
                                <Avatar sx={{ bgcolor: dashboardTheme.primary }}>
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
                                        color: 'error.dark',
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Paper>
                            ))}
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Paper>
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${dashboardTheme.cardBackground} 0%, ${dashboardTheme.background} 100%)`,
                      border: `1px solid ${dashboardTheme.borderColor}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/dashboard/projects/${id}`)}
                        disabled={loading}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          borderColor: dashboardTheme.borderColor,
                          color: dashboardTheme.textPrimary,
                          '&:hover': {
                            borderColor: dashboardTheme.primary,
                            backgroundColor: `${dashboardTheme.primary}10`,
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                        sx={{
                          background: `linear-gradient(135deg, ${dashboardTheme.primary} 0%, ${dashboardTheme.secondary} 100%)`,
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${dashboardTheme.secondary} 0%, ${dashboardTheme.primary} 100%)`,
                            boxShadow: `0 4px 20px ${dashboardTheme.primary}40`,
                          },
                          '&:disabled': {
                            background: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)',
                          }
                        }}
                      >
                        {loading ? 'Updating...' : 'Update Project'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
        </Slide>
      </Container>
    </Box>
  );
};
