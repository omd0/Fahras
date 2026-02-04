'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  IconButton,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { TVTCLogo } from '@/components/TVTCLogo';
import { useAuthStore } from '@/features/auth/store';
import type { RegisterData } from '@/types';
import { useLanguage } from '@/providers/LanguageContext';
import { authApi } from '@/lib/api';

interface PasswordRequirement {
  key: string;
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
];

function getPasswordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' };
  const passed = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 25, label: 'Weak' };
  if (passed === 2) return { score: 50, label: 'Fair' };
  if (passed === 3) return { score: 75, label: 'Good' };
  return { score: 100, label: 'Strong' };
}

function useFieldSx() {
  const theme = useTheme();
  return useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.error.main,
        },
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.95rem',
      },
    }),
    [theme],
  );
}

export default function RegisterPage() {
  const theme = useTheme();

  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();
  const fieldSx = useFieldSx();

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const strengthColor = useMemo(() => {
    if (passwordStrength.score <= 25) return theme.palette.error.main;
    if (passwordStrength.score <= 50) return theme.palette.warning.main;
    if (passwordStrength.score <= 75) return theme.palette.info.main;
    return theme.palette.success.main;
  }, [passwordStrength.score, theme]);

  const validateField = useCallback(
    (field: keyof RegisterData, value: string): string => {
      switch (field) {
        case 'full_name':
          if (!value.trim()) return t('Full name is required');
          return '';
        case 'email': {
          if (!value) return t('Email is required');
          if (!/\S+@\S+\.\S+/.test(value)) return t('Email is invalid');
          const allowedDomains = ['cti.edu.sa', 'tvtc.edu.sa'];
          const parts = value.split('@');
          if (parts.length !== 2) return t('Email is invalid');
          const domain = parts[1].toLowerCase().trim();
          if (!allowedDomains.includes(domain)) return t('Invalid email domain.');
          return '';
        }
        case 'password':
          if (!value) return t('Password is required');
          if (value.length < 8) return t('Password must be at least 8 characters');
          return '';
        case 'password_confirmation':
          if (!value) return t('Password confirmation is required');
          if (value !== formData.password) return t('Passwords do not match');
          return '';
        default:
          return '';
      }
    },
    [formData.password, t],
  );

  const handleChange =
    (field: keyof RegisterData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const fieldError = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
      }

      if (field === 'password' && touched.password_confirmation && formData.password_confirmation) {
        const confirmError =
          value !== formData.password_confirmation ? t('Passwords do not match') : '';
        setErrors((prev) => ({ ...prev, password_confirmation: confirmError }));
      }
    };

  const handleBlur = (field: keyof RegisterData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field] ?? '');
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const validateForm = (): boolean => {
    const fields: (keyof RegisterData)[] = ['full_name', 'email', 'password', 'password_confirmation'];
    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    fields.forEach((field) => {
      allTouched[field] = true;
      const err = validateField(field, formData[field] ?? '');
      if (err) newErrors[field] = err;
    });

    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      await register(formData);
      try {
        await authApi.sendVerificationEmail(formData.email);
      } catch {
        /* empty */
      }
      router.replace(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch {
      /* empty */
    }
  };

  const iconColor = theme.palette.text.secondary;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
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
            p: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TVTCLogo size="large" variant="full" color="primary" sx={{ mr: 2 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
              >
                {t('Fahras')}
              </Typography>
            </Box>

            <Typography
              component="h2"
              variant="h5"
              gutterBottom
              sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}
            >
              {t('Create Account')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
                mb: 3,
                maxWidth: 340,
                lineHeight: 1.6,
              }}
            >
              {t('Join Fahras to start your academic project journey')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
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
                onBlur={handleBlur('full_name')}
                error={!!errors.full_name && touched.full_name}
                helperText={touched.full_name ? errors.full_name : ''}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: iconColor }} />
                      </InputAdornment>
                    ),
                  },
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
                onBlur={handleBlur('email')}
                error={!!errors.email && touched.email}
                helperText={touched.email ? errors.email : t('Use your @cti.edu.sa or @tvtc.edu.sa email')}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: iconColor }} />
                      </InputAdornment>
                    ),
                  },
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                error={!!errors.password && touched.password}
                helperText={touched.password ? errors.password : ''}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: iconColor }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? t('Hide password') : t('Show password')}
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon sx={{ color: iconColor }} />
                          ) : (
                            <VisibilityIcon sx={{ color: iconColor }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {formData.password.length > 0 && (
                <Box sx={{ mt: 1, mb: 0.5, px: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength.score}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.text.disabled, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: strengthColor,
                          transition: 'transform 0.3s ease, background-color 0.3s ease',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: strengthColor, fontWeight: 600, minWidth: 44, textAlign: 'right' }}
                    >
                      {t(passwordStrength.label)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const met = req.test(formData.password);
                      return (
                        <Box
                          key={req.key}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            width: { xs: '100%', sm: 'calc(50% - 4px)' },
                          }}
                        >
                          {met ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: met ? theme.palette.success.main : theme.palette.text.secondary,
                              lineHeight: 1.4,
                            }}
                          >
                            {t(req.label)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="password_confirmation"
                label={t('Confirm Password')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="password_confirmation"
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                onBlur={handleBlur('password_confirmation')}
                error={!!errors.password_confirmation && touched.password_confirmation}
                helperText={touched.password_confirmation ? errors.password_confirmation : ''}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: iconColor }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? t('Hide password') : t('Show password')}
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon sx={{ color: iconColor }} />
                          ) : (
                            <VisibilityIcon sx={{ color: iconColor }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textAlign: 'center',
                  mt: 2,
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {t('By registering, you agree to our')}{' '}
                <Typography
                  component={NextLink}
                  href="/terms"
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.dark,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('Terms of Service')}
                </Typography>{' '}
                {t('and')}{' '}
                <Typography
                  component={NextLink}
                  href="/privacy"
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.dark,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('Privacy Policy')}
                </Typography>
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                }}
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />
                }
              >
                {isLoading ? t('Creating Account...') : t('Create Account')}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, px: 1 }}>
                  {t('or')}
                </Typography>
              </Divider>

              <Box textAlign="center" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {t('Already have an account?')}{' '}
                  <Typography
                    component={NextLink}
                    href="/login"
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.dark,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {t('Sign In')}
                  </Typography>
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Typography
                  component={NextLink}
                  href="/terms"
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.dark,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('Terms of Service')}
                </Typography>
                <Typography
                  component={NextLink}
                  href="/privacy"
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.dark,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('Privacy Policy')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
