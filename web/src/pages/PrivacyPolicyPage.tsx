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

export const PrivacyPolicyPage: React.FC = () => {
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
          Privacy Policy
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

Fahras ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services (collectively, the "Service"). Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service.`}
        />

        {/* Information We Collect */}
        <Section
          title="2. Information We Collect"
          content={`[PLACEHOLDER — Replace with actual legal text]

We may collect information about you in a variety of ways. The information we may collect on the Site includes:

Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.

Financial Data: Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.

Data From Social Networks: User information from social networks, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.`}
        />

        {/* How We Use Information */}
        <Section
          title="3. How We Use Information"
          content={`[PLACEHOLDER — Replace with actual legal text]

Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:

• Create and manage your account
• Email you regarding your account or order
• Fulfill and send orders, and send related information
• Generate a personal profile about you
• Increase the efficiency and operation of the Site
• Monitor and analyze usage and trends to improve your experience with the Site
• Notify you of updates to the Site
• Offer new products, services, and/or recommendations to you`}
        />

        {/* Data Sharing */}
        <Section
          title="4. Data Sharing"
          content={`[PLACEHOLDER — Replace with actual legal text]

We do not sell, trade, or rent your personal information to third parties. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers for the purposes outlined above. We may also share your information when we believe in good faith that disclosure is necessary to protect our rights, your safety or the safety of others, investigate fraud, or respond to a government request.`}
        />

        {/* Security */}
        <Section
          title="5. Security"
          content={`[PLACEHOLDER — Replace with actual legal text]

We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. If you have any questions about the security of your personal information, you can contact us at the address listed below.`}
        />

        {/* Your Rights */}
        <Section
          title="6. Your Rights"
          content={`[PLACEHOLDER — Replace with actual legal text]

Depending on your location, you may have certain rights regarding your personal information, including:

• The right to access your personal data
• The right to correct inaccurate data
• The right to request deletion of your data
• The right to restrict processing of your data
• The right to data portability
• The right to object to processing
• The right to withdraw consent

To exercise any of these rights, please contact us using the information provided in the Contact Information section below.`}
        />

        {/* Cookies */}
        <Section
          title="7. Cookies"
          content={`[PLACEHOLDER — Replace with actual legal text]

The Site may use "cookies" to enhance your experience. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow). Cookies enable the Site's systems to recognize your browser and capture and remember certain information. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies through your browser settings. If you turn cookies off, some of the features that make your site experience more efficient may not function properly.`}
        />

        {/* Contact Information */}
        <Section
          title="8. Contact Information"
          content={`[PLACEHOLDER — Replace with actual legal text]

If you have questions or comments about this Privacy Policy, please contact us at:

Email: privacy@fahras.edu
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
          <strong>Note:</strong> This is a placeholder Privacy Policy page. The actual privacy policy should be drafted by qualified legal counsel and tailored to your specific jurisdiction, data processing practices, and applicable regulations (such as GDPR, CCPA, or local data protection laws).
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
