import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip,
  Paper,
  Alert
} from '@mui/material';
import { tvtcColors } from '../theme/tvtcTheme';

// Test component to verify TVTC theme implementation
export const TVTCThemeTest: React.FC = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: tvtcColors.backgroundDefault, minHeight: '100vh' }}>
      <Typography variant="h1" sx={{ color: tvtcColors.textPrimary, mb: 3 }}>
        TVTC Theme Test
      </Typography>
      
      <Typography variant="body1" sx={{ color: tvtcColors.textSecondary, mb: 4 }}>
        This component tests the TVTC brand colors and typography implementation.
      </Typography>

      {/* Color Palette Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          TVTC Color Palette
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ 
            width: 100, 
            height: 60, 
            backgroundColor: tvtcColors.primary, 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tvtcColors.white
          }}>
            Primary
          </Box>
          
          <Box sx={{ 
            width: 100, 
            height: 60, 
            backgroundColor: tvtcColors.secondary, 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tvtcColors.white
          }}>
            Secondary
          </Box>
          
          <Box sx={{ 
            width: 100, 
            height: 60, 
            backgroundColor: tvtcColors.accent, 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tvtcColors.white
          }}>
            Accent
          </Box>
        </Box>
      </Box>

      {/* Button Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Buttons
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" sx={{ backgroundColor: tvtcColors.primary }}>
            Primary Button
          </Button>
          
          <Button variant="outlined" sx={{ borderColor: tvtcColors.secondary, color: tvtcColors.secondary }}>
            Secondary Button
          </Button>
          
          <Button variant="text" sx={{ color: tvtcColors.accent }}>
            Accent Button
          </Button>
        </Box>
      </Box>

      {/* Card Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Cards
        </Typography>
        
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h4" sx={{ color: tvtcColors.textPrimary, mb: 1 }}>
              TVTC Card
            </Typography>
            <Typography variant="body2" sx={{ color: tvtcColors.textSecondary, mb: 2 }}>
              This card demonstrates the TVTC theme styling with proper colors and typography.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="TVTC" size="small" sx={{ backgroundColor: tvtcColors.primary, color: tvtcColors.white }} />
              <Chip label="Theme" size="small" sx={{ backgroundColor: tvtcColors.secondary, color: tvtcColors.white }} />
              <Chip label="Test" size="small" sx={{ backgroundColor: tvtcColors.accent, color: tvtcColors.white }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Alert Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Alerts
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success" sx={{ backgroundColor: tvtcColors.success + '20' }}>
            Success message with TVTC colors
          </Alert>
          
          <Alert severity="warning" sx={{ backgroundColor: tvtcColors.warning + '20' }}>
            Warning message with TVTC colors
          </Alert>
          
          <Alert severity="error" sx={{ backgroundColor: tvtcColors.error + '20' }}>
            Error message with TVTC colors
          </Alert>
          
          <Alert severity="info" sx={{ backgroundColor: tvtcColors.info + '20' }}>
            Info message with TVTC colors
          </Alert>
        </Box>
      </Box>

      {/* Typography Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Typography
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h1" sx={{ color: tvtcColors.textPrimary }}>
            Heading 1 - TVTC Primary Text
          </Typography>
          <Typography variant="h2" sx={{ color: tvtcColors.textPrimary }}>
            Heading 2 - TVTC Primary Text
          </Typography>
          <Typography variant="h3" sx={{ color: tvtcColors.textPrimary }}>
            Heading 3 - TVTC Primary Text
          </Typography>
          <Typography variant="body1" sx={{ color: tvtcColors.textPrimary }}>
            Body text with TVTC primary color
          </Typography>
          <Typography variant="body2" sx={{ color: tvtcColors.textSecondary }}>
            Secondary body text with TVTC secondary color
          </Typography>
        </Box>
      </Box>

      {/* Paper Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Paper Components
        </Typography>
        
        <Paper sx={{ p: 3, backgroundColor: tvtcColors.backgroundPaper }}>
          <Typography variant="h4" sx={{ color: tvtcColors.textPrimary, mb: 1 }}>
            Paper Component
          </Typography>
          <Typography variant="body2" sx={{ color: tvtcColors.textSecondary }}>
            This paper component uses TVTC background and text colors.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default TVTCThemeTest;
