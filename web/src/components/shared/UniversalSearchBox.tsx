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
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';

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
  sort_year?: string;
  sort_title?: string;
}

interface UniversalSearchBoxProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  theme?: any;
  variant?: 'compact' | 'full';
  showAdvancedFilters?: boolean;
  roleSpecificFilters?: {
    showPublicFilter?: boolean;
  };
  placeholder?: string;
}

export const UniversalSearchBox: React.FC<UniversalSearchBoxProps> = ({
  onSearch,
  onClear,
  loading = false,
  theme,
  variant = 'full',
  showAdvancedFilters = true,
  roleSpecificFilters = {},
  placeholder = "Search projects...",
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: '',
    program_id: '',
    department_id: '',
    academic_year: '',
    semester: '',
    is_public: null,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Load programs and departments
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [programsRes, departmentsRes] = await Promise.all([
          apiService.getPrograms(),
          apiService.getDepartments(),
        ]);
        setPrograms(programsRes || []);
        setDepartments(departmentsRes || []);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
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
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    onClear();
  };

  const getCurrentYear = () => new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
  ];

  const isCompact = variant === 'compact';

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: isCompact ? 2 : 3, 
        borderRadius: 2,
        background: theme?.cardBackground || 'white',
        border: `1px solid ${theme?.borderColor || '#e0e0e0'}`,
      }}
    >
      {/* Main Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: showAdvancedFilters ? 2 : 0 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: loading ? (
              <CircularProgress size={20} />
            ) : filters.search ? (
              <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                <ClearIcon />
              </IconButton>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme?.inputBackground || 'white',
            },
          }}
        />
        
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
          sx={{
            minWidth: isCompact ? 100 : 120,
            background: theme?.primaryGradient || theme?.primary,
            '&:hover': {
              background: theme?.primaryHover || theme?.primary,
            },
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={loading}
          startIcon={<ClearIcon />}
          sx={{
            minWidth: isCompact ? 80 : 100,
            borderColor: theme?.secondary,
            color: theme?.secondary,
            '&:hover': {
              borderColor: theme?.secondary,
              backgroundColor: `${theme?.secondary}10`,
            },
          }}
        >
          Clear
        </Button>

        {showAdvancedFilters && (
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              backgroundColor: showFilters ? theme?.primary : 'transparent',
              color: showFilters ? 'white' : theme?.primary,
              '&:hover': {
                backgroundColor: showFilters ? theme?.primaryHover : `${theme?.primary}10`,
              },
            }}
          >
            <FilterIcon />
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Collapse in={showFilters}>
          <Box sx={{ pt: 2, borderTop: `1px solid ${theme?.borderColor || '#e0e0e0'}` }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
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
                  <InputLabel>Program</InputLabel>
                  <Select
                    value={filters.program_id}
                    onChange={(e) => handleFilterChange('program_id', e.target.value)}
                    label="Program"
                    disabled={loadingData}
                  >
                    <MenuItem value="">All Programs</MenuItem>
                    {programs.map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department_id}
                    onChange={(e) => handleFilterChange('department_id', e.target.value)}
                    label="Department"
                    disabled={loadingData}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={filters.academic_year}
                    onChange={(e) => handleFilterChange('academic_year', e.target.value)}
                    label="Academic Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {roleSpecificFilters.showPublicFilter && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Visibility</InputLabel>
                    <Select
                      value={filters.is_public === null ? '' : filters.is_public ? 'public' : 'private'}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('is_public', value === '' ? null : value === 'public');
                      }}
                      label="Visibility"
                    >
                      <MenuItem value="">All Projects</MenuItem>
                      <MenuItem value="public">Public Only</MenuItem>
                      <MenuItem value="private">Private Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    label="Sort By"
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sort_order}
                    onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                    label="Order"
                  >
                    <MenuItem value="desc">Newest First</MenuItem>
                    <MenuItem value="asc">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(filters.status || filters.program_id || filters.department_id || 
              filters.academic_year || filters.is_public !== null) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {filters.status && (
                    <Chip
                      label={`Status: ${statusOptions.find(opt => opt.value === filters.status)?.label}`}
                      onDelete={() => handleFilterChange('status', '')}
                      size="small"
                    />
                  )}
                  {filters.program_id && (
                    <Chip
                      label={`Program: ${programs.find(p => p.id === filters.program_id)?.name}`}
                      onDelete={() => handleFilterChange('program_id', '')}
                      size="small"
                    />
                  )}
                  {filters.department_id && (
                    <Chip
                      label={`Dept: ${departments.find(d => d.id === filters.department_id)?.name}`}
                      onDelete={() => handleFilterChange('department_id', '')}
                      size="small"
                    />
                  )}
                  {filters.academic_year && (
                    <Chip
                      label={`Year: ${filters.academic_year}`}
                      onDelete={() => handleFilterChange('academic_year', '')}
                      size="small"
                    />
                  )}
                  {filters.is_public !== null && (
                    <Chip
                      label={`Visibility: ${filters.is_public ? 'Public' : 'Private'}`}
                      onDelete={() => handleFilterChange('is_public', null)}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};
