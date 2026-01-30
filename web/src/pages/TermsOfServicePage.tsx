import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { useLanguage } from '@/providers/LanguageContext';

export const TermsOfServicePage: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();

  const lastUpdated = 'January 30, 2025';

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          Terms of Service
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
          }}
        >
          Last updated: {lastUpdated}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Content Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Introduction */}
        <Section
          title="1. Introduction"
          content={`[PLACEHOLDER — Replace with actual legal text]

These Terms of Service ("Terms") govern your access to and use of the Fahras platform, including all content, features, and services offered through the website and mobile applications (collectively, the "Service"). By accessing or using Fahras, you agree to be bound by these Terms. If you do not agree to any part of these Terms, you may not use the Service.`}
        />

        {/* User Accounts */}
        <Section
          title="2. User Accounts"
          content={`[PLACEHOLDER — Replace with actual legal text]

To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. You are solely responsible for any unauthorized use of your account.`}
        />

        {/* Acceptable Use */}
        <Section
          title="3. Acceptable Use Policy"
          content={`[PLACEHOLDER — Replace with actual legal text]

You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited conduct includes, but is not limited to:
• Uploading or transmitting viruses or malicious code
• Harassing, threatening, or defaming other users
• Infringing on intellectual property rights
• Attempting to gain unauthorized access to the Service
• Collecting or tracking personal information of others without consent
• Spamming or sending unsolicited communications`}
        />

        {/* Intellectual Property */}
        <Section
          title="4. Intellectual Property Rights"
          content={`[PLACEHOLDER — Replace with actual legal text]

The Service and all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by Fahras, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws. You retain all rights to any content you submit to the Service, but grant Fahras a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content.`}
        />

        {/* Limitation of Liability */}
        <Section
          title="5. Limitation of Liability"
          content={`[PLACEHOLDER — Replace with actual legal text]

TO THE FULLEST EXTENT PERMITTED BY LAW, FAHRAS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR LOST BUSINESS OPPORTUNITIES, EVEN IF FAHRAS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOUR SOLE REMEDY FOR DISSATISFACTION WITH THE SERVICE IS TO STOP USING THE SERVICE.`}
        />

        {/* Changes to Terms */}
        <Section
          title="6. Changes to These Terms"
          content={`[PLACEHOLDER — Replace with actual legal text]

Fahras reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Service. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes. It is your responsibility to review these Terms periodically for updates.`}
        />

        {/* Contact Information */}
        <Section
          title="7. Contact Information"
          content={`[PLACEHOLDER — Replace with actual legal text]

If you have any questions about these Terms of Service, please contact us at:

Email: support@fahras.edu
Address: Technical College of Telecommunications and Information, Riyadh, Saudi Arabia

We will respond to your inquiry within a reasonable timeframe.`}
        />
      </Box>

      {/* Footer Note */}
      <Box
        sx={{
          mt: 6,
          p: 3,
          bgcolor: theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[50],
          borderRadius: 1,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          <strong>Note:</strong> This is a placeholder Terms of Service page. The actual legal terms should be drafted by qualified legal counsel and tailored to your specific jurisdiction and business requirements.
        </Typography>
      </Box>
    </Container>
  );
};

interface SectionProps {
  title: string;
  content: string;
}

const Section: React.FC<SectionProps> = ({ title, content }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </Typography>
    </Box>
  );
};
