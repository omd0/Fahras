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
  Link,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { TVTCLogo } from '../components/TVTCLogo';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RegisterData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (field: keyof RegisterData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('Full name is required');
    }

    if (!formData.email) {
      newErrors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Email is invalid');
    } else {
      // Validate email domain (case-insensitive)
      const allowedDomains = ['cti.edu.sa', 'tvtc.edu.sa'];
      const emailParts = formData.email.split('@');
      if (emailParts.length !== 2) {
        newErrors.email = t('Email is invalid');
      } else {
        const emailDomain = emailParts[1].toLowerCase().trim();
        if (!allowedDomains.includes(emailDomain)) {
          newErrors.email = t('Invalid email domain.');
        }
      }
    }

    if (!formData.password) {
      newErrors.password = t('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('Password must be at least 8 characters');
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = t('Password confirmation is required');
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = t('Passwords do not match');
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
      await register(formData);
      // Registration successful - navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Error is handled by the store and displayed to user
      // Don't navigate away - let user see the error and try again
    }
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
                {t('Fahras')}
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
              {t('Create Account')}
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
              {t('Join Fahras to start your academic project journey')}
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
                id="full_name"
                label={t('Full Name')}
                name="full_name"
                autoComplete="name"
                autoFocus
                value={formData.full_name}
                onChange={handleChange('full_name')}
                error={!!errors.full_name}
                helperText={errors.full_name}
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
                      <PersonIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('Email Address')}
                name="email"
                autoComplete="email"
                value={formData.email}
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
                label={t('Password')}
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="password_confirmation"
                label={t('Confirm Password')}
                type="password"
                id="password_confirmation"
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
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
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              >
                {isLoading ? t('Creating Account...') : t('Create Account')}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {t('Already have an account?')}{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: '#007BFF', // Academic Blue for links
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {t('Sign In')}
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