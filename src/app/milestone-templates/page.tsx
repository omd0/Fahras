'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DashboardContainer } from '@/components/shared/DashboardContainer';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import type { MilestoneTemplate, Program, Department } from '@/types';
import { TemplateList } from '@/features/milestones/components/TemplateList';
import { TemplateEditor } from '@/features/milestones/components/TemplateEditor';
import { ConfirmDialog } from '@/components/shared';
import { getErrorMessage } from '@/utils/errorHandling';

export default function MilestoneTemplatesPage() {
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MilestoneTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [filterProgram, setFilterProgram] = useState<number | ''>('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.some((role) => role.name === 'admin') ?? false;

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, router]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMilestoneTemplates({
        program_id: filterProgram || undefined,
        department_id: filterDepartment || undefined,
      });
      setTemplates(response.templates || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load templates'));
    } finally {
      setLoading(false);
    }
  }, [filterProgram, filterDepartment]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [programsRes, departmentsRes] = await Promise.all([
          apiService.getPrograms(),
          apiService.getDepartments(),
        ]);
        setPrograms(programsRes || []);
        setDepartments(departmentsRes || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load programs and departments'));
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadTemplates();
    }
  }, [isAdmin, loadTemplates]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: MilestoneTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete === null) return;

    try {
      setDeleteLoading(true);
      await apiService.deleteMilestoneTemplate(templateToDelete);
      setDeleteConfirmOpen(false);
      await loadTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete template'));
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
      setTemplateToDelete(null);
    }
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setSelectedTemplate(null);
  };

  const handleEditorSave = async () => {
    await loadTemplates();
    setEditorOpen(false);
    setSelectedTemplate(null);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardContainer>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => router.push('/dashboard')}
              sx={{ mr: 2, color: 'primary.main' }}
              aria-label="Back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
            <TimelineIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Program Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Create and manage program milestone structures
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Admin Only" color="primary" size="small" sx={{ fontWeight: 600 }} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
              sx={{ ml: 1 }}
            >
              Create Program
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {editorOpen && (
        <TemplateEditor
          open={editorOpen}
          template={selectedTemplate}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Program</InputLabel>
              <Select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value as number | '')}
                label="Filter by Program"
              >
                <MenuItem value="">All Programs</MenuItem>
                {(programs || []).map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value as number | '')}
                label="Filter by Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {(departments || []).map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {loading && templates.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TemplateList
              templates={templates}
              programs={programs}
              departments={departments}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Program Template"
        message="Are you sure you want to delete this program template? This action cannot be undone and will affect all future projects using this template."
        confirmText="Delete Template"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        severity="error"
        loading={deleteLoading}
      />
    </DashboardContainer>
  );
}
