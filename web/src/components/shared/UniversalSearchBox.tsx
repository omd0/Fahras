import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Autocomplete,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { DashboardTheme } from '../../config/dashboardThemes';

interface SearchFilters {
  search: string;
  status: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  is_public: boolean | null;
  sort_by: string;
  sort_order: string;
  admin_approval_status?: string;
  created_by_user_id?: string;
  advisor_id?: string;
  title_search?: string;
  academic_year_filter?: string;
}

interface UniversalSearchBoxProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  theme: DashboardTheme;
  variant?: 'default' | 'compact' | 'expanded';
  showAdvancedFilters?: boolean;
  roleSpecificFilters?: {
    showAdminApproval?: boolean;
    showCreatorFilter?: boolean;
    showAdvisorFilter?: boolean;
    showPublicFilter?: boolean;
  };
  placeholder?: string;
}

export const UniversalSearchBox: React.FC<UniversalSearchBoxProps> = ({
  onSearch,
  onClear,
  loading = false,
  theme,
  variant = 'default',
  showAdvancedFilters = true,
  roleSpecificFilters = {},
  placeholder = "Search projects, users, or content...",
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: '',
    program_id: '',
    department_id: '',
    academic_year: '',
    semester: '',
    is_public: null,
    sort_by: 'updated_at',
    sort_order: 'desc',
    admin_approval_status: '',
    created_by_user_id: '',
    advisor_id: '',
    title_search: '',
    academic_year_filter: '',
  });

  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    if (roleSpecificFilters?.showCreatorFilter || roleSpecificFilters?.showAdvisorFilter) {
      fetchUsers();
    }
  }, [roleSpecificFilters]);

  const fetchPrograms = async () => {
    try {
      const response = await apiService.getPrograms();
      setPrograms(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiService.getProjectSuggestions(query);
      setSuggestions(response.suggestions || response || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      search: '',
      status: '',
      program_id: '',
      department_id: '',
      academic_year: '',
      semester: '',
      is_public: null,
      sort_by: 'updated_at',
      sort_order: 'desc',
      admin_approval_status: '',
      created_by_user_id: '',
      advisor_id: '',
      title_search: '',
      academic_year_filter: '',
    });
    onClear();
  };

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    if (field === 'search' && value) {
      fetchSuggestions(value);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.program_id) count++;
    if (filters.department_id) count++;
    if (filters.academic_year) count++;
    if (filters.semester) count++;
    if (filters.is_public !== null) count++;
    if (filters.admin_approval_status) count++;
    if (filters.created_by_user_id) count++;
    if (filters.advisor_id) count++;
    if (filters.title_search) count++;
    if (filters.academic_year_filter) count++;
    return count;
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
  ];

  const adminApprovalOptions = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hidden', label: 'Hidden' },
  ];

  const semesterOptions = [
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'academic_year', label: 'Academic Year' },
  ];

  // Generate academic year options from 2000 to 2025
  const academicYearOptions = Array.from({ length: 26 }, (_, i) => {
    const year = 2000 + i;
    return { value: year.toString(), label: year.toString() };
  });

  // Compact variant for smaller spaces
  if (variant === 'compact') {
    return (
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: `2px solid ${theme.primary}20`,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: theme.appBarGradient,
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.primary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                  borderWidth: '2px',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                  borderWidth: '2px',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              background: theme.appBarGradient,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              },
              '&:disabled': {
                opacity: 0.6,
                transform: 'none',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <SearchIcon sx={{ fontSize: 20 }} />
          </Button>
          {showAdvancedFilters && (
            <IconButton
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{ 
                color: theme.primary,
                backgroundColor: `${theme.primary}10`,
                '&:hover': {
                  backgroundColor: `${theme.primary}20`,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
              sx={{
                borderColor: theme.primary,
                color: theme.primary,
                minWidth: 'auto',
                px: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                '&:hover': {
                  borderColor: theme.primary,
                  backgroundColor: `${theme.primary}10`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ClearIcon sx={{ fontSize: 18 }} />
            </Button>
          )}
        </Box>

        {showAdvancedFilters && (
          <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort_by}
                    label="Sort By"
                    onChange={(e) => handleInputChange('sort_by', e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditional Input: Title Search */}
              {filters.sort_by === 'title' && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title Search"
                    placeholder="Enter title to search for"
                    value={filters.title_search || ''}
                    onChange={(e) => handleInputChange('title_search', e.target.value)}
                  />
                </Grid>
              )}

              {/* Conditional Input: Academic Year Filter */}
              {filters.sort_by === 'academic_year' && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Academic Year</InputLabel>
                    <Select
                      value={filters.academic_year_filter || ''}
                      label="Academic Year"
                      onChange={(e) => handleInputChange('academic_year_filter', e.target.value)}
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {academicYearOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {roleSpecificFilters?.showAdminApproval && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Approval Status</InputLabel>
                    <Select
                      value={filters.admin_approval_status || ''}
                      label="Approval Status"
                      onChange={(e) => handleInputChange('admin_approval_status', e.target.value)}
                    >
                      <MenuItem value="">All Approval Statuses</MenuItem>
                      {adminApprovalOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Collapse>
        )}
      </Paper>
    );
  }

  // Default variant
  return (
    <Paper sx={{ 
      p: 4, 
      mb: 3,
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: `2px solid ${theme.primary}20`,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: theme.appBarGradient,
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
          mr: 2,
        }}>
          <SearchIcon sx={{ color: theme.primary, fontSize: 24 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>
          Search & Filter
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {showAdvancedFilters && (
          <IconButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ 
              color: theme.primary,
              backgroundColor: `${theme.primary}10`,
              mr: 1,
              '&:hover': {
                backgroundColor: `${theme.primary}20`,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
        {getActiveFiltersCount() > 0 && (
          <Chip
            icon={<FilterIcon />}
            label={`${getActiveFiltersCount()} filters active`}
            sx={{
              background: theme.appBarGradient,
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Enhanced Main Search Input */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            freeSolo
            options={suggestions || []}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.title || option
            }
            value={filters.search}
            onInputChange={(event, newValue) => {
              handleInputChange('search', newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                placeholder={placeholder}
                fullWidth
                onKeyPress={handleKeyPress}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.primary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.primary,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.primary,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: theme.textPrimary }}>
                    {option.title || option}
                  </Typography>
                  {option.academic_year && (
                    <Typography variant="caption" color="text.secondary">
                      {option.academic_year} • {option.semester}
                    </Typography>
                  )}
                </Box>
              </li>
            )}
            sx={{
              '& .MuiAutocomplete-paper': {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: `1px solid ${theme.primary}20`,
              },
            }}
          />
        </Grid>

        {/* Enhanced Quick Filters */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleInputChange('status', e.target.value)}
              sx={{
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.borderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sort_by}
              label="Sort By"
              onChange={(e) => handleInputChange('sort_by', e.target.value)}
              sx={{
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.borderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.primary,
                },
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Conditional Input: Title Search */}
        {filters.sort_by === 'title' && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Title Search"
              placeholder="Enter title to search for"
              value={filters.title_search || ''}
              onChange={(e) => handleInputChange('title_search', e.target.value)}
            />
          </Grid>
        )}

        {/* Conditional Input: Academic Year Filter */}
        {filters.sort_by === 'academic_year' && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={filters.academic_year_filter || ''}
                label="Academic Year"
                onChange={(e) => handleInputChange('academic_year_filter', e.target.value)}
              >
                <MenuItem value="">All Years</MenuItem>
                {academicYearOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department_id}
                    label="Department"
                    onChange={(e) => handleInputChange('department_id', e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {(departments || []).map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Program</InputLabel>
                  <Select
                    value={filters.program_id}
                    label="Program"
                    onChange={(e) => handleInputChange('program_id', e.target.value)}
                  >
                    <MenuItem value="">All Programs</MenuItem>
                    {(programs || []).map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={filters.academic_year}
                  onChange={(e) => handleInputChange('academic_year', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={filters.semester}
                    label="Semester"
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Role-specific filters */}
              {roleSpecificFilters?.showAdminApproval && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Approval Status</InputLabel>
                    <Select
                      value={filters.admin_approval_status || ''}
                      label="Approval Status"
                      onChange={(e) => handleInputChange('admin_approval_status', e.target.value)}
                    >
                      <MenuItem value="">All Approval Statuses</MenuItem>
                      {adminApprovalOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {roleSpecificFilters?.showCreatorFilter && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Creator</InputLabel>
                    <Select
                      value={filters.created_by_user_id}
                      label="Creator"
                      onChange={(e) => handleInputChange('created_by_user_id', e.target.value)}
                    >
                      <MenuItem value="">All Creators</MenuItem>
                      {(users || []).map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {roleSpecificFilters?.showAdvisorFilter && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Advisor</InputLabel>
                    <Select
                      value={filters.advisor_id}
                      label="Advisor"
                      onChange={(e) => handleInputChange('advisor_id', e.target.value)}
                    >
                      <MenuItem value="">All Advisors</MenuItem>
                      {(users || []).map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {roleSpecificFilters?.showPublicFilter && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Visibility</InputLabel>
                    <Select
                      value={filters.is_public === null ? '' : filters.is_public.toString()}
                      label="Visibility"
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : e.target.value === 'true';
                        handleInputChange('is_public', value);
                      }}
                    >
                      <MenuItem value="">All Projects</MenuItem>
                      <MenuItem value="true">Public</MenuItem>
                      <MenuItem value="false">Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort Order</InputLabel>
                  <Select
                    value={filters.sort_order}
                    label="Sort Order"
                    onChange={(e) => handleInputChange('sort_order', e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        )}

        {/* Enhanced Action Buttons */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            alignItems: 'center', 
            mt: 3,
            p: 2,
            background: `linear-gradient(135deg, ${theme.primary}05, ${theme.secondary}05)`,
            borderRadius: 3,
            border: `1px solid ${theme.primary}20`,
          }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              sx={{
                background: theme.appBarGradient,
                px: 5,
                py: 2,
                fontWeight: 700,
                borderRadius: 3,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  transform: 'none',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Search Projects
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
              sx={{
                borderColor: theme.primary,
                color: theme.primary,
                px: 5,
                py: 2,
                fontWeight: 700,
                borderRadius: 3,
                fontSize: '1rem',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: theme.primary,
                  backgroundColor: `${theme.primary}10`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Clear All Filters
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  label={`${getActiveFiltersCount()} active filters`}
                  sx={{
                    background: theme.appBarGradient,
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
