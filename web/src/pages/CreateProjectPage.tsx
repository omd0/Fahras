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
  const [newMember, setNewMember] = useState({ user_id: 0, role: 'MEMBER' as 'LEAD' | 'MEMBER' });
  const [newAdvisor, setNewAdvisor] = useState({ user_id: 0, role: 'MAIN' as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { user } = useAuthStore();
  const navigate = useNavigate();

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
    if (newMember.user_id > 0) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember }]
      }));
      setNewMember({ user_id: 0, role: 'MEMBER' });
    }
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleAddAdvisor = () => {
    if (newAdvisor.user_id > 0) {
      setFormData(prev => ({
        ...prev,
        advisors: [...(prev.advisors || []), { ...newAdvisor }]
      }));
      setNewAdvisor({ user_id: 0, role: 'MAIN' });
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

      // Create the project first
      const createdProject = await apiService.createProject(projectData);

      // If files are selected, upload them
      if (selectedFiles.length > 0 && createdProject?.project?.id) {
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        try {
          await apiService.uploadProjectFiles(createdProject.project.id, formData);
        } catch (uploadError) {
          console.warn('Project created but file upload failed:', uploadError);
          // Don't fail the entire operation if file upload fails
        }
      }

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create New Project
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={4}>
            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SchoolIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" component="h2">
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
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

                  <Grid size={{ xs: 12, md: 6 }}>
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

                  <Grid size={{ xs: 12, md: 6 }}>
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
                </Grid>
              </Paper>
            </Grid>

            {/* Keywords Section */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" component="h2">
                    Keywords & Tags
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    sx={{ minWidth: 200 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    startIcon={<AddIcon />}
                  >
                    Add Keyword
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(formData.keywords || []).map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Team Section */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" component="h2">
                    Project Team
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {/* Members */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Project Members
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ flexGrow: 1 }}
                        options={users}
                        getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                        value={users.find(u => u.id === newMember.user_id) || null}
                        onChange={(_, value) => setNewMember(prev => ({ ...prev, user_id: value?.id || 0 }))}
                        renderInput={(params) => <TextField {...params} label="Select Member" />}
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
                        onClick={handleAddMember}
                        disabled={newMember.user_id === 0}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 100 }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {(formData.members || []).map((member, index) => {
                        const user = users.find(u => u.id === member.user_id);
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
                              {user?.full_name} <Chip label={member.role} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
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
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Project Advisors (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Autocomplete
                        sx={{ flexGrow: 1 }}
                        options={users}
                        getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                        value={users.find(u => u.id === newAdvisor.user_id) || null}
                        onChange={(_, value) => setNewAdvisor(prev => ({ ...prev, user_id: value?.id || 0 }))}
                        renderInput={(params) => <TextField {...params} label="Select Advisor" />}
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
                        onClick={handleAddAdvisor}
                        disabled={newAdvisor.user_id === 0}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 100 }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {(formData.advisors || []).map((advisor, index) => {
                        const user = users.find(u => u.id === advisor.user_id);
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
                              {user?.full_name} <Chip label={advisor.role} size="small" color="secondary" variant="outlined" sx={{ ml: 1 }} />
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
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AttachFileIcon2 color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" component="h2">
                    Project Files (Optional)
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
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
                      sx={{ mb: 1 }}
                    >
                      Upload Files
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX
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

          {/* Sticky Footer */}
          <Paper 
            elevation={8} 
            sx={{ 
              position: 'sticky', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 2, 
              mt: 4,
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', maxWidth: 'lg', mx: 'auto' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                size="large"
                sx={{ minWidth: 160 }}
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
