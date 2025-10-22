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
  Stack,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
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
        background: `
          linear-gradient(135deg, #7BB0D8 0%, #9FE3C1 50%, #F5E9D8 100%),
          radial-gradient(circle at 20% 80%, rgba(123, 176, 216, 0.35) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(159, 227, 193, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(245, 233, 216, 0.45) 0%, transparent 50%)
        `,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle at 30% 20%, rgba(123, 176, 216, 0.18) 0%, transparent 25%),
            radial-gradient(circle at 70% 80%, rgba(159, 227, 193, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 10% 60%, rgba(245, 233, 216, 0.12) 0%, transparent 25%),
            radial-gradient(circle at 50% 50%, rgba(123, 176, 216, 0.1) 0%, transparent 30%)
          `,
          animation: 'float 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, transparent 30%, rgba(123, 176, 216, 0.1) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(159, 227, 193, 0.08) 50%, transparent 70%),
            linear-gradient(90deg, transparent 20%, rgba(245, 233, 216, 0.06) 50%, transparent 80%)
          `,
          animation: 'slide 15s linear infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        '@keyframes slide': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={12} 
          sx={{ 
            padding: 4, 
            width: '100%',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            boxShadow: `
              0 20px 40px rgba(123, 176, 216, 0.18),
              0 10px 20px rgba(159, 227, 193, 0.12),
              0 0 0 1px rgba(255, 255, 255, 0.2)
            `,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              boxShadow: `
                0 25px 50px rgba(123, 176, 216, 0.25),
                0 15px 30px rgba(159, 227, 193, 0.18),
                0 0 0 1px rgba(255, 255, 255, 0.3)
              `,
            },
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
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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
                color: '#333',
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
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#667eea' }} />
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
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#667eea' }} />
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
                    color: '#667eea',
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
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
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
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)',
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
                      color: '#667eea',
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
