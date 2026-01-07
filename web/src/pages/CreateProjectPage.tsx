import React, { useState, useEffect, useRef } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Skeleton,
  Snackbar,
  InputAdornment,
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
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { CreateProjectData, Program, User } from '../types';
import { apiService } from '../services/api';
import { ProgramTemplateSelector } from '../components/milestone-templates/ProgramTemplateSelector';

const steps = ['Basic Information', 'Keywords & Tags', 'Project Team', 'Files & Review'];

export const CreateProjectPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
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
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState('');
  const [newMember, setNewMember] = useState({ user_id: 0, role: 'MEMBER' as 'LEAD' | 'MEMBER', customName: undefined as string | undefined });
  const [newAdvisor, setNewAdvisor] = useState({ user_id: 0, role: 'MAIN' as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER', customName: undefined as string | undefined });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect reviewers and admins away from this page
  useEffect(() => {
    if (user?.roles?.some(role => role.name === 'reviewer' || role.name === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Calculate current academic year and semester
  const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    
    // Academic year typically starts in fall (August/September)
    // If we're in Jan-July, we're in the second half of the academic year
    // If we're in Aug-Dec, we're in the first half of the next academic year
    if (month >= 8) {
      // August-December: Current year to next year (e.g., 2024-2025)
      return `${year}-${year + 1}`;
    } else {
      // January-July: Previous year to current year (e.g., 2023-2024)
      return `${year - 1}-${year}`;
    }
  };

  const getCurrentSemester = (): 'fall' | 'spring' | 'summer' => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    
    // Fall: August-December (months 8-12)
    // Spring: January-May (months 1-5)
    // Summer: June-July (months 6-7)
    if (month >= 8 || month <= 1) {
      return 'fall';
    } else if (month >= 2 && month <= 5) {
      return 'spring';
    } else {
      return 'summer';
    }
  };

  useEffect(() => {
    // Auto-set academic year and semester on mount
    const currentYear = getCurrentAcademicYear();
    const currentSemester = getCurrentSemester();
    
    // Add current user as default member (LEAD)
    const currentUserMember = user?.id ? {
      user_id: user.id,
      role: 'LEAD' as 'LEAD' | 'MEMBER',
      customName: undefined as string | undefined
    } : undefined;
    
    setFormData(prev => ({
      ...prev,
      academic_year: prev.academic_year || currentYear,
      semester: prev.semester || currentSemester,
      members: currentUserMember ? [currentUserMember] : [],
    }));
    
    fetchPrograms();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const programs = await apiService.getPrograms();
      setPrograms(programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await apiService.getUsers();
      setUsers(users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.program_id || formData.program_id === 0) {
        errors.program_id = 'Please select a program';
      }
      if (!formData.title.trim()) {
        errors.title = 'Project title is required';
      }
      if (!formData.abstract.trim()) {
        errors.abstract = 'Abstract is required';
      }
      if (!formData.academic_year.trim()) {
        errors.academic_year = 'Academic year is required';
      } else if (!/^\d{4}-\d{4}$/.test(formData.academic_year)) {
        errors.academic_year = 'Please use format YYYY-YYYY (e.g., 2024-2025)';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleStepClick = (step: number) => {
    // Allow going back to previous steps
    if (step < activeStep) {
      setActiveStep(step);
    }
  };

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
      // Focus back on input for better UX
      setTimeout(() => {
        keywordInputRef.current?.focus();
      }, 0);
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
    const memberToRemove = formData.members[index];
    // Prevent removing the creator (current user)
    if (memberToRemove.user_id === user?.id) {
      setError('You cannot remove yourself from the project. You are the project creator and lead member.');
      return;
    }
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

  const submitProject = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/630c9ee4-de4f-48c7-bd76-5eabbd1dc8d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProjectPage.tsx:313',message:'submitProject entry',data:{userId:user?.id,userEmail:user?.email,formDataMembers:formData.members},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setLoading(true);
    setError(null);

    try {
      // Ensure current user is always included as LEAD member
      const currentUserMember = {
        user_id: user?.id || 0,
        role: 'LEAD' as 'LEAD' | 'MEMBER',
        customName: undefined as string | undefined
      };

      // Check if current user is already in members list
      const isCreatorInMembers = formData.members.some(
        member => member.user_id === user?.id
      );

      // If creator is not in members, add them as LEAD
      // If they are in members, ensure they have LEAD role
      let membersToSubmit = [...formData.members];
      
      if (!isCreatorInMembers) {
        // Add creator as first member (LEAD)
        membersToSubmit = [currentUserMember, ...membersToSubmit];
      } else {
        // Update creator's role to LEAD if they're already in the list
        membersToSubmit = membersToSubmit.map(member => 
          member.user_id === user?.id 
            ? { ...member, role: 'LEAD' as 'LEAD' | 'MEMBER' }
            : member
        );
        // Move creator to first position
        const creatorIndex = membersToSubmit.findIndex(m => m.user_id === user?.id);
        if (creatorIndex > 0) {
          const creator = membersToSubmit.splice(creatorIndex, 1)[0];
          membersToSubmit.unshift(creator);
        }
      }

      const projectData = {
        ...formData,
        members: membersToSubmit
      };

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/630c9ee4-de4f-48c7-bd76-5eabbd1dc8d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProjectPage.tsx:357',message:'projectData before API call',data:{projectData:JSON.stringify(projectData),membersCount:membersToSubmit.length,creatorInMembers:membersToSubmit[0]?.user_id===user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Create the project first
      const createdProject = await apiService.createProject(projectData);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/630c9ee4-de4f-48c7-bd76-5eabbd1dc8d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProjectPage.tsx:360',message:'createProject API response',data:{projectId:createdProject?.project?.id,createdByUserId:createdProject?.project?.created_by_user_id,projectTitle:createdProject?.project?.title,membersCount:createdProject?.project?.members?.length,responseKeys:Object.keys(createdProject||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Apply milestone template if one was selected
      if (selectedTemplateId && createdProject?.project?.id) {
        try {
          const startDate = new Date().toISOString().split('T')[0]; // Today's date
          await apiService.applyTemplateToProject(
            selectedTemplateId,
            createdProject.project.id,
            startDate,
            false // Don't preserve custom milestones (project is new)
          );
        } catch (templateError: any) {
          console.error('Failed to apply template:', templateError);
          // Don't fail the whole creation if template application fails
          setError(`Project created successfully, but failed to apply milestone template: ${templateError.response?.data?.message || templateError.message}`);
        }
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/630c9ee4-de4f-48c7-bd76-5eabbd1dc8d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProjectPage.tsx:379',message:'project creation success path',data:{hasProject:!!createdProject,projectId:createdProject?.project?.id,createdBy:createdProject?.project?.created_by_user_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // If files are selected, upload them individually
      if (selectedFiles.length > 0 && createdProject?.project?.id) {
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: new Date(file.lastModified).toISOString()
            });
            
            const uploadResponse = await apiService.uploadFile(createdProject.project.id, file, true);
            
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
        
        
        if (failedCount > 0) {
          setError(`Project created but ${failedCount} file(s) failed to upload. Please try re-uploading them from the project page.`);
          // Wait a bit before navigating so user can see the error
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } else if (selectedFiles.length > 0) {
        console.warn('Files were selected but project ID is missing!', createdProject);
      }

      setSuccessMessage('Project created successfully!');
      // Navigate after a short delay to show success message
      setTimeout(() => {
        // Navigate to dashboard with a timestamp to force refresh
        // This ensures the project list is refreshed when returning to dashboard
        navigate('/dashboard', { 
          replace: true,
          state: { refresh: true, timestamp: Date.now() }
        });
      }, 1500);
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/630c9ee4-de4f-48c7-bd76-5eabbd1dc8d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProjectPage.tsx:error',message:'project creation error',data:{errorMessage:error?.message,errorStatus:error?.response?.status,errorData:error?.response?.data,hasResponse:!!error?.response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Project creation failed:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await submitProject();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <InfoIcon color="primary" sx={{ mr: 1.5, fontSize: '2rem' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ProgramTemplateSelector
                  programId={formData.program_id}
                  selectedTemplateId={selectedTemplateId}
                  onTemplateSelect={setSelectedTemplateId}
                  onProgramSelect={(programId) => handleInputChange('program_id', programId || 0)}
                  programs={programs}
                />
                {validationErrors.program_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {validationErrors.program_id}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  error={!!validationErrors.title}
                  helperText={validationErrors.title || "Enter a clear and descriptive title for your project"}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Abstract"
                  multiline
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  required
                  error={!!validationErrors.abstract}
                  helperText={validationErrors.abstract || "Provide a comprehensive overview of your project's objectives, methodology, and expected outcomes"}
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
                  error={!!validationErrors.academic_year}
                  helperText={validationErrors.academic_year || "Format: YYYY-YYYY"}
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
        );

      case 1:
        return (
          <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon color="primary" sx={{ mr: 1.5, fontSize: '2rem' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Keywords & Tags
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField
                inputRef={keywordInputRef}
                size="medium"
                placeholder={t('Add keyword')}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                sx={{ flexGrow: 1, minWidth: 200 }}
              />
              <Button
                variant="contained"
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                startIcon={<AddIcon />}
                sx={{ minWidth: 140 }}
              >
                {t('Add Keyword')}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {(formData.keywords || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No keywords added yet. Add keywords to help others discover your project.
                </Typography>
              ) : (
                (formData.keywords || []).map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                ))
              )}
            </Box>
          </Paper>
        );

      case 2:
        return (
          <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="primary" sx={{ mr: 1.5, fontSize: '2rem' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {t('Project Team')}
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('Project Members')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                  <Autocomplete
                    sx={{ flexGrow: 1 }}
                    freeSolo
                    options={users}
                    loading={loadingUsers}
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
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {typeof option !== 'string' ? option.full_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {typeof option !== 'string' ? option.full_name : option}
                          </Typography>
                          {typeof option !== 'string' && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={t('Select or Type Member Name')}
                      />
                    )}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel id="member-role-label">{t('Role')}</InputLabel>
                    <Select
                      labelId="member-role-label"
                      value={newMember.role}
                      label={t('Role')}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                    >
                      <MenuItem value="LEAD">{t('Lead')}</MenuItem>
                      <MenuItem value="MEMBER">{t('Member')}</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleAddMember}
                    disabled={newMember.user_id === 0 && !newMember.customName}
                    startIcon={<AddIcon />}
                    sx={{ minWidth: 100 }}
                  >
                    {t('Add')}
                  </Button>
                </Box>
                <List>
                  {(formData.members || []).map((member, index) => {
                    const isCreator = member.user_id === user?.id;
                    // For the creator, use the user from auth store directly
                    // For other members, look them up in the users array
                    const memberUser = isCreator ? user : users.find(u => u.id === member.user_id);
                    const displayName = member.customName || memberUser?.full_name || 'Unknown';
                    return (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: isCreator ? 'primary.main' : 'primary.light' }}>
                            {displayName.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{displayName}</Typography>
                              {isCreator && (
                                <Chip 
                                  label="Creator" 
                                  size="small" 
                                  color="primary" 
                                  variant="filled"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={<Chip label={member.role} size="small" color="primary" variant="outlined" />}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveMember(index)}
                            aria-label="Remove member"
                            color="error"
                            disabled={isCreator}
                            title={isCreator ? 'You cannot remove yourself as the project creator' : 'Remove member'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Project Advisors (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                  <Autocomplete
                    sx={{ flexGrow: 1 }}
                    freeSolo
                    options={users}
                    loading={loadingUsers}
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
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                          {typeof option !== 'string' ? option.full_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {typeof option !== 'string' ? option.full_name : option}
                          </Typography>
                          {typeof option !== 'string' && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
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
                    variant="contained"
                    onClick={handleAddAdvisor}
                    disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                    startIcon={<AddIcon />}
                    sx={{ minWidth: 100 }}
                  >
                    {t('Add')}
                  </Button>
                </Box>
                <List>
                  {(formData.advisors || []).map((advisor, index) => {
                    const user = users.find(u => u.id === advisor.user_id);
                    const displayName = advisor.customName || user?.full_name || 'Unknown';
                    return (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {displayName.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={displayName}
                          secondary={<Chip label={advisor.role} size="small" color="secondary" variant="outlined" />}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveAdvisor(index)}
                            aria-label="Remove advisor"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            </Grid>
          </Paper>
        );

      case 3:
        return (
          <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AttachFileIcon color="primary" sx={{ mr: 1.5, fontSize: '2rem' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Project Files (Optional)
              </Typography>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
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
                      sx={{ mb: 2 }}
                      fullWidth
                    >
                      Upload Files
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GitHub URL"
                  placeholder="https://github.com/username/repository"
                  value={formData.github_url || ''}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Optional: Link to your project's GitHub repository"
                />
              </Grid>
            </Grid>
            
            {selectedFiles.length > 0 && (
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <AttachFileIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(index)}
                        aria-label="Remove file"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Review Your Project
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2"><strong>Title:</strong> {formData.title || 'Not set'}</Typography>
                <Typography variant="body2"><strong>Program:</strong> {programs.find(p => p.id === formData.program_id)?.name || 'Not selected'}</Typography>
                <Typography variant="body2"><strong>Academic Year:</strong> {formData.academic_year || 'Not set'}</Typography>
                <Typography variant="body2"><strong>Semester:</strong> {formData.semester}</Typography>
                <Typography variant="body2"><strong>Keywords:</strong> {(formData.keywords || []).length} added</Typography>
                <Typography variant="body2"><strong>Members:</strong> {(formData.members || []).length}</Typography>
                <Typography variant="body2"><strong>Advisors:</strong> {(formData.advisors || []).length}</Typography>
                <Typography variant="body2"><strong>Files:</strong> {selectedFiles.length}</Typography>
                <Typography variant="body2"><strong>GitHub URL:</strong> {formData.github_url || 'Not provided'}</Typography>
              </Stack>
            </Box>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            aria-label="Go back to dashboard"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {t('Create New Project')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Snackbar
            open={!!successMessage}
            autoHideDuration={3000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </Snackbar>
        )}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label} completed={index < activeStep}>
                <StepLabel 
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: index < activeStep ? 'pointer' : 'default' }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit} noValidate>
            {renderStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<NavigateBeforeIcon />}
                variant="outlined"
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      submitProject();
                    }}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                    size="large"
                    sx={{ minWidth: 180 }}
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<NavigateNextIcon />}
                    size="large"
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}; 
