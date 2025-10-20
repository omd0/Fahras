import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  Fade,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Message as MessageIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { Comment } from '../types';
import { apiService } from '../services/api';

interface ReadOnlyCommentSectionProps {
  projectId: number;
}

export const ReadOnlyCommentSection: React.FC<ReadOnlyCommentSectionProps> = ({ projectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComments(projectId);
      setComments(response.comments || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
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
        <ListItem sx={{ p: 3, pl: isReply ? 6 : 3 }}>
          <ListItemAvatar>
            <Avatar 
              src={comment.user?.avatar_url}
              sx={{ 
                width: 48, 
                height: 48,
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                fontWeight: 600,
                fontSize: '1.1rem',
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
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                />
              </Stack>
            }
            secondary={
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                  {comment.content}
                </Typography>
              </Paper>
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
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with gradient background */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white',
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

        <Box sx={{ p: 3 }}>
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }} 
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Enhanced Divider */}
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
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Divider>
          </Box>

          {/* Enhanced Comments List */}
          {comments.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
                This project doesn't have any comments yet.
              </Typography>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {comments.map((comment, index) => (
                <Fade in timeout={600 + index * 100} key={comment.id}>
                  <Box>
                    {renderComment(comment)}
                    {comment.replies && comment.replies.map((reply, replyIndex) => (
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
        </Box>
      </CardContent>
    </Card>
  );
};
