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
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { Comment } from '../types';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

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
  const [selectedComment, setSelectedComment] = useState<number | null>(null);

  const { user } = useAuthStore();

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

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await apiService.addComment(projectId, newComment.trim());
      setComments(prev => [response.comment, ...prev]);
      setNewComment('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add comment');
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
    setMenuAnchor(event.currentTarget);
    setSelectedComment(commentId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedComment(null);
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
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <ListItem key={comment.id} sx={{ pl: isReply ? 4 : 0 }}>
        <ListItemAvatar>
          <Avatar src={comment.user?.avatar_url}>
            {comment.user?.full_name?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                {comment.user?.full_name}
              </Typography>
              <Chip 
                size="small" 
                label={formatDate(comment.created_at)} 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              {isOwner && (
                <Chip 
                  size="small" 
                  label="You" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                {comment.content}
              </Typography>
              {!isReply && !user?.roles?.some(role => role.name === 'reviewer') && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setReplyingTo(comment.id)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <ReplyIcon fontSize="small" />
                    Reply
                  </IconButton>
                  {isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, comment.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Add new comment - hidden for reviewers */}
        {!user?.roles?.some(role => role.name === 'reviewer') && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Comments list */}
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <List>
            {comments.map((comment) => (
              <Box key={comment.id}>
                {renderComment(comment)}
                {comment.replies && comment.replies.map((reply) => (
                  <Box key={reply.id}>
                    <Divider variant="inset" component="li" />
                    {renderComment(reply, true)}
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
          </List>
        )}

        {/* Reply form - hidden for reviewers */}
        {replyingTo && !user?.roles?.some(role => role.name === 'reviewer') && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Reply to comment
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={() => handleSubmitReply(replyingTo)}
                disabled={!replyText.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Reply'}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Comment menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Edit Comment</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Delete Comment
        </MenuItem>
      </Menu>
    </Card>
  );
};
