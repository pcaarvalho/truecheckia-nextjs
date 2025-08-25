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

interface PlanDetails {
  creditsPerMonth: number;
  price: number;
  features: string[];
}

interface SubscriptionConfirmationEmailProps {
  userName: string;
  planName: string;
  planDetails: PlanDetails;
}

export const SubscriptionConfirmationEmail = ({ 
  userName, 
  planName, 
  planDetails 
}: SubscriptionConfirmationEmailProps) => {
  const { creditsPerMonth, price, features } = planDetails;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard`;
  const billingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard/billing`;

  return (
    <Html>
      <Head />
      <Preview>{planName} subscription confirmed - TrueCheckIA</Preview>
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
          
          <Heading style={h1}>Subscription Confirmed! 🎉</Heading>
          
          <Text style={textStyle}>Hello {userName},</Text>
          
          <Text style={textStyle}>
            Congratulations! Your <strong>{planName}</strong> plan subscription has been successfully confirmed.
          </Text>
          
          <Section style={planBox}>
            <Text style={planTitle}>Your subscription details</Text>
            <Text style={planNameStyle}>{planName} Plan</Text>
            <Text style={planPrice}>${price.toFixed(2)}/month</Text>
            <Text style={planCredits}>
              {creditsPerMonth.toLocaleString()} credits per month
            </Text>
          </Section>
          
          <Section style={featuresBox}>
            <Text style={featuresTitle}>What&apos;s included:</Text>
            {features.map((feature, index) => (
              <Text key={index} style={featureItem}>
                ✅ {feature}
              </Text>
            ))}
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Access Dashboard
            </Button>
          </Section>
          
          <Section style={infoBox}>
            <Text style={infoTitle}>📋 Important information</Text>
            <Text style={infoText}>
              • Your credits are automatically renewed every month<br/>
              • You can cancel your subscription at any time<br/>
              • The next payment will be processed in 30 days<br/>
              • You will receive an invoice by email before each charge
            </Text>
          </Section>
          
          <Text style={textStyle}>
            Your {creditsPerMonth.toLocaleString()} monthly credits are now available in your account. 
            Start using them right away!
          </Text>
          
          <Section style={managementBox}>
            <Text style={managementTitle}>Manage subscription</Text>
            <Text style={managementText}>
              To change your plan, update payment information, or cancel your subscription, 
              access the billing area in your dashboard.
            </Text>
            <Button style={secondaryButton} href={billingUrl}>
              Manage Subscription
            </Button>
          </Section>
          
          <Text style={textStyle}>
            If you have any questions about your subscription or need support, 
            our team is always available to help.
          </Text>
          
          <Text style={textStyle}>
            Thank you for choosing TrueCheckIA!
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

export default SubscriptionConfirmationEmail;

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

const textStyle = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 20px',
};

const planBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '8px',
  margin: '24px 20px',
  padding: '20px',
  textAlign: 'center' as const,
};

const planTitle = {
  color: '#0c4a6e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
};

const planNameStyle = {
  color: '#0c4a6e',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const planPrice = {
  color: '#0ea5e9',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const planCredits = {
  color: '#475569',
  fontSize: '16px',
  margin: '0',
};

const featuresBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  margin: '24px 20px',
  padding: '16px',
};

const featuresTitle = {
  color: '#334155',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const featureItem = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '6px 0',
};

const infoBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  margin: '24px 20px',
  padding: '16px',
};

const infoTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const infoText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const managementBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  margin: '24px 20px',
  padding: '16px',
  textAlign: 'center' as const,
};

const managementTitle = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const managementText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
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