import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import { authApi } from '@/lib/api';
import { OTPInput } from '../components/OTPInput';
import { useAuthStore } from '../store';

export const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, isAuthenticated, setUser, setToken, setAuthenticated } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email_verified_at) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.email_verified_at, navigate]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    const stateEmail = (location.state as any)?.email;

    if (emailParam) {
      setEmail(emailParam);
    } else if (stateEmail) {
      setEmail(stateEmail);
    }

    if (tokenParam) {
      handleMagicLinkVerification(tokenParam);
    }
  }, [searchParams, location]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleMagicLinkVerification = async (token: string) => {
    setVerifyingMagicLink(true);
    setError('');

    try {
      const response = await authApi.verifyMagicLink(token);
      setSuccess(response.message);

      setToken(response.token);
      setAuthenticated(true);
      setUser(response.user);

      await new Promise(resolve => setTimeout(resolve, 200));

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid or expired verification link'
      );
      setVerifyingMagicLink(false);
    }
  };

  const handleVerify = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.verifyEmail(email, otp);
      setSuccess(response.message);

      if (response.token) {
        setToken(response.token);
      }
      setAuthenticated(true);
      setUser(response.user);

      await new Promise(resolve => setTimeout(resolve, 200));

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to resend code');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.sendVerificationEmail(email);
      setSuccess(response.message);
      setResendCooldown(60);
      setOtp('');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to resend code. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (verifyingMagicLink) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              width: '100%',
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
              Verifying your email...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we verify your email address.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1, color: 'text.primary' }}
          >
            Verify Your Email
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 4 }}
          >
            We've sent a 6-digit verification code to
            <br />
            <strong>{email || 'your email'}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <OTPInput
              value={otp}
              onChange={setOtp}
              length={6}
              disabled={loading}
              error={!!error}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Didn't receive the code?
            </Typography>

            <Button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              sx={{ color: 'primary.main' }}
            >
              {resendLoading ? (
                <CircularProgress size={20} />
              ) : resendCooldown > 0 ? (
                `Resend Code (${resendCooldown}s)`
              ) : (
                'Resend Code'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already verified?{' '}
              <Button
                onClick={() => navigate('/login')}
                sx={{ color: 'primary.main', textTransform: 'none', p: 0, minWidth: 0 }}
              >
                Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
