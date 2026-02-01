import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Rating,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Star as StarIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { apiService } from '@/lib/api';

interface Comment {
  id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

interface ProjectRating {
  id: number;
  user_name: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

interface ProjectInteractionsProps {
  projectId: number;
  onCommentAdded?: () => void;
  onRatingAdded?: () => void;
}

export const ProjectInteractions: React.FC<ProjectInteractionsProps> = ({
  projectId,
  onCommentAdded,
  onRatingAdded,
}) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock data for comments and ratings - in a real app, these would come from the API
  const [comments] = useState<Comment[]>([
    {
      id: 1,
      user_name: 'Ahmed Al-Rashid',
      comment: 'This is an excellent project with innovative ideas!',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      user_name: 'Sarah Johnson',
      comment: 'Great work on the implementation. The documentation is very clear.',
      created_at: '2024-01-14T15:45:00Z',
    },
  ]);

  const [ratings] = useState<ProjectRating[]>([
    {
      id: 1,
      user_name: 'Dr. Mohammed Al-Sayed',
      rating: 5,
      feedback: 'Outstanding project with excellent research methodology.',
      created_at: '2024-01-15T09:15:00Z',
    },
    {
      id: 2,
      user_name: 'Prof. Fatima Al-Zahra',
      rating: 4,
      feedback: 'Very good work with room for improvement in the conclusion.',
      created_at: '2024-01-14T14:20:00Z',
    },
  ]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      setError(null);
      
      await apiService.addComment(projectId, comment);
      
      setComment('');
      setSuccess('Comment added successfully!');
      onCommentAdded?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    try {
      setSubmittingRating(true);
      setError(null);
      
      await apiService.rateProject(projectId, rating, feedback || undefined);
      
      setRating(null);
      setFeedback('');
      setSuccess('Rating submitted successfully!');
      onRatingAdded?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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

  return (
    <Box sx={{ mt: 3 }}>
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Add Comment Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentIcon />
            Add Comment
          </Typography>
          <form onSubmit={handleCommentSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this project..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!comment.trim() || submittingComment}
            >
              {submittingComment ? 'Adding...' : 'Add Comment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Rate Project Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon />
            Rate Project
          </Typography>
          <form onSubmit={handleRatingSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Rating
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback about your rating..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<StarIcon />}
              disabled={!rating || submittingRating}
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {comments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>
            <List>
              {comments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        {comment.user_name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2">
                            {comment.user_name}
                          </Typography>
                          <Chip
                            label={formatDate(comment.created_at)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {comment.comment}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Ratings Section */}
      {ratings.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ratings ({ratings.length})
            </Typography>
            <List>
              {ratings.map((rating, index) => (
                <React.Fragment key={rating.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        {rating.user_name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2">
                            {rating.user_name}
                          </Typography>
                          <Rating value={rating.rating} readOnly size="small" />
                          <Chip
                            label={formatDate(rating.created_at)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        rating.feedback && (
                          <Typography variant="body2" color="text.secondary">
                            {rating.feedback}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  {index < ratings.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
