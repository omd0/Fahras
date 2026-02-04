'use client';

import { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useLanguage } from '@/providers/LanguageContext';
import type { CreateProjectData, Program, User } from '@/types';
import { apiService } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandling';
import { projectRoutes } from '@/utils/projectRoutes';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { ConfirmDialog, DragDropFileUpload } from '@/components/shared';
import { ProjectBasicInfoForm } from '@/features/projects/components/ProjectBasicInfoForm';
import { MemberManagementForm } from '@/features/projects/components/MemberManagementForm';

export default function EditProjectPage() {
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
  const [projectId, setProjectId] = useState<number | null>(null);
  const initializedRef = useRef(false);

  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { t } = useLanguage();

  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChanges({
    isDirty,
    message: 'You have unsaved changes. Are you sure you want to leave without saving?',
    enableBeforeUnload: true,
  });

  useEffect(() => {
    if (user?.roles?.some((role) => role.name === 'reviewer')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (initializedRef.current || !slug) return;
    initializedRef.current = true;

    const fetchAllData = async () => {
      try {
        setInitialLoading(true);
        const [projectResponse, programsData, usersData] = await Promise.all([
          apiService.getProject(slug),
          apiService.getPrograms(),
          apiService.getUsers(),
        ]);

        const project = projectResponse.project;
        setProjectId(project.id);
        setFormData({
          program_id: project.program_id,
          title: project.title,
          abstract: project.abstract,
          keywords: project.keywords || [],
          academic_year: project.academic_year,
          semester: project.semester,
          status: project.status,
          members: (project.members || []).map((member: { is_custom?: boolean; id?: number; full_name?: string; pivot: { role_in_project: 'LEAD' | 'MEMBER' } }) => ({
            user_id: member.is_custom ? 0 : (member.id || 0),
            role: member.pivot.role_in_project,
            customName: member.is_custom ? member.full_name : undefined,
          })),
          advisors: (project.advisors || []).map((advisor: { is_custom?: boolean; id?: number; full_name?: string; pivot: { advisor_role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' } }) => ({
            user_id: advisor.is_custom ? 0 : (advisor.id || 0),
            role: advisor.pivot.advisor_role,
            customName: advisor.is_custom ? advisor.full_name : undefined,
          })),
        });

        setPrograms(programsData || []);
        setUsers(usersData || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load project'));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [slug]);

  const handleInputChange = (field: keyof CreateProjectData, value: CreateProjectData[keyof CreateProjectData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!projectId) {
        setError('Project ID not found');
        return;
      }

      await apiService.updateProject(projectId, formData);
      setIsDirty(false);

      if (selectedFiles.length > 0) {
        let failedCount = 0;

        for (const file of selectedFiles) {
          try {
            await apiService.uploadFile(projectId, file, true);
          } catch (uploadError) {
            console.error(`File upload failed for ${file.name}:`, uploadError);
            failedCount++;
          }
        }

        if (failedCount > 0) {
          setError(`Project updated but ${failedCount} file(s) failed to upload.`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      router.push(projectRoutes.detail(slug!));
    } catch (err) {
      console.error('Project update failed:', err);
      setError(getErrorMessage(err, 'Failed to update project'));
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
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
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
          onClick={() => router.push(projectRoutes.detail(slug!))}
          sx={{ fontWeight: 600 }}
        >
          {t('Back')}
        </Button>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1.4rem' }}>
          {t('Edit Project')}
        </Typography>
      </Paper>

      <Container maxWidth="lg" sx={{ flex: 1, pt: 4, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Grid container spacing={5}>
            <ProjectBasicInfoForm
              formData={formData}
              programs={programs}
              newKeyword={newKeyword}
              showStatus
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
              currentUserId={user?.id}
              onNewMemberChange={setNewMember}
              onNewAdvisorChange={setNewAdvisor}
              onAddMember={handleAddMember}
              onAddAdvisor={handleAddAdvisor}
              onRemoveMember={handleRemoveMember}
              onRemoveAdvisor={handleRemoveAdvisor}
            />

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
                  },
                })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'secondary.main',
                      mr: 3,
                      boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    })}
                  >
                    <AttachFileIcon sx={{ color: 'secondary.contrastText', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ color: 'secondary.dark', fontWeight: 700, fontSize: '1.3rem' }}>
                    {t('Project Files (Optional)')}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
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
            </Grid>
          </Grid>

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
                onClick={() => router.push(projectRoutes.detail(slug!))}
                disabled={loading}
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                size="large"
                sx={{ minWidth: 180, px: 4, py: 1.5 }}
              >
                {loading ? t('Updating...') : t('Update Project')}
              </Button>
            </Box>
          </Paper>
        </form>
      </Container>

      <ConfirmDialog
        open={showUnsavedDialog}
        title={t('Unsaved Changes')}
        message={t('You have unsaved changes. Are you sure you want to leave without saving?')}
        confirmText={t('Leave')}
        cancelText={t('Stay')}
        onConfirm={confirmNavigation}
        onClose={cancelNavigation}
        severity="warning"
      />
    </Box>
  );
}
