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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { apiService } from '@/lib/api';

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

interface SearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export const ProjectSearch: React.FC<SearchProps> = ({ onSearch, onClear, loading = false }) => {
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
    sort_year: '',
    sort_title: '',
  });

  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

   const fetchPrograms = async () => {
     try {
       const programs = await apiService.getPrograms();
       setPrograms(programs || []);
     } catch (_error) {
       // Silently fail - programs filter is optional
       setPrograms([]);
     }
   };

   const fetchDepartments = async () => {
     try {
       const response = await apiService.getDepartments();
       setDepartments(response || []);
     } catch (_error) {
       // Silently fail - departments filter is optional
       setDepartments([]);
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
     } catch (_error) {
       // Silently fail - suggestions are optional
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
      sort_by: 'created_at',
      sort_order: 'desc',
      sort_year: '',
      sort_title: '',
    });
    onClear();
  };

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    if (field === 'search' && value) {
      fetchSuggestions(value);
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

  const semesterOptions = [
    { value: 'fall', label: 'Fall' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'academic_year', label: 'Academic Year' },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SearchIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Search Projects</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          color="primary"
        >
          {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {/* Search Input */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            freeSolo
            options={suggestions || []}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.title
            }
            value={filters.search}
            onInputChange={(event, newValue) => {
              handleInputChange('search', newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search projects..."
                placeholder="Enter title, abstract, or keywords"
                fullWidth
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.academic_year} • {option.semester}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
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

        {/* Sort By */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
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

        {/* Conditional Input: Year (for Date Created or Academic Year) */}
        {(filters.sort_by === 'created_at' || filters.sort_by === 'academic_year') && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label={filters.sort_by === 'created_at' ? 'Filter by Year Created' : 'Filter by Academic Year'}
              placeholder="e.g., 2024"
              value={filters.sort_year || ''}
              onChange={(e) => handleInputChange('sort_year', e.target.value)}
              type="number"
              inputProps={{ min: 1900, max: 2100 }}
            />
          </Grid>
        )}

        {/* Conditional Input: Title (for Title sorting) */}
        {filters.sort_by === 'title' && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Filter by Title"
              placeholder="Enter title to search for"
              value={filters.sort_title || ''}
              onChange={(e) => handleInputChange('sort_title', e.target.value)}
            />
          </Grid>
        )}

        {/* Advanced Filters */}
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

        {/* Action Buttons */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Chip
                icon={<FilterIcon />}
                label={`${getActiveFiltersCount()} filters active`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
