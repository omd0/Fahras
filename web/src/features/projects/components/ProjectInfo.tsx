import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { formatDate } from '@/utils/projectHelpers';

interface Member {
  id?: number;
  full_name: string;
  email?: string;
  role?: string;
}

interface ProjectInfoProps {
  abstract?: string;
  program?: { name: string };
  department?: { name: string };
  academicYear?: string;
  semester?: string;
  creator?: { full_name: string; email?: string };
  members?: Member[];
  advisors?: Member[];
  customMembers?: Member[];
  customAdvisors?: Member[];
  createdAt?: string;
  _updatedAt?: string;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  abstract,
  program,
  department,
  academicYear,
  semester,
  creator,
  members = [],
  advisors = [],
  customMembers = [],
  customAdvisors = [],
  createdAt,
  _updatedAt,
}) => {
  const allMembers = [...(members || []), ...(customMembers || [])];
  const allAdvisors = [...(advisors || []), ...(customAdvisors || [])];

  return (
    <Grid container spacing={3}>
      {/* Abstract */}
      {abstract && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LabelIcon sx={{ mr: 1 }} />
                Abstract
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {abstract}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Project Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Program
              </Typography>
              <Typography variant="body1">{program?.name || 'N/A'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1">{department?.name || 'N/A'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Academic Year
              </Typography>
              <Typography variant="body1">
                {academicYear || 'N/A'} - {semester || 'N/A'}
              </Typography>
            </Box>

            {createdAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">{formatDate(createdAt)}</Typography>
              </Box>
            )}

            {creator && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">{creator.full_name}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Team Members */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Members */}
            {allMembers.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Members
                </Typography>
                <List dense>
                  {allMembers.map((member, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={member.full_name}
                        secondary={member.role || 'Member'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Advisors */}
            {allAdvisors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Advisors
                </Typography>
                <List dense>
                  {allAdvisors.map((advisor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <SchoolIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={advisor.full_name}
                        secondary={advisor.role || 'Advisor'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {allMembers.length === 0 && allAdvisors.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No team members assigned yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectInfo;
