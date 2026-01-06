import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface ProjectFiltersProps {
  searchTerm: string;
  statusFilter: string;
  academicYearFilter: string;
  academicYears: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  dashboardTheme: any;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchTerm,
  statusFilter,
  academicYearFilter,
  academicYears,
  onSearchChange,
  onStatusChange,
  onAcademicYearChange,
  dashboardTheme,
}) => {
  return (
    <Card sx={{ 
      mb: 4, 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: `1px solid ${dashboardTheme.primary}20`,
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterIcon sx={{ color: dashboardTheme.primary, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Filter & Search Projects
          </Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: dashboardTheme.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: dashboardTheme.primary,
                  },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => onStatusChange(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: dashboardTheme.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: dashboardTheme.primary,
                  },
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={academicYearFilter}
                label="Academic Year"
                onChange={(e) => onAcademicYearChange(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: dashboardTheme.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: dashboardTheme.primary,
                  },
                }}
              >
                <MenuItem value="all">All Years</MenuItem>
                {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
