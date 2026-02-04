'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Stack,
  Fade,
  Slide,
} from '@mui/material';
import { legacyColors as guestColors } from '@/styles/theme/colorPalette';
import { designTokens } from '@/styles/designTokens';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import type { Comment } from '@/types';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';
import { getErrorMessage, getErrorStatus } from '@/utils/errorHandling';

interface CommentSectionProps {
  projectId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ projectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComments(projectId);
      setComments(response.comments || []);
    } catch (err: unknown) {
      if (getErrorStatus(err) === 401 && !user) {
        setComments([]);
        setError(null);
      } else {
        setError(getErrorMessage(err, 'Failed to fetch comments'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await apiService.addComment(projectId, newComment.trim());
      setComments(prev => [response.comment, ...prev]);
      setNewComment('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to add comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      const response = await apiService.addComment(projectId, replyText.trim(), parentId);
      setComments(prev => [response.comment, ...prev]);
      setReplyText('');
      setReplyingTo(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to add reply'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.user_id;

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
          }
        }}
      >
        <ListItem sx={{ p: 2, pl: isReply ? 4 : 2 }}>
          <ListItemAvatar>
            <Avatar
              src={comment.user?.avatar_url}
              sx={{
                width: 40,
                height: 40,
                background: designTokens.colors.surface[50],
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {comment.user?.full_name?.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                  {comment.user?.full_name}
                </Typography>
                <Chip
                  size="small"
                  label={formatDate(comment.created_at)}
                  variant="filled"
                  sx={{
                    fontSize: '0.75rem',
                    background: designTokens.colors.surface[50],
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                />
                {isOwner && (
                  <Chip
                    size="small"
                    label="You"
                    color="primary"
                    variant="filled"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            }
            secondary={
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    borderRadius: 1.5,
                    background: designTokens.colors.surface[50],
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                    {comment.content}
                  </Typography>
                </Paper>
                {!isReply && user && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<ReplyIcon />}
                      onClick={() => setReplyingTo(comment.id)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.dark',
                        },
                      }}
                    >
                      Reply
                    </Button>
                    {isOwner && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                )}
              </Box>
            }
          />
        </ListItem>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid rgba(189, 195, 199, 0.3)',
        overflow: 'hidden',
        background: guestColors.white,
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(44, 62, 80, 0.15)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            background: guestColors.primaryGradient,
            color: guestColors.white,
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ChatIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                Comments & Discussion
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MessageIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {comments.length} {comments.length !== 1 ? 'comments' : 'comment'}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {user && (
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                background: designTokens.colors.surface[50],
                border: '1px solid',
                borderColor: 'primary.light',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: designTokens.colors.surface[50],
                    color: 'white',
                  }}
                >
                  <MessageIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Share Your Thoughts
                </Typography>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="What are your thoughts on this project? Share your insights..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: '56px',
                    fontSize: '0.875rem',
                  },
                }}
              />

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={submitting ? <CircularProgress size={12} /> : <SendIcon sx={{ fontSize: 16 }} />}
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  sx={{
                    background: guestColors.softYellow,
                    color: guestColors.white,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    '&:hover': {
                      background: guestColors.softOrange,
                    },
                    '&:disabled': {
                      background: guestColors.lightGray,
                      color: guestColors.darkGray,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Stack>
            </Paper>
          )}

          {!user && comments.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 3,
                borderRadius: 2,
                background: designTokens.colors.surface[50],
                border: '1px solid',
                borderColor: 'warning.light',
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                Want to join the discussion?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please log in to add comments and ratings to this project.
              </Typography>
            </Paper>
          )}

          {!user && comments.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: designTokens.colors.surface[50],
                border: '1px solid',
                borderColor: 'primary.light',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Want to join the discussion?
                <Button
                  variant="text"
                  size="small"
                  onClick={() => { window.location.href = '/login'; }}
                  sx={{ ml: 1, color: 'primary.main', fontWeight: 600 }}
                >
                  Sign in
                </Button>
                to add your own comments!
              </Typography>
            </Paper>
          )}

          <Box sx={{ mb: 3 }}>
            <Divider
              sx={{
                '&::before, &::after': {
                  borderColor: 'divider',
                }
              }}
            >
              <Chip
                label="Discussion"
                size="small"
                sx={{
                  background: designTokens.colors.surface[50],
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              />
            </Divider>
          </Box>

          {comments.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: designTokens.colors.surface[50],
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: designTokens.colors.primary[600],
                  color: 'white',
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ChatIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                No comments yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to start the discussion and share your thoughts!
              </Typography>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {(comments || []).map((comment, index) => (
                <Fade in timeout={600 + index * 100} key={comment.id}>
                  <Box>
                    {renderComment(comment)}
                    {(comment.replies || []).map((reply) => (
                      <Box key={reply.id}>
                        <Divider variant="inset" component="li" sx={{ ml: 6 }} />
                        {renderComment(reply, true)}
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                  </Box>
                </Fade>
              ))}
            </List>
          )}

          {user && (
            <Slide direction="up" in={!!replyingTo} timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  background: designTokens.colors.surface[50],
                  border: '1px solid',
                  borderColor: 'warning.light',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      background: designTokens.colors.surface[50],
                      color: 'white',
                    }}
                  >
                    <ReplyIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    Write a Reply
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  variant="outlined"
                  size="medium"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      minHeight: '56px',
                      fontSize: '0.875rem',
                    },
                  }}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={submitting ? <CircularProgress size={12} /> : <SendIcon sx={{ fontSize: 16 }} />}
                    onClick={() => replyingTo && handleSubmitReply(replyingTo)}
                    disabled={!replyText.trim() || submitting}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      py: 0.5,
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {submitting ? 'Posting...' : 'Reply'}
                  </Button>
                </Stack>
              </Paper>
            </Slide>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 500 }}>
          Edit Comment
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main', fontWeight: 500 }}>
          Delete Comment
        </MenuItem>
      </Menu>
    </Card>
  );
};
