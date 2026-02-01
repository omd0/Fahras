import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  alpha,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/providers/LanguageContext';
import { Program, Department } from '@/types';

interface SearchFilters {
  search: string;
  program_id: string;
  department_id: string;
  academic_year: string;
  semester: string;
  sort_by: string;
  sort_order: string;
}

interface AdvancedFiltersProps {
  filters: SearchFilters;
  showFilters: boolean;
  searching: boolean;
  programs: Program[];
  departments: Department[];
  onFilterChange: (field: keyof SearchFilters, value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onToggleFilters: () => void;
  onOpenSavedSearches?: () => void;
}

const academicYearOptions = [
  '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  showFilters,
  searching,
  programs,
  departments,
  onFilterChange,
  onSearch,
  onClearSearch,
  onToggleFilters,
  onOpenSavedSearches,
}) => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const semesterOptions = useMemo(
    () => [
      { value: 'fall', label: t('Fall') },
      { value: 'spring', label: t('Spring') },
      { value: 'summer', label: t('Summer') },
    ],
    [language, t],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'created_at', label: t('Date Created') },
      { value: 'updated_at', label: t('Last Updated') },
      { value: 'title', label: t('Title') },
      { value: 'academic_year', label: t('Academic Year') },
      { value: 'average_rating', label: t('Rating') },
    ],
    [language, t],
  );

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            placeholder={t('Search by project name, title, or keywords...')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 2, color: theme.palette.text.secondary, fontSize: 24 }} />,
              endAdornment: filters.search && (
                <IconButton 
                  size="small" 
                  onClick={() => onFilterChange('search', '')}
                  aria-label={t('Clear search')}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={onToggleFilters}
            >
              {t('Filters')}
              {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>
            {onOpenSavedSearches && (
              <Button
                variant="outlined"
                onClick={onOpenSavedSearches}
                startIcon={<BookmarkIcon />}
              >
                {t('Saved')}
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={onSearch}
              disabled={searching}
            >
              {t('Search')}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Collapse in={showFilters}>
        <Box sx={{ 
          p: 4, 
          bgcolor: alpha(theme.palette.text.primary, 0.04), 
          borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary, fontWeight: 600 }}>
            {t('Primary Filters')}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('Program')}</InputLabel>
                <Select
                  value={filters.program_id}
                  onChange={(e) => onFilterChange('program_id', e.target.value)}
                  label={t('Program')}
                >
                  <MenuItem value="">{t('All Programs')}</MenuItem>
                  {(programs || []).map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('Department')}</InputLabel>
                <Select
                  value={filters.department_id}
                  onChange={(e) => onFilterChange('department_id', e.target.value)}
                  label={t('Department')}
                >
                  <MenuItem value="">{t('All Departments')}</MenuItem>
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
                <InputLabel>{t('Academic Year')}</InputLabel>
                <Select
                  value={filters.academic_year}
                  onChange={(e) => onFilterChange('academic_year', e.target.value)}
                  label={t('Academic Year')}
                >
                  <MenuItem value="">{t('All Years')}</MenuItem>
                  {academicYearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('Sort By')}</InputLabel>
                <Select
                  value={filters.sort_by}
                  onChange={(e) => onFilterChange('sort_by', e.target.value)}
                  label={t('Sort By')}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="text"
            size="small"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            startIcon={showMoreFilters ? <ExpandLessIcon /> : <AddIcon />}
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              mb: showMoreFilters ? 2 : 0,
            }}
          >
            {showMoreFilters ? t('Hide Advanced Filters') : t('More Filters')}
          </Button>

          <Collapse in={showMoreFilters}>
            <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: theme.palette.text.secondary, fontWeight: 600 }}>
              {t('Advanced Filters')}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('Semester')}</InputLabel>
                  <Select
                    value={filters.semester}
                    onChange={(e) => onFilterChange('semester', e.target.value)}
                    label={t('Semester')}
                  >
                    <MenuItem value="">{t('All Semesters')}</MenuItem>
                    {semesterOptions.map((semester) => (
                      <MenuItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('Sort Order')}</InputLabel>
                  <Select
                    value={filters.sort_order}
                    onChange={(e) => onFilterChange('sort_order', e.target.value)}
                    label={t('Sort Order')}
                  >
                    <MenuItem value="desc">{t('Newest First')}</MenuItem>
                    <MenuItem value="asc">{t('Oldest First')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>

          <Stack direction="row" spacing={3} sx={{ mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClearSearch}
              startIcon={<ClearIcon />}
            >
              {t('Clear All')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSearch}
              disabled={searching}
            >
              {t('Apply Filters')}
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};
