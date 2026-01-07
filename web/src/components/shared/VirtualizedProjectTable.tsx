import React, { useRef, useCallback, useMemo } from 'react';
import { List, useListRef } from 'react-window';
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
  Box,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { getStatusColor, getStatusLabel, formatDate } from '@/utils/projectHelpers';

export interface VirtualizedProjectTableProps {
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
  containerHeight?: number;
  itemHeight?: number;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    projects: Project[];
    showProgram: boolean;
    showStatus: boolean;
    showCreator: boolean;
    showApprovalStatus: boolean;
    showActions: boolean;
    onView?: (project: Project) => void;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const {
    projects,
    showProgram,
    showStatus,
    showCreator,
    showApprovalStatus,
    showActions,
    onView,
    onEdit,
    onDelete,
  } = data;

  const project = projects[index];

  return (
    <TableRow
      style={style}
      hover
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <TableCell sx={{ flex: '2 1 200px', minWidth: 200 }}>
        <Typography variant="body2" fontWeight="medium">
          {project.title}
        </Typography>
      </TableCell>

      {showProgram && (
        <TableCell sx={{ flex: '1.5 1 150px', minWidth: 150 }}>
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
        <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
          <Chip
            label={getStatusLabel(project.status)}
            color={getStatusColor(project.status)}
            size="small"
          />
        </TableCell>
      )}

      {showApprovalStatus && project.approval_status && (
        <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
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
        <TableCell sx={{ flex: '1.5 1 150px', minWidth: 150 }}>
          <Typography variant="body2">
            {project.creator?.full_name || 'Unknown'}
          </Typography>
        </TableCell>
      )}

      <TableCell sx={{ flex: '1.5 1 140px', minWidth: 140 }}>
        <Typography variant="body2">
          {project.academic_year || 'N/A'} - {project.semester || 'N/A'}
        </Typography>
      </TableCell>

      <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(project.created_at)}
        </Typography>
      </TableCell>

      {showActions && (
        <TableCell sx={{ flex: '0 0 140px', minWidth: 140 }}>
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
  );
};

const VirtualizedProjectTable: React.FC<VirtualizedProjectTableProps> = ({
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
  containerHeight = 600,
  itemHeight = 73,
}) => {
  const [listRef] = useListRef();

  const rowProps = useMemo(
    () => ({
      projects,
      showProgram,
      showStatus,
      showCreator,
      showApprovalStatus,
      showActions,
      onView,
      onEdit,
      onDelete,
    }),
    [
      projects,
      showProgram,
      showStatus,
      showCreator,
      showApprovalStatus,
      showActions,
      onView,
      onEdit,
      onDelete,
    ]
  );

  // Scroll to item function
  const scrollToItem = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToRow(index);
    }
  }, [listRef]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading...</Typography>
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

  // Create the row component that will be passed to List
  const RowComponent = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    return <Row index={index} style={style} data={rowProps} />;
  }, [rowProps]);

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              display: 'flex',
              '& .MuiTableCell-root': {
                backgroundColor: 'background.paper',
                borderBottom: 2,
                borderColor: 'divider',
              },
            }}
          >
            <TableCell sx={{ flex: '2 1 200px', minWidth: 200 }}>
              <strong>Title</strong>
            </TableCell>
            {showProgram && (
              <TableCell sx={{ flex: '1.5 1 150px', minWidth: 150 }}>
                <strong>Program</strong>
              </TableCell>
            )}
            {showStatus && (
              <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
                <strong>Status</strong>
              </TableCell>
            )}
            {showApprovalStatus && (
              <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
                <strong>Approval</strong>
              </TableCell>
            )}
            {showCreator && (
              <TableCell sx={{ flex: '1.5 1 150px', minWidth: 150 }}>
                <strong>Creator</strong>
              </TableCell>
            )}
            <TableCell sx={{ flex: '1.5 1 140px', minWidth: 140 }}>
              <strong>Academic Year</strong>
            </TableCell>
            <TableCell sx={{ flex: '1 1 120px', minWidth: 120 }}>
              <strong>Created</strong>
            </TableCell>
            {showActions && (
              <TableCell sx={{ flex: '0 0 140px', minWidth: 140 }} align="right">
                <strong>Actions</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
      </Table>
      <Box sx={{ height: containerHeight }}>
        <List
          listRef={listRef}
          defaultHeight={containerHeight}
          rowCount={projects.length}
          rowHeight={itemHeight}
          overscanCount={5}
          rowComponent={RowComponent}
          rowProps={{}}
        />
      </Box>
    </TableContainer>
  );
};

export default VirtualizedProjectTable;
