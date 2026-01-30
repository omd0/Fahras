import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TVTCLogo } from '@/components/TVTCLogo';
import { useAuthStore } from '@/features/auth/store';
import { getDashboardTheme } from '@/config/dashboardThemes';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { LogoutAllDevicesButton } from '@/features/auth/components/LogoutAllDevicesButton';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const dashboardTheme = getDashboardTheme(user?.roles);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Application Settings
        </Typography>
        
        <Card>
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile Settings" 
                  secondary="Manage your personal information and preferences"
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon sx={{ color: 'warning.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Configure notification preferences"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label=""
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Theme Settings" 
                  secondary="Customize appearance and colors"
                />
                <FormControlLabel
                  control={<Switch />}
                  label=""
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Language & Region" 
                  secondary="Set your preferred language and region"
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Security & Privacy"
                  secondary="Manage security settings and privacy controls"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Security
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ChangePasswordForm />
            <LogoutAllDevicesButton />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};