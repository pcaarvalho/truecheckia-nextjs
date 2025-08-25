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

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to TrueCheckIA - AI-generated content detection</Preview>
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
        
        <Heading style={h1}>Welcome to TrueCheckIA, {userName}!</Heading>
        
        <Text style={text}>
          Thank you for joining TrueCheckIA, the leading platform for detecting 
          AI-generated content.
        </Text>
        
        <Text style={text}>
          With TrueCheckIA, you can:
        </Text>
        
        <Section style={featuresList}>
          <Text style={featureItem}>✅ Detect AI-generated content with high accuracy</Text>
          <Text style={featureItem}>✅ Analyze texts, articles, and documents</Text>
          <Text style={featureItem}>✅ Generate detailed analysis reports</Text>
          <Text style={featureItem}>✅ Access complete analysis history</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Button style={button} href="https://truecheckia.com/dashboard">
            Get Started Now
          </Button>
        </Section>
        
        <Text style={text}>
          You start with <strong>10 free credits</strong> to test our platform. 
          Each analysis consumes 1 credit.
        </Text>
        
        <Text style={text}>
          If you have any questions, don&apos;t hesitate to contact us. 
          We&apos;re here to help!
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

export default WelcomeEmail;

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

const featuresList = {
  padding: '0 20px',
  margin: '24px 0',
};

const featureItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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