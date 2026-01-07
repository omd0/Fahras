import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CreateProjectData, Program, User } from '../types';
import { apiService } from '../services/api';
import { ProjectBasicInfoForm } from '../components/project/ProjectBasicInfoForm';
import { MemberManagementForm } from '../components/project/MemberManagementForm';

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
      // Update the project first
      await apiService.updateProject(parseInt(id!), formData);

      // If files are selected, upload them
      if (selectedFiles.length > 0) {
        let uploadedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            const uploadResponse = await apiService.uploadFile(parseInt(id!), file, true);

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
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      position: 'relative',
      zIndex: 1,
    }}>
      <AppBar 
        position="static"
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          color: '#FFFFFF',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(`/dashboard/projects/${id}`)}
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
            Edit Project
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Container with Clear Header Separation */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          pt: 8,
          pb: 4,
          px: 4,
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
          <Grid container spacing={5}>
            <ProjectBasicInfoForm
              formData={formData}
              programs={programs}
              newKeyword={newKeyword}
              onInputChange={handleInputChange}
              onNewKeywordChange={setNewKeyword}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
            />

            <MemberManagementForm
              members={formData.members}
              advisors={formData.advisors || []}
              users={users}
              newMember={newMember}
              newAdvisor={newAdvisor}
              onNewMemberChange={setNewMember}
              onNewAdvisorChange={setNewAdvisor}
              onAddMember={handleAddMember}
              onAddAdvisor={handleAddAdvisor}
              onRemoveMember={handleRemoveMember}
              onRemoveAdvisor={handleRemoveAdvisor}
            />

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
                    <AttachFileIcon sx={{ color: '#FFFFFF', fontSize: '1.8rem' }} />
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
                onClick={() => navigate(`/dashboard/projects/${id}`)}
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
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </Box>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};
