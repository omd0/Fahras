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

      await apiService.createProject(projectData);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Project Information
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Program Selection */}
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Program</InputLabel>
                    <Select
                      value={formData.program_id}
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

                {/* Academic Year */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    placeholder="2024-2025"
                    value={formData.academic_year}
                    onChange={(e) => handleInputChange('academic_year', e.target.value)}
                    required
                  />
                </Grid>

                {/* Semester */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={formData.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                    >
                      <MenuItem value="fall">Fall</MenuItem>
                      <MenuItem value="spring">Spring</MenuItem>
                      <MenuItem value="summer">Summer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Keywords */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Add keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddKeyword}
                      disabled={!newKeyword.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.keywords?.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        onDelete={() => handleRemoveKeyword(keyword)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Members */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Members
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete
                      sx={{ flexGrow: 1 }}
                      options={users}
                      getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                      value={users.find(u => u.id === newMember.user_id) || null}
                      onChange={(_, value) => setNewMember(prev => ({ ...prev, user_id: value?.id || 0 }))}
                      renderInput={(params) => <TextField {...params} label="Select Member" />}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newMember.role}
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
                    >
                      Add
                    </Button>
                  </Box>
                  {(formData.members || []).map((member, index) => {
                    const user = users.find(u => u.id === member.user_id);
                    return (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {user?.full_name} ({member.role})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMember(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Grid>

                {/* Advisors */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Advisors (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Autocomplete
                      sx={{ flexGrow: 1 }}
                      options={users}
                      getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                      value={users.find(u => u.id === newAdvisor.user_id) || null}
                      onChange={(_, value) => setNewAdvisor(prev => ({ ...prev, user_id: value?.id || 0 }))}
                      renderInput={(params) => <TextField {...params} label="Select Advisor" />}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newAdvisor.role}
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
                    >
                      Add
                    </Button>
                  </Box>
                  {(formData.advisors || []).map((advisor, index) => {
                    const user = users.find(u => u.id === advisor.user_id);
                    return (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {user?.full_name} ({advisor.role})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAdvisor(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading || !formData.program_id || !formData.title || !formData.abstract}
                    >
                      {loading ? 'Creating...' : 'Create Project'}
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
