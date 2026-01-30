import React from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Autocomplete,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { User } from '@/types';

interface Member {
  user_id: number;
  role: 'LEAD' | 'MEMBER';
  customName?: string;
}

interface Advisor {
  user_id: number;
  role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER';
  customName?: string;
}

interface MemberManagementFormProps {
  members: Member[];
  advisors: Advisor[];
  users: User[];
  newMember: Member;
  newAdvisor: Advisor;
  onNewMemberChange: (member: Member) => void;
  onNewAdvisorChange: (advisor: Advisor) => void;
  onAddMember: () => void;
  onAddAdvisor: () => void;
  onRemoveMember: (index: number) => void;
  onRemoveAdvisor: (index: number) => void;
}

export const MemberManagementForm: React.FC<MemberManagementFormProps> = ({
  members,
  advisors,
  users,
  newMember,
  newAdvisor,
  onNewMemberChange,
  onNewAdvisorChange,
  onAddMember,
  onAddAdvisor,
  onRemoveMember,
  onRemoveAdvisor,
}) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: 5,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.12)}`,
          border: `2px solid ${theme.palette.warning.main}`,
          mb: 3,
          position: 'relative',
          zIndex: 3,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: `0 12px 40px ${alpha(theme.palette.warning.main, 0.18)}`,
            transform: 'translateY(-2px)',
          }
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={(theme) => ({
            p: 2,
            borderRadius: 3,
            bgcolor: 'warning.main',
            mr: 3,
            boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.3)}`
          })}>
            <PersonIcon sx={{ color: 'warning.contrastText', fontSize: '1.8rem' }} />
          </Box>
          <Typography variant="h6" component="h2" sx={{
            color: 'warning.main',
            fontWeight: 700,
            fontSize: '1.3rem',
          }}>
            Project Team
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'warning.main', mb: 2 }}>
              Project Members
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
              <Autocomplete
                sx={{ flexGrow: 1 }}
                freeSolo
                options={users}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.full_name} (${option.email})`;
                }}
                value={users.find(u => u.id === newMember.user_id) || null}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    onNewMemberChange({ ...newMember, user_id: -1, customName: value });
                  } else if (value) {
                    onNewMemberChange({ ...newMember, user_id: value.id, customName: undefined });
                  } else {
                    onNewMemberChange({ ...newMember, user_id: 0, customName: undefined });
                  }
                }}
                onInputChange={(_, value) => {
                  if (value && !users.find(u => `${u.full_name} (${u.email})` === value)) {
                    onNewMemberChange({ ...newMember, customName: value, user_id: -1 });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select or Type Member Name"
                  />
                )}
              />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel id="member-role-label">Role</InputLabel>
                <Select
                  labelId="member-role-label"
                  value={newMember.role}
                  label="Role"
                  onChange={(e) => onNewMemberChange({ ...newMember, role: e.target.value as 'LEAD' | 'MEMBER' })}
                >
                  <MenuItem value="LEAD">Lead</MenuItem>
                  <MenuItem value="MEMBER">Member</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="warning"
                onClick={onAddMember}
                disabled={newMember.user_id === 0 && !newMember.customName}
                startIcon={<AddIcon />}
                sx={{ minWidth: 100, fontWeight: 600 }}
              >
                Add
              </Button>
            </Box>
            <Stack spacing={1}>
              {(members || []).map((member, index) => {
                const user = users.find(u => u.id === member.user_id);
                const displayName = member.customName || user?.full_name || 'Unknown';
                return (
                  <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {displayName} <Chip label={member.role} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveMember(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'warning.main', mb: 2 }}>
              Project Advisors (Optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
              <Autocomplete
                sx={{ flexGrow: 1 }}
                freeSolo
                options={users}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.full_name} (${option.email})`;
                }}
                value={users.find(u => u.id === newAdvisor.user_id) || null}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    onNewAdvisorChange({ ...newAdvisor, user_id: -1, customName: value });
                  } else if (value) {
                    onNewAdvisorChange({ ...newAdvisor, user_id: value.id, customName: undefined });
                  } else {
                    onNewAdvisorChange({ ...newAdvisor, user_id: 0, customName: undefined });
                  }
                }}
                onInputChange={(_, value) => {
                  if (value && !users.find(u => `${u.full_name} (${u.email})` === value)) {
                    onNewAdvisorChange({ ...newAdvisor, customName: value, user_id: -1 });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select or Type Advisor Name"
                  />
                )}
              />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel id="advisor-role-label">Role</InputLabel>
                <Select
                  labelId="advisor-role-label"
                  value={newAdvisor.role}
                  label="Role"
                  onChange={(e) => onNewAdvisorChange({ ...newAdvisor, role: e.target.value as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' })}
                >
                  <MenuItem value="MAIN">Main Advisor</MenuItem>
                  <MenuItem value="CO_ADVISOR">Co-Advisor</MenuItem>
                  <MenuItem value="REVIEWER">Reviewer</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="warning"
                onClick={onAddAdvisor}
                disabled={newAdvisor.user_id === 0 && !newAdvisor.customName}
                startIcon={<AddIcon />}
                sx={{ minWidth: 100, fontWeight: 600 }}
              >
                Add
              </Button>
            </Box>
            <Stack spacing={1}>
              {(advisors || []).map((advisor, index) => {
                const user = users.find(u => u.id === advisor.user_id);
                const displayName = advisor.customName || user?.full_name || 'Unknown';
                return (
                  <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {displayName} <Chip label={advisor.role} size="small" color="secondary" variant="outlined" sx={{ ml: 1 }} />
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveAdvisor(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};
