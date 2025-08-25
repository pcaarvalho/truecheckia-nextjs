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

interface CreditsLowEmailProps {
  userName: string;
  remainingCredits: number;
}

export const CreditsLowEmail = ({ userName, remainingCredits }: CreditsLowEmailProps) => {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard`;
  const pricingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/pricing`;
  const billingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard/billing`;

  const isVeryLow = remainingCredits <= 2;
  const urgencyColor = isVeryLow ? '#dc2626' : '#f59e0b';
  const urgencyText = isVeryLow 
    ? 'Your credits are almost depleted!' 
    : 'Your credits are running low';

  return (
    <Html>
      <Head />
      <Preview>Alert: {`${remainingCredits}`} credits remaining - TrueCheckIA</Preview>
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
          
          <Heading style={h1}>{urgencyText}</Heading>
          
          <Text style={text}>Hello {userName},</Text>
          
          <Text style={text}>
            This is a friendly reminder that you have only{' '}
            <strong>{remainingCredits} credit{remainingCredits !== 1 ? 's' : ''}</strong> remaining in your account.
          </Text>
          
          <Section style={{...warningBox, borderColor: urgencyColor}}>
            <Text style={{...warningIcon, color: urgencyColor}}>
              {isVeryLow ? '🚨' : '⚠️'}
            </Text>
            <Text style={{...warningTitle, color: urgencyColor}}>
              {isVeryLow ? 'Action Required!' : 'Attention Needed'}
            </Text>
            <Text style={warningText}>
              {isVeryLow 
                ? 'You have only a few credits remaining. Consider recharging now to avoid interrupting your analyses.'
                : 'To continue using TrueCheckIA without interruptions, consider purchasing more credits or subscribing to a plan.'
              }
            </Text>
          </Section>
          
          <Section style={optionsBox}>
            <Text style={optionsTitle}>💡 Options to continue using:</Text>
            
            <Section style={optionItem}>
              <Text style={optionTitle}>🔄 Subscribe to a monthly plan</Text>
              <Text style={optionDescription}>
                Receive credits automatically every month and never worry about limits again.
              </Text>
              <Button style={primaryButton} href={pricingUrl}>
                View Plans
              </Button>
            </Section>
            
            <Section style={optionItem}>
              <Text style={optionTitle}>💳 Buy individual credits</Text>
              <Text style={optionDescription}>
                Purchase credits as needed, without monthly commitment.
              </Text>
              <Button style={secondaryButton} href={billingUrl}>
                Buy Credits
              </Button>
            </Section>
          </Section>
          
          <Section style={plansPreview}>
            <Text style={plansTitle}>Our popular plans:</Text>
            
            <Section style={planRow}>
              <Section style={planCard}>
                <Text style={planName}>Pro Plan</Text>
                <Text style={planPrice}>$29.90/month</Text>
                <Text style={planCredits}>500 credits</Text>
              </Section>
              
              <Section style={planCard}>
                <Text style={planName}>Enterprise Plan</Text>
                <Text style={planPrice}>$99.90/month</Text>
                <Text style={planCredits}>2,000 credits</Text>
              </Section>
            </Section>
          </Section>
          
          <Text style={text}>
            Remember: each content analysis consumes 1 credit. With an active plan, 
            you&apos;ll never run out of credits and gain access to exclusive features.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={primaryButton} href={dashboardUrl}>
              View My Account
            </Button>
          </Section>
          
          <Text style={text}>
            If you have any questions about credits or plans, our team is 
            always ready to help.
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

export default CreditsLowEmail;

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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  margin: '24px 20px',
  padding: '20px',
  textAlign: 'center' as const,
};

const warningIcon = {
  fontSize: '32px',
  margin: '0 0 8px 0',
};

const warningTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const optionsBox = {
  margin: '32px 20px',
};

const optionsTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
};

const optionItem = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  margin: '16px 0',
  padding: '16px',
  textAlign: 'center' as const,
};

const optionTitle = {
  color: '#334155',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const optionDescription = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
};

const plansPreview = {
  margin: '32px 20px',
};

const plansTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const planRow = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
};

const planCard = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: '6px',
  padding: '16px',
  textAlign: 'center' as const,
  minWidth: '140px',
  flex: '1',
  maxWidth: '200px',
};

const planName = {
  color: '#0c4a6e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const planPrice = {
  color: '#0ea5e9',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const planCredits = {
  color: '#475569',
  fontSize: '12px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '4px',
};

const secondaryButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  margin: '4px',
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