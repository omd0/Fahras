'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import type { CreateProjectData, Program, User } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { ConfirmDialog, DragDropFileUpload } from '@/components/shared';
import { ProjectBasicInfoForm } from '@/features/projects/components/ProjectBasicInfoForm';
import { MemberManagementForm } from '@/features/projects/components/MemberManagementForm';

const steps = ['Basic Information', 'Project Team', 'Files & Review'];

export default function CreateProjectPage() {
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState('');
  const [newMember, setNewMember] = useState<{ user_id: number; role: 'LEAD' | 'MEMBER'; customName?: string }>({
    user_id: 0,
    role: 'MEMBER',
    customName: undefined,
  });
  const [newAdvisor, setNewAdvisor] = useState<{ user_id: number; role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER'; customName?: string }>({
    user_id: 0,
    role: 'MAIN',
    customName: undefined,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const initializedRef = useRef(false);

  const { user } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();

  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChanges({
    isDirty,
    message: 'You have unsaved changes. Are you sure you want to leave without creating the project?',
    enableBeforeUnload: true,
  });

  useEffect(() => {
    if (user?.roles?.some((role) => role.name === 'reviewer' || role.name === 'admin')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const getCurrentAcademicYear = useCallback((): string => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    if (month >= 8) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  }, []);

  const getCurrentSemester = useCallback((): 'fall' | 'spring' | 'summer' => {
    const month = new Date().getMonth() + 1;
    if (month >= 8 || month <= 1) return 'fall';
    if (month >= 2 && month <= 5) return 'spring';
    return 'summer';
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const currentYear = getCurrentAcademicYear();
    const currentSemester = getCurrentSemester();

    const currentUserMember = user?.id
      ? { user_id: user.id, role: 'LEAD' as const, customName: undefined }
      : undefined;

    setFormData((prev) => ({
      ...prev,
      academic_year: prev.academic_year || currentYear,
      semester: prev.semester || currentSemester,
      members: currentUserMember ? [currentUserMember] : [],
    }));

    const fetchData = async () => {
      try {
        const [programsData, usersData] = await Promise.all([
          apiService.getPrograms(),
          apiService.getUsers(),
        ]);
        setPrograms(programsData || []);
        setUsers(usersData || []);
      } catch (err) {
        console.error('Failed to fetch form data:', err);
        setPrograms([]);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [user, getCurrentAcademicYear, getCurrentSemester]);

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
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (step: number) => {
    if (step < activeStep) {
      setActiveStep(step);
    }
  };

  const handleInputChange = (field: keyof CreateProjectData, value: CreateProjectData[keyof CreateProjectData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !(formData.keywords || []).includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()],
      }));
      setNewKeyword('');
      setIsDirty(true);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k) => k !== keyword),
    }));
    setIsDirty(true);
  };

  const handleAddMember = () => {
    if (newMember.user_id > 0 || newMember.customName) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, { ...newMember }],
      }));
      setNewMember({ user_id: 0, role: 'MEMBER', customName: undefined });
      setIsDirty(true);
    }
  };

  const handleRemoveMember = (index: number) => {
    const memberToRemove = formData.members[index];
    if (memberToRemove.user_id === user?.id) {
      setError('You cannot remove yourself from the project. You are the project creator and lead member.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const handleAddAdvisor = () => {
    if (newAdvisor.user_id > 0 || newAdvisor.customName) {
      setFormData((prev) => ({
        ...prev,
        advisors: [...(prev.advisors || []), { ...newAdvisor }],
      }));
      setNewAdvisor({ user_id: 0, role: 'MAIN', customName: undefined });
      setIsDirty(true);
    }
  };

  const handleRemoveAdvisor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      advisors: (prev.advisors || []).filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    setIsDirty(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const submitProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUserMember = {
        user_id: user?.id || 0,
        role: 'LEAD' as const,
        customName: undefined,
      };

      const isCreatorInMembers = formData.members.some((member) => member.user_id === user?.id);

      let membersToSubmit = [...formData.members];
      if (!isCreatorInMembers) {
        membersToSubmit = [currentUserMember, ...membersToSubmit];
      } else {
        membersToSubmit = membersToSubmit.map((member) =>
          member.user_id === user?.id ? { ...member, role: 'LEAD' as const } : member,
        );
        const creatorIndex = membersToSubmit.findIndex((m) => m.user_id === user?.id);
        if (creatorIndex > 0) {
          const creator = membersToSubmit.splice(creatorIndex, 1)[0];
          membersToSubmit.unshift(creator);
        }
      }

      const projectData = { ...formData, members: membersToSubmit };
      const createdProject = await apiService.createProject(projectData);

      if (selectedFiles.length > 0 && createdProject?.project?.id) {
        let failedCount = 0;

        for (const file of selectedFiles) {
          try {
            await apiService.uploadFile(createdProject.project.id, file, true);
          } catch (uploadError) {
            console.error(`File upload failed for ${file.name}:`, uploadError);
            failedCount++;
          }
        }

        if (failedCount > 0) {
          setError(`Project created but ${failedCount} file(s) failed to upload. Please try re-uploading them from the project page.`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      setSuccessMessage(t('Project created successfully!'));
      setIsDirty(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Project creation failed:', err);
      setError(getErrorMessage(err, 'Failed to create project'));
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
          <Grid container spacing={3}>
            <ProjectBasicInfoForm
              formData={formData}
              programs={programs}
              newKeyword={newKeyword}
              validationErrors={validationErrors}
              onInputChange={handleInputChange}
              onNewKeywordChange={setNewKeyword}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
            />
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <MemberManagementForm
              members={formData.members}
              advisors={formData.advisors || []}
              users={users}
              newMember={newMember}
              newAdvisor={newAdvisor}
              currentUserId={user?.id}
              onNewMemberChange={setNewMember}
              onNewAdvisorChange={setNewAdvisor}
              onAddMember={handleAddMember}
              onAddAdvisor={handleAddAdvisor}
              onRemoveMember={handleRemoveMember}
              onRemoveAdvisor={handleRemoveAdvisor}
            />
          </Grid>
        );

      case 2:
        return (
          <Box>
            {/* File Upload Section */}
            <Paper
              elevation={0}
              sx={(theme) => ({
                p: 4,
                mb: 3,
                borderRadius: 4,
                border: `2px solid ${theme.palette.secondary.main}`,
                bgcolor: 'background.paper',
              })}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AttachFileIcon color="secondary" sx={{ mr: 1.5, fontSize: '2rem' }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {t('Project Files (Optional)')}
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DragDropFileUpload
                    files={selectedFiles}
                    onFilesChange={handleFilesChange}
                    maxFiles={10}
                    maxSizeBytes={50 * 1024 * 1024}
                    acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx', '.xls', '.xlsx']}
                  />
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
            </Paper>

            {/* Review Section */}
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t('Review Your Project')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>{t('Title')}:</strong> {formData.title || 'Not set'}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Program')}:</strong> {(programs || []).find((p) => p.id === formData.program_id)?.name || 'Not selected'}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Academic Year')}:</strong> {formData.academic_year || 'Not set'}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Semester')}:</strong> {formData.semester}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Keywords')}:</strong> {(formData.keywords || []).length} added
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Members')}:</strong> {(formData.members || []).length}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Advisors')}:</strong> {(formData.advisors || []).length}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('Files')}:</strong> {selectedFiles.length}
                  {selectedFiles.length > 0 && ` (${selectedFiles.map((f) => formatFileSize(f.size)).join(', ')})`}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('GitHub URL')}:</strong> {formData.github_url || 'Not provided'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loadingUsers && !initializedRef.current) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Button
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard')}
          sx={{ fontWeight: 600 }}
        >
          {t('Back')}
        </Button>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {t('Create New Project')}
        </Typography>
      </Paper>

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
                  {t(label)}
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
                {t('Back')}
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
                    {loading ? t('Creating...') : t('Create Project')}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} endIcon={<NavigateNextIcon />} size="large">
                    {t('Next')}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmDialog
        open={showUnsavedDialog}
        title={t('Unsaved Changes')}
        message={t('You have unsaved changes. Are you sure you want to leave without creating the project?')}
        confirmText={t('Leave')}
        cancelText={t('Stay')}
        onConfirm={confirmNavigation}
        onClose={cancelNavigation}
        severity="warning"
      />
    </Box>
  );
}
