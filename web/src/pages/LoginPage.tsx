import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { TVTCLogo } from '../components/TVTCLogo';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types';

export const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleGuestContinue = () => {
    navigate('/explore', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA', // Very Light Cool Gray background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            width: '100%',
            borderRadius: 3,
            backgroundColor: '#FFFFFF', // Pure White form box
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Header with Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TVTCLogo size="large" variant="full" color="primary" sx={{ mr: 2 }} />
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#343A40', // Dark Gray/Navy for headings
                }}
              >
                Fahras
              </Typography>
            </Box>
            
            <Typography 
              component="h2" 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: '#343A40', // Dark Gray/Navy for headings
                fontWeight: 600,
                mb: 3
              }}
            >
              Welcome Back
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                textAlign: 'center',
                mb: 3,
                maxWidth: '300px'
              }}
            >
              Sign in to access your projects and continue your academic journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={credentials.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CED4DA', // Light Gray for hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007BFF', // Academic Blue for focus
                      borderWidth: 2,
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#DC3545', // Light Red for errors
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CED4DA', // Light Gray for hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007BFF', // Academic Blue for focus
                      borderWidth: 2,
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#DC3545', // Light Red for errors
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Forgot Password Link */}
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  sx={{
                    color: '#007BFF', // Academic Blue for links
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                  onClick={() => {
                    // TODO: Implement forgot password functionality
                    alert('Forgot password functionality will be implemented soon!');
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2, 
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#007BFF', // Academic Blue/Dark
                  '&:hover': {
                    backgroundColor: '#0056B3', // Darker blue for hover
                  },
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" sx={{ mx: 2, color: '#666' }}>
                  or
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* Continue as Guest Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestContinue}
                sx={{
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: '#007BFF', // Academic Blue/Dark
                  color: '#007BFF', // Academic Blue/Dark
                  '&:hover': {
                    borderColor: '#0056B3',
                    backgroundColor: 'rgba(0, 123, 255, 0.04)',
                  },
                  fontWeight: 600,
                }}
                startIcon={<VisibilityIcon />}
              >
                Continue as Guest
              </Button>

              {/* Sign Up Link */}
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: '#007BFF', // Academic Blue for links
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};