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
    members: [],
    advisors: [],
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newMember, setNewMember] = useState({ user_id: 0, role: 'MEMBER' as 'LEAD' | 'MEMBER' });
  const [newAdvisor, setNewAdvisor] = useState({ user_id: 0, role: 'MAIN' as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' });

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
        members: (project.members || []).map(member => ({
          user_id: member.id,
          role: member.pivot.role_in_project
        })),
        advisors: (project.advisors || []).map(advisor => ({
          user_id: advisor.id,
          role: advisor.pivot.advisor_role
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.updateProject(parseInt(id!), formData);
      navigate(`/projects/${id}`);
    } catch (error: any) {
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
      <AppBar position="static">
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

                {/* Members */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Project Members
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Select Member</InputLabel>
                      <Select
                        value={newMember.user_id}
                        onChange={(e) => setNewMember(prev => ({ ...prev, user_id: e.target.value as number }))}
                        label="Select Member"
                      >
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'LEAD' | 'MEMBER' }))}
                        label="Role"
                      >
                        <MenuItem value="LEAD">Lead</MenuItem>
                        <MenuItem value="MEMBER">Member</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddMember}
                      disabled={newMember.user_id === 0}
                    >
                      Add Member
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {formData.members.map((member, index) => {
                      const user = users.find(u => u.id === member.user_id);
                      return (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${user?.full_name || 'Unknown'} (${member.role})`}
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
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Select Advisor</InputLabel>
                      <Select
                        value={newAdvisor.user_id}
                        onChange={(e) => setNewAdvisor(prev => ({ ...prev, user_id: e.target.value as number }))}
                        label="Select Advisor"
                      >
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newAdvisor.role}
                        onChange={(e) => setNewAdvisor(prev => ({ ...prev, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }))}
                        label="Role"
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
                      disabled={newAdvisor.user_id === 0}
                    >
                      Add Advisor
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(formData.advisors || []).map((advisor, index) => {
                      const user = users.find(u => u.id === advisor.user_id);
                      return (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${user?.full_name || 'Unknown'} (${advisor.role})`}
                            onDelete={() => handleRemoveAdvisor(index)}
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      );
                    })}
                  </Box>
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
