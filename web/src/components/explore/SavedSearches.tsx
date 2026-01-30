import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Typography,
  Divider,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SavedSearch, SearchFilters, CreateSavedSearchData } from '@/types';
import { apiService } from '@/lib/api';
import { legacyColors } from '@/styles/theme/colorPalette';
import { useLanguage } from '@/providers/LanguageContext';

const COLORS = legacyColors;

interface SavedSearchesProps {
  open: boolean;
  onClose: () => void;
  currentFilters: SearchFilters;
  onLoadSearch: (filters: SearchFilters) => void;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  open,
  onClose,
  currentFilters,
  onLoadSearch,
}) => {
  const { t } = useLanguage();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  useEffect(() => {
    if (open) {
      fetchSavedSearches();
    }
  }, [open]);

  const fetchSavedSearches = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSavedSearches();
      setSavedSearches(response.data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      setSavedSearches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const data: CreateSavedSearchData = {
        name: searchName,
        filters: currentFilters,
        is_default: false,
      };

      if (editingSearch) {
        await apiService.updateSavedSearch(editingSearch.id, data);
      } else {
        await apiService.createSavedSearch(data);
      }

      setSaveDialogOpen(false);
      setSearchName('');
      setEditingSearch(null);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSearch = async (search: SavedSearch) => {
    try {
      // Record usage
      await apiService.recordSavedSearchUsage(search.id);
      // Load filters
      onLoadSearch(search.filters);
      onClose();
    } catch (error) {
      console.error('Error loading search:', error);
    }
  };

  const handleDeleteSearch = async (searchId: number) => {
    try {
      await apiService.deleteSavedSearch(searchId);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleSetDefault = async (searchId: number) => {
    try {
      await apiService.setSavedSearchAsDefault(searchId);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error setting default search:', error);
    }
  };

  const handleEditSearch = (search: SavedSearch) => {
    setEditingSearch(search);
    setSearchName(search.name);
    setSaveDialogOpen(true);
  };

  const getFilterSummary = (filters: SearchFilters): string => {
    const parts: string[] = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.program_id) parts.push(t('Program'));
    if (filters.department_id) parts.push(t('Department'));
    if (filters.academic_year) parts.push(filters.academic_year);
    if (filters.semester) parts.push(t(filters.semester));
    
    return parts.length > 0 ? parts.join(' • ') : t('No filters');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BookmarkFilledIcon sx={{ color: COLORS.almostBlack }} />
            <Typography variant="h6" fontWeight={700}>
              {t('Saved Searches')}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              {t('Loading...')}
            </Typography>
          ) : savedSearches.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BookmarkIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
              <Typography color="textSecondary" gutterBottom>
                {t('No saved searches yet')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('Save your current search to quickly access it later')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {savedSearches.map((search) => (
                <ListItem
                  key={search.id}
                  disablePadding
                  sx={{
                    mb: 1,
                    border: `1px solid ${alpha(COLORS.almostBlack, 0.1)}`,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(COLORS.almostBlack, 0.02),
                    },
                  }}
                >
                  <ListItemButton onClick={() => handleLoadSearch(search)}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600}>
                            {search.name}
                          </Typography>
                          {search.is_default && (
                            <Chip 
                              label={t('Default')} 
                              size="small" 
                              sx={{ 
                                height: 20,
                                backgroundColor: alpha(COLORS.almostBlack, 0.1),
                                fontWeight: 600,
                              }} 
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="textSecondary">
                            {getFilterSummary(search.filters)}
                          </Typography>
                          {search.usage_count > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              {t('Used')} {search.usage_count} {t('times')}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title={search.is_default ? t('Default search') : t('Set as default')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(search.id);
                            }}
                          >
                            {search.is_default ? (
                              <StarIcon sx={{ fontSize: 20, color: COLORS.almostBlack }} />
                            ) : (
                              <StarBorderIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Edit')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSearch(search);
                            }}
                          >
                            <EditIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Delete')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSearch(search.id);
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: COLORS.textSecondary,
              color: COLORS.textSecondary,
              borderRadius: 2,
              px: 3,
            }}
          >
            {t('Close')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              setEditingSearch(null);
              setSearchName('');
              setSaveDialogOpen(true);
            }}
            sx={{
              background: COLORS.primaryGradient,
              borderRadius: 2,
              px: 3,
            }}
          >
            {t('Save Current Search')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Search Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => {
          setSaveDialogOpen(false);
          setSearchName('');
          setEditingSearch(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSearch ? t('Edit Saved Search') : t('Save Current Search')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('Search Name')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder={t('e.g., "2024 CS Projects"')}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {t('Current filters')}: {getFilterSummary(currentFilters)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setSaveDialogOpen(false);
              setSearchName('');
              setEditingSearch(null);
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCurrentSearch}
            disabled={!searchName.trim()}
            sx={{
              background: COLORS.primaryGradient,
            }}
          >
            {editingSearch ? t('Update') : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
