'use client';

import { Container, Paper, Typography, Button } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function EvaluationsPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
        <Typography variant="h3" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Project evaluations and assessment tools are under development and will be available soon.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
