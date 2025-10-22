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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RegisterData } from '../types';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

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
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
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
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
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
            radial-gradient(circle at 30% 20%, rgba(160, 216, 241, 0.1) 0%, transparent 25%),
            radial-gradient(circle at 70% 80%, rgba(207, 255, 229, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 10% 60%, rgba(255, 248, 231, 0.2) 0%, transparent 25%)
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
            linear-gradient(45deg, transparent 30%, rgba(160, 216, 241, 0.05) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(207, 255, 229, 0.05) 50%, transparent 70%)
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Paper 
          elevation={12} 
          sx={{ 
            padding: 4, 
            width: '100%',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            boxShadow: `
              0 20px 40px rgba(160, 216, 241, 0.15),
              0 10px 20px rgba(207, 255, 229, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.2)
            `,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              boxShadow: `
                0 25px 50px rgba(160, 216, 241, 0.2),
                0 15px 30px rgba(207, 255, 229, 0.15),
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
            <Typography component="h1" variant="h4" gutterBottom>
              Fahras
            </Typography>
            <Typography component="h2" variant="h5" gutterBottom>
              Create Account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="full_name"
                label="Full Name"
                name="full_name"
                autoComplete="name"
                autoFocus
                value={formData.full_name}
                onChange={handleChange('full_name')}
                error={!!errors.full_name}
                helperText={errors.full_name}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange('role')}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password_confirmation"
                label="Confirm Password"
                type="password"
                id="password_confirmation"
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                    Sign In
                  </RouterLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        </Box>
      </Container>
    </Box>
  );
};
