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
} from '@mui/material';
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
            </Box>
          }
          secondary={
            <Typography variant="body2" sx={{ mt: 1 }}>
              {comment.content}
            </Typography>
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e3a8a' }}>
          Comments ({comments.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Comments list */}
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet.
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
      </CardContent>
    </Card>
  );
};
