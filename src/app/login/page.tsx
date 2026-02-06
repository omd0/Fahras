'use client';

import React, { useState, Suspense } from 'react';
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
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TVTCLogo } from '@/components/TVTCLogo';
import { useAuthStore } from '@/features/auth/store';
import type { LoginCredentials } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';

function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const from = searchParams.get('from') || '/dashboard';

  const handleChange =
    (field: keyof LoginCredentials) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = t('Email is invalid');
    }

    if (!credentials.password) {
      newErrors.password = t('Password is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await login(credentials);
      router.replace(from);
    } catch {
      /* empty */
    }
  };

  const handleGuestContinue = () => {
    router.replace('/explore');
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  void rememberMe;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
        <TVTCLogo size="large" variant="full" color="primary" sx={{ mr: 2 }} />
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          {t('Fahras')}
        </Typography>
      </Box>

      <Typography
        component="h2"
        variant="h5"
        gutterBottom
        sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}
      >
        {t('Welcome Back')}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          mb: 6,
          maxWidth: '320px',
        }}
      >
        {t('Sign in to access your projects and continue your academic journey')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={t('Email Address')}
          name="email"
          autoComplete="email"
          autoFocus
          value={credentials.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'text.secondary' }} />
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
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={handleChange('password')}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                  onClick={handleTogglePassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            mb: 4,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {t('Remember me')}
              </Typography>
            }
          />
          <Typography
            component={NextLink}
            href="/forgot-password"
            variant="body2"
            sx={{
              color: 'primary.dark',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('Forgot Password?')}
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mb: 6, py: 3, fontWeight: 600, fontSize: '1.05rem' }}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />
          }
        >
          {isLoading ? t('Signing In...') : t('Sign In')}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 6 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            sx={{ mx: 4, color: 'text.secondary', fontWeight: 500 }}
          >
            {t('or')}
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleGuestContinue}
          sx={{ mb: 6, py: 3, fontWeight: 600 }}
          startIcon={<VisibilityIcon />}
        >
          {t('Continue as Guest')}
        </Button>

        <Box textAlign="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {t("Don't have an account?")}{' '}
            <Typography
              component={NextLink}
              href="/register"
              variant="body2"
              sx={{
                color: 'primary.dark',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('Create Account')}
            </Typography>
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Typography
            component={NextLink}
            href="/terms"
            variant="body2"
            sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
          >
            {t('Terms of Service')}
          </Typography>
          <Typography
            component={NextLink}
            href="/privacy"
            variant="body2"
            sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
          >
            {t('Privacy Policy')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 6, sm: 8 },
            width: '100%',
            borderRadius: 3.5,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Suspense fallback={<CircularProgress />}>
            <LoginForm />
          </Suspense>
        </Paper>
      </Container>
    </Box>
  );
}
