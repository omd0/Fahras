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
import { legacyColors } from '@/styles/theme/colorPalette';
import { useLanguage } from '@/providers/LanguageContext';

const COLORS = legacyColors;

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
  programs: any[];
  departments: any[];
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
              startAdornment: <SearchIcon sx={{ mr: 2, color: COLORS.almostBlack, fontSize: 24 }} />,
              endAdornment: filters.search && (
                <IconButton 
                  size="small" 
                  onClick={() => onFilterChange('search', '')}
                  sx={{ color: COLORS.textSecondary }}
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: COLORS.white,
                fontSize: '1.1rem',
                py: 1,
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.almostBlack,
                    borderWidth: 2,
                  },
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.almostBlack,
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={onToggleFilters}
              sx={{
                borderColor: COLORS.almostBlack,
                color: COLORS.almostBlack,
                borderRadius: 4,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: COLORS.almostBlack,
                  backgroundColor: alpha(COLORS.almostBlack, 0.08),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {t('Filters')}
              {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>
            {onOpenSavedSearches && (
              <Button
                variant="outlined"
                onClick={onOpenSavedSearches}
                startIcon={<BookmarkIcon />}
                sx={{
                  borderColor: COLORS.almostBlack,
                  color: COLORS.almostBlack,
                  borderRadius: 4,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: COLORS.almostBlack,
                    backgroundColor: alpha(COLORS.almostBlack, 0.08),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {t('Saved')}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={onSearch}
              disabled={searching}
              sx={{
                background: COLORS.primaryGradient,
                borderRadius: 4,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                },
              }}
            >
              {t('Search')}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Advanced Filters - Reorganized */}
      <Collapse in={showFilters}>
        <Box sx={{ 
          p: 4, 
          backgroundColor: alpha(COLORS.almostBlack, 0.06), 
          borderRadius: 4,
          border: `1px solid ${alpha(COLORS.almostBlack, 0.15)}`,
        }}>
          {/* Most-used filters (always visible) */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: COLORS.textSecondary, fontWeight: 600 }}>
            {t('Primary Filters')}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                  {t('Program')}
                </InputLabel>
                <Select
                  value={filters.program_id}
                  onChange={(e) => onFilterChange('program_id', e.target.value)}
                  label={t('Program')}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: COLORS.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(COLORS.almostBlack, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.almostBlack,
                    },
                  }}
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
                <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                  {t('Department')}
                </InputLabel>
                <Select
                  value={filters.department_id}
                  onChange={(e) => onFilterChange('department_id', e.target.value)}
                  label={t('Department')}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: COLORS.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(COLORS.almostBlack, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.almostBlack,
                    },
                  }}
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
                <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                  {t('Academic Year')}
                </InputLabel>
                <Select
                  value={filters.academic_year}
                  onChange={(e) => onFilterChange('academic_year', e.target.value)}
                  label={t('Academic Year')}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: COLORS.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(COLORS.almostBlack, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.almostBlack,
                    },
                  }}
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
                <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                  {t('Sort By')}
                </InputLabel>
                <Select
                  value={filters.sort_by}
                  onChange={(e) => onFilterChange('sort_by', e.target.value)}
                  label={t('Sort By')}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: COLORS.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(COLORS.almostBlack, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.almostBlack,
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
          </Grid>

          {/* "More Filters" button */}
          <Button
            variant="text"
            size="small"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            startIcon={showMoreFilters ? <ExpandLessIcon /> : <AddIcon />}
            sx={{
              color: COLORS.almostBlack,
              fontWeight: 600,
              mb: showMoreFilters ? 2 : 0,
              '&:hover': {
                backgroundColor: alpha(COLORS.almostBlack, 0.05),
              },
            }}
          >
            {showMoreFilters ? t('Hide Advanced Filters') : t('More Filters')}
          </Button>

          {/* Rare filters (collapsed under "More") */}
          <Collapse in={showMoreFilters}>
            <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: COLORS.textSecondary, fontWeight: 600 }}>
              {t('Advanced Filters')}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                    {t('Semester')}
                  </InputLabel>
                  <Select
                    value={filters.semester}
                    onChange={(e) => onFilterChange('semester', e.target.value)}
                    label={t('Semester')}
                    sx={{ 
                      borderRadius: 3,
                      backgroundColor: COLORS.white,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(COLORS.almostBlack, 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.almostBlack,
                      },
                    }}
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
                  <InputLabel sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>
                    {t('Sort Order')}
                  </InputLabel>
                  <Select
                    value={filters.sort_order}
                    onChange={(e) => onFilterChange('sort_order', e.target.value)}
                    label={t('Sort Order')}
                    sx={{ 
                      borderRadius: 3,
                      backgroundColor: COLORS.white,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(COLORS.almostBlack, 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.almostBlack,
                      },
                    }}
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
              sx={{
                borderColor: COLORS.textSecondary,
                color: COLORS.textSecondary,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: COLORS.textSecondary,
                  backgroundColor: alpha(COLORS.textSecondary, 0.05),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {t('Clear All')}
            </Button>
            <Button
              variant="contained"
              onClick={onSearch}
              disabled={searching}
              sx={{
                background: COLORS.primaryGradient,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(COLORS.almostBlack, 0.3)}`,
                },
              }}
            >
              {t('Apply Filters')}
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};
