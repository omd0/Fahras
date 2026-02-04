'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Fade,
  Stack,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  MarkunreadMailbox as UnreadIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import type { Notification } from '@/features/notifications/hooks/useNotifications';
import { useLanguage } from '@/providers/LanguageContext';

type FilterType = 'all' | 'unread' | 'read';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'comment':
      return <InfoIcon color="info" />;
    case 'rating':
      return <CheckCircleIcon color="success" />;
    case 'evaluation_due':
      return <AssignmentIcon color="warning" />;
    case 'approval_required':
      return <WarningIcon color="error" />;
    case 'project_updated':
      return <InfoIcon color="info" />;
    default:
      return <InfoIcon color="action" />;
  }
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= weekAgo) return 'This Week';
  return 'Earlier';
}

export default function NotificationsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('all');
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const filteredNotifications = useMemo(() => {
    const list = notifications || [];
    if (filter === 'unread') return list.filter(n => !n.is_read);
    if (filter === 'read') return list.filter(n => n.is_read);
    return list;
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    for (const n of filteredNotifications) {
      const group = getDateGroup(n.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    }

    return order
      .filter(g => groups[g] && groups[g].length > 0)
      .map(g => ({ label: g, items: groups[g] }));
  }, [filteredNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.project?.slug) {
      router.push(`/pr/${notification.project.slug}`);
    } else if (notification.project?.id) {
      router.push(`/pr/${notification.project.id}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: { xs: 3, md: 5 },
              bgcolor: theme.palette.background.paper,
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[4],
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                borderRadius: '50%',
                width: 240,
                height: 240,
                top: -120,
                right: -80,
                background: `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.07)} 0%, transparent 60%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 64, md: 80 },
                  height: { xs: 64, md: 80 },
                  bgcolor: theme.palette.warning.main,
                  boxShadow: theme.shadows[6],
                }}
              >
                <NotificationsIcon sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.warning.contrastText }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1.8rem', md: '2.4rem' },
                    }}
                  >
                    {t('Notifications')}
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      color="error"
                      sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                    />
                  )}
                </Stack>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                  {t('Stay updated on your projects and activities')}
                </Typography>
              </Box>
              <Tooltip title={t('Refresh')}>
                <IconButton
                  onClick={refreshNotifications}
                  disabled={loading}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        </Fade>

        <Fade in timeout={900}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              bgcolor: theme.palette.background.paper,
              borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, val) => val && setFilter(val as FilterType)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  borderRadius: `${theme.shape.borderRadius}px !important`,
                },
              }}
            >
              <ToggleButton value="all">{t('All')}</ToggleButton>
              <ToggleButton value="unread">
                <UnreadIcon sx={{ fontSize: 18, mr: 0.5 }} />
                {t('Unread')}
              </ToggleButton>
              <ToggleButton value="read">{t('Read')}</ToggleButton>
            </ToggleButtonGroup>

            {(notifications || []).length > 0 && (
              <Stack direction="row" spacing={1}>
                {unreadCount > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DoneAllIcon />}
                    onClick={markAllAsRead}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('Mark All Read')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={deleteAllNotifications}
                  disabled={loading}
                  color="error"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('Delete All')}
                </Button>
              </Stack>
            )}
          </Paper>
        </Fade>

        {error && (
          <Fade in timeout={400}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px` }}>
              {error}
            </Alert>
          </Fade>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 8 },
                textAlign: 'center',
                borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  mx: 'auto',
                  mb: 3,
                  border: `3px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <InboxIcon sx={{ fontSize: 50, color: theme.palette.warning.main }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                {filter === 'unread'
                  ? t('No unread notifications')
                  : filter === 'read'
                    ? t('No read notifications')
                    : t('No notifications yet')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 400, mx: 'auto' }}>
                {t("You'll see notifications here when you receive comments, ratings, or other updates.")}
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Fade in timeout={1000}>
            <Box>
              {groupedNotifications.map(({ label, items }) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      letterSpacing: 1.5,
                      px: 2,
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {t(label)}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: `${Number(theme.shape.borderRadius) * 1.4}px`,
                      border: `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden',
                    }}
                  >
                    <List disablePadding>
                      {items.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 3,
                              bgcolor: notification.is_read
                                ? 'transparent'
                                : alpha(theme.palette.primary.main, 0.04),
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              },
                            }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                              {getNotificationIcon(notification.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: notification.is_read ? 500 : 700,
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                  {!notification.is_read && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: theme.palette.primary.main,
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </Stack>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                                    {notification.message}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                    {formatRelativeDate(notification.created_at)}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Tooltip title={t('Delete')}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                sx={{
                                  ml: 1,
                                  opacity: 0.5,
                                  '&:hover': { opacity: 1, color: theme.palette.error.main },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItem>
                          {index < items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
