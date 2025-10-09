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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CreateProjectData, Program, User, Project } from '../types';
import { apiService } from '../services/api';
import { getDashboardTheme } from '../config/dashboardThemes';

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
  const dashboardTheme = getDashboardTheme(user?.roles);

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

      navigate(`/projects/${id}`);
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static"
        sx={{ 
          background: dashboardTheme.appBarGradient,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(`/projects/${id}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Edit Project
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                  />
                </Grid>

                {/* Keywords */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Add Keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddKeyword}
                      disabled={!newKeyword.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>

                {/* Academic Year and Semester */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={formData.academic_year}
                    onChange={(e) => handleInputChange('academic_year', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={formData.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                      label="Semester"
                      required
                    >
                      <MenuItem value="fall">Fall</MenuItem>
                      <MenuItem value="spring">Spring</MenuItem>
                      <MenuItem value="summer">Summer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Project Status */}
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Project Status</InputLabel>
                    <Select
                      value={formData.status || 'draft'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Project Status"
                      required
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

                {/* Members */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Project Members
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Autocomplete
                      sx={{ minWidth: 200, flexGrow: 1 }}
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
                      renderInput={(params) => <TextField {...params} label="Select or Type Member Name" size="small" />}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                        label="Role"
                        size="small"
                      >
                        <MenuItem value="LEAD">Lead</MenuItem>
                        <MenuItem value="MEMBER">Member</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddMember}
                      disabled={newMember.user_id === 0 && !newMember.customName}
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
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>

                {/* Advisors */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Project Advisors
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Autocomplete
                      sx={{ minWidth: 200, flexGrow: 1 }}
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
                      renderInput={(params) => <TextField {...params} label="Select or Type Advisor Name" size="small" />}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newAdvisor.role}
                        onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                        label="Role"
                        size="small"
                      >
                        <MenuItem value="MAIN">Main Advisor</MenuItem>
                        <MenuItem value="CO_ADVISOR">Co-Advisor</MenuItem>
                        <MenuItem value="REVIEWER">Reviewer</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddAdvisor}
                      disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
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
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>

                {/* File Upload Section */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Upload Additional Files
                  </Typography>
                  <Box sx={{ mb: 2 }}>
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
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 1 }}
                      >
                        Upload Files
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX (No size limit)
                    </Typography>
                  </Box>
                  
                  {selectedFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Files ({selectedFiles.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/projects/${id}`)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Project'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
