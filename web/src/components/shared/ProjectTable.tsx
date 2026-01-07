import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/projectHelpers';

export interface Project {
  id: number;
  title: string;
  status: string;
  approval_status?: string;
  academic_year?: string;
  semester?: string;
  program?: { name: string };
  department?: { name: string };
  created_at: string;
  creator?: { full_name: string };
}

interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  showActions?: boolean;
  showProgram?: boolean;
  showStatus?: boolean;
  showCreator?: boolean;
  showApprovalStatus?: boolean;
  emptyMessage?: string;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading = false,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  showProgram = true,
  showStatus = true,
  showCreator = false,
  showApprovalStatus = false,
  emptyMessage = 'No projects found.',
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            {showProgram && <TableCell><strong>Program</strong></TableCell>}
            {showStatus && <TableCell><strong>Status</strong></TableCell>}
            {showApprovalStatus && <TableCell><strong>Approval</strong></TableCell>}
            {showCreator && <TableCell><strong>Creator</strong></TableCell>}
            <TableCell><strong>Academic Year</strong></TableCell>
            <TableCell><strong>Created</strong></TableCell>
            {showActions && <TableCell align="right"><strong>Actions</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {project.title}
                </Typography>
              </TableCell>

              {showProgram && (
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {project.program?.name || 'N/A'}
                  </Typography>
                  {project.department && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {project.department.name}
                    </Typography>
                  )}
                </TableCell>
              )}

              {showStatus && (
                <TableCell>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
              )}

              {showApprovalStatus && project.approval_status && (
                <TableCell>
                  <Chip
                    label={project.approval_status}
                    color={
                      project.approval_status === 'approved'
                        ? 'success'
                        : project.approval_status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
              )}

              {showCreator && (
                <TableCell>
                  <Typography variant="body2">
                    {project.creator?.full_name || 'Unknown'}
                  </Typography>
                </TableCell>
              )}

              <TableCell>
                <Typography variant="body2">
                  {project.academic_year || 'N/A'} - {project.semester || 'N/A'}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(project.created_at)}
                </Typography>
              </TableCell>

              {showActions && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    {onView && (
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onView(project)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onEdit && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(project)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(project)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectTable;
