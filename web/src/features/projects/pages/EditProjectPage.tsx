import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { projectRoutes } from '@/utils/projectRoutes';
import { useAuthStore } from '@/features/auth/store';
import { CreateProjectData, Program, User } from '@/types';
import { apiService } from '@/lib/api';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

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
  const [isDirty, setIsDirty] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Unsaved changes protection
  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChanges({
    isDirty,
    message: 'You have unsaved changes. Are you sure you want to leave without saving?',
    enableBeforeUnload: true,
  });

  // Redirect reviewers away from this page
  useEffect(() => {
    if (user?.roles?.some(role => role.name === 'reviewer')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
    fetchPrograms();
    fetchUsers();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setInitialLoading(true);
      const response = await apiService.getProject(slug!);
      const project = response.project;

      setProjectId(project.id);
      setFormData({
        program_id: project.program_id,
        title: project.title,
        abstract: project.abstract,
        keywords: project.keywords || [],
        academic_year: project.academic_year,
        semester: project.semester,
        status: project.status,
        members: (project.members || []).map(member => ({
          user_id: member.is_custom ? 0 : (member.id || 0),
          role: member.pivot.role_in_project,
          customName: member.is_custom ? member.full_name : undefined
        })),
        advisors: (project.advisors || []).map(advisor => ({
          user_id: advisor.is_custom ? 0 : (advisor.id || 0),
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
      const programs = await apiService.getPrograms();
      setPrograms(programs || []);
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
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true); // Mark form as dirty when any field changes
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
      setIsDirty(true); // Mark form as dirty
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
    setIsDirty(true); // Mark form as dirty
  };

  const handleAddMember = () => {
    if (newMember.user_id > 0 || newMember.customName) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember }]
      }));
      setNewMember({ user_id: 0, role: 'MEMBER', customName: undefined });
      setIsDirty(true); // Mark form as dirty
    }
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
    setIsDirty(true); // Mark form as dirty
  };

  const handleAddAdvisor = () => {
    if (newAdvisor.user_id > 0 || newAdvisor.customName) {
      setFormData(prev => ({
        ...prev,
        advisors: [...(prev.advisors || []), { ...newAdvisor }]
      }));
      setNewAdvisor({ user_id: 0, role: 'MAIN', customName: undefined });
      setIsDirty(true); // Mark form as dirty
    }
  };

  const handleRemoveAdvisor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      advisors: prev.advisors?.filter((_, i) => i !== index) || []
    }));
    setIsDirty(true); // Mark form as dirty
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setIsDirty(true); // Mark form as dirty
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true); // Mark form as dirty
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
      if (!projectId) {
        setError('Project ID not found');
        return;
      }

      // Update the project first
      await apiService.updateProject(projectId, formData);
      setIsDirty(false); // Mark form as clean after successful submission

      // If files are selected, upload them
      if (selectedFiles.length > 0) {
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {

            const uploadResponse = await apiService.uploadFile(projectId, file, true);
            
            uploadedCount++;
          } catch (uploadError: any) {
            console.error(`❌ File upload failed for ${file.name}:`, uploadError);
            console.error('Error details:', uploadError.response?.data);
            failedCount++;
          }
        }
        
        
        if (failedCount > 0) {
          setError(`Project updated but ${failedCount} file(s) failed to upload.`);
          // Wait a bit before navigating so user can see the error
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      navigate(projectRoutes.detail(slug!));
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
      bgcolor: 'background.default',
    }}>
      <AppBar 
        position="static"
        elevation={1}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(projectRoutes.detail(slug!))}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1.4rem' }}>
            Edit Project
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Container */}
      <Container 
        maxWidth="lg" 
        sx={{ flex: 1, pt: 8, pb: 4, px: 4 }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={5}>
            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={(theme) => ({ 
                  p: 5,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.primary.main}`,
                  bgcolor: 'background.paper',
                  mb: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
                    transform: 'translateY(-2px)',
                  }
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={(theme) => ({ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'primary.main',
                    mr: 3,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                  })}>
                    <SchoolIcon sx={{ color: 'primary.contrastText', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: 'primary.dark', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                  }}>
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="program-label">Program</InputLabel>
                      <Select
                        labelId="program-label"
                        value={formData.program_id}
                        label="Program"
                        onChange={(e) => handleInputChange('program_id', e.target.value)}
                      >
                        {(programs || []).map((program) => (
                          <MenuItem key={program.id} value={program.id}>
                            {program.name} - {program.department?.name}
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
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      placeholder="2024-2025"
                      value={formData.academic_year}
                      onChange={(e) => handleInputChange('academic_year', e.target.value)}
                      required
                      helperText="Format: YYYY-YYYY"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="semester-label">Semester</InputLabel>
                      <Select
                        labelId="semester-label"
                        value={formData.semester}
                        label="Semester"
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                      >
                        <MenuItem value="fall">Fall</MenuItem>
                        <MenuItem value="spring">Spring</MenuItem>
                        <MenuItem value="summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="status-label">Project Status</InputLabel>
                      <Select
                        labelId="status-label"
                        value={formData.status || 'draft'}
                        label="Project Status"
                        onChange={(e) => handleInputChange('status', e.target.value)}
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

            {/* Keywords Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={(theme) => ({ 
                  p: 5,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.success.main}`,
                  bgcolor: 'background.paper',
                  mb: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.18)}`,
                    transform: 'translateY(-2px)',
                  }
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={(theme) => ({ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'success.main',
                    mr: 3,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`
                  })}>
                    <DescriptionIcon sx={{ color: 'success.contrastText', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: 'success.dark', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                  }}>
                    Keywords & Tags
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    label="Keyword"
                    placeholder="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    sx={{ minWidth: 200 }}
                  />
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    startIcon={<AddIcon />}
                    sx={{ fontWeight: 600 }}
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
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Team Section */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                elevation={0} 
                sx={(theme) => ({ 
                  p: 5,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.warning.main}`,
                  bgcolor: 'background.paper',
                  mb: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 12px 40px ${alpha(theme.palette.warning.main, 0.18)}`,
                    transform: 'translateY(-2px)',
                  }
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={(theme) => ({ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'warning.main',
                    mr: 3,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.3)}`
                  })}>
                    <PersonIcon sx={{ color: 'warning.contrastText', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: 'warning.dark', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                  }}>
                    Project Team
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  {/* Members */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'warning.main', mb: 2 }}>
                      Project Members
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ flexGrow: 1 }}
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
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel id="member-role-label">Role</InputLabel>
                        <Select
                          labelId="member-role-label"
                          value={newMember.role}
                          label="Role"
                          onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                        >
                          <MenuItem value="LEAD">Lead</MenuItem>
                          <MenuItem value="MEMBER">Member</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleAddMember}
                        disabled={newMember.user_id === 0 && !newMember.customName}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 100, fontWeight: 600 }}
                      >
                        Add
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
                            bgcolor: 'background.paper',
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
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'warning.main', mb: 2 }}>
                      Project Advisors (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ flexGrow: 1 }}
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
                          />
                        )}
                      />
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel id="advisor-role-label">Role</InputLabel>
                        <Select
                          labelId="advisor-role-label"
                          value={newAdvisor.role}
                          label="Role"
                          onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                        >
                          <MenuItem value="MAIN">Main Advisor</MenuItem>
                          <MenuItem value="CO_ADVISOR">Co-Advisor</MenuItem>
                          <MenuItem value="REVIEWER">Reviewer</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleAddAdvisor}
                        disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 100, fontWeight: 600 }}
                      >
                        Add
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
                            bgcolor: 'background.paper',
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
                sx={(theme) => ({ 
                  p: 5,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.secondary.main}`,
                  bgcolor: 'background.paper',
                  mb: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.18)}`,
                    transform: 'translateY(-2px)',
                  }
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={(theme) => ({ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'secondary.main',
                    mr: 3,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                  })}>
                    <AttachFileIcon sx={{ color: 'secondary.contrastText', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ 
                    color: 'secondary.dark', 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                  }}>
                    Project Files (Optional)
                  </Typography>
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
                      variant="outlined"
                      color="secondary"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2, fontWeight: 600, px: 3, py: 1.5 }}
                    >
                      Upload Files
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 500 }}>
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
                            bgcolor: 'background.paper',
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

          {/* Sticky Footer */}
          <Paper 
            elevation={0} 
            sx={{ 
              position: 'sticky', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 4,
              mt: 8,
              bgcolor: 'background.paper',
              borderTop: 3,
              borderColor: 'divider',
              borderRadius: '16px 16px 0 0',
              boxShadow: 6,
              zIndex: 4,
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', maxWidth: 'lg', mx: 'auto' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(projectRoutes.detail(slug!))}
                disabled={loading}
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                size="large"
                sx={{ minWidth: 180, px: 4, py: 1.5 }}
              >
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </Box>
          </Paper>
        </form>
      </Container>

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmDialog
        open={showUnsavedDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={confirmNavigation}
        onClose={cancelNavigation}
        severity="warning"
      />
    </Box>
  );
};
