import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  userName: string;
  resetToken: string;
}

export const ResetPasswordEmail = ({ userName, resetToken }: ResetPasswordEmailProps) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/reset-password?token=${resetToken}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your TrueCheckIA password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://truecheckia.com/logo.png"
              width="120"
              height="36"
              alt="TrueCheckIA"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Reset your password</Heading>
          
          <Text style={text}>Hello {userName},</Text>
          
          <Text style={text}>
            We received a request to reset the password for your TrueCheckIA account.
          </Text>
          
          <Text style={text}>
            Click the button below to create a new password:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            If you can&apos;t click the button, copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Important:</strong> This reset link expires in 1 hour for security reasons.
            </Text>
          </Section>
          
          <Text style={text}>
            If you did not request this password reset, you can safely ignore this email. 
            Your account will remain secure.
          </Text>
          
          <Text style={text}>
            If you have any questions or need assistance, please contact our support team.
          </Text>
          
          <Section style={footer}>
            <Text style={footerText}>
              TrueCheckIA - Cutting-edge AI detection technology
            </Text>
            <Text style={footerLinks}>
              <Link href="https://truecheckia.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {' | '}
              <Link href="https://truecheckia.com/terms" style={link}>
                Terms of Service
              </Link>
              {' | '}
              <Link href="https://truecheckia.com/contact" style={link}>
                Contact
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const linkText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 20px',
  wordBreak: 'break-all' as const,
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  margin: '24px 20px',
  padding: '16px',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footer = {
  borderTop: '1px solid #eaeaea',
  marginTop: '32px',
  padding: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const footerLinks = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};