import { Resend } from 'resend';
import type { ReactElement } from 'react';

// Debug helper for logging
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL DEBUG] ${message}`, data || '');
  }
}

// Validate Resend configuration
function validateResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  
  debugLog('Validating Resend configuration', {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 3) + '***' : 'missing',
    fromEmail: fromEmail || 'missing'
  });
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  
  if (!apiKey.startsWith('re_')) {
    throw new Error('Invalid RESEND_API_KEY format. Must start with "re_"');
  }
  
  return { apiKey, fromEmail };
}

// Render template to HTML - improved handling
function renderTemplate(template: ReactElement | string): string {
  // If it's already a string (HTML), return it
  if (typeof template === 'string') {
    return template;
  }
  
  // For React components, we need to render them to HTML
  // For now, return a simple fallback string representation
  // In production, you would use @react-email/render or similar
  return template.toString();
}

// Initialize Resend client with validation
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    try {
      const { apiKey } = validateResendConfig();
      resendInstance = new Resend(apiKey);
      debugLog('Resend client initialized successfully');
    } catch (error) {
      debugLog('Failed to initialize Resend client', error);
      throw error;
    }
  }
  return resendInstance;
}

// Default sender configuration
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'TrueCheckIA <noreply@truecheckia.com>';

// Email types for validation
export type EmailType = 
  | 'welcome' 
  | 'reset-password' 
  | 'analysis-complete' 
  | 'subscription-confirmation' 
  | 'credits-low';

// Base email interface
interface BaseEmail {
  to: string | string[];
  subject: string;
  template: ReactElement;
}

// Extended email interface with optional properties
interface SendEmailOptions extends BaseEmail {
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Email sending function
export async function sendEmail(options: SendEmailOptions) {
  try {
    debugLog('Starting email send process', {
      to: options.to,
      subject: options.subject,
      from: options.from || DEFAULT_FROM
    });

    const {
      to,
      subject,
      template,
      from = DEFAULT_FROM,
      replyTo,
      cc,
      bcc
    } = options;

    // Get Resend client (with validation)
    const resend = getResendClient();

    // Render template to HTML
    const html = renderTemplate(template);
    
    debugLog('Template rendered', {
      htmlLength: html.length,
      htmlPreview: html.substring(0, 100) + '...'
    });

    // Send email via Resend
    debugLog('Sending email via Resend API');
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
      cc,
      bcc,
    });

    if (error) {
      debugLog('Resend API error', error);
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
    }

    debugLog('Email sent successfully', {
      emailId: data?.id,
      to: to
    });

    return {
      success: true,
      id: data?.id,
      message: 'Email sent successfully'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    debugLog('Email sending failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('Email sending error:', error);
    
    // Return structured error response
    return {
      success: false,
      error: errorMessage,
      message: 'Failed to send email'
    };
  }
}

// Utility function to send welcome email
export async function sendWelcomeEmail(to: string, userName: string) {
  debugLog('Sending welcome email', { to, userName });
  
  try {
    // Validate inputs
    if (!to || !to.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    if (!userName) {
      userName = to.split('@')[0]; // Fallback to email prefix
    }
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Welcome to TrueCheckIA</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI-generated content detection</p>
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Welcome, ${userName}!</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Thank you for joining TrueCheckIA, the leading platform for AI-generated content detection.
          </p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <h3 style="color: #0c4a6e; font-size: 16px; margin: 0 0 15px 0;">What you can do with TrueCheckIA:</h3>
            <ul style="color: #334155; font-size: 14px; margin-left: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✅ Detect AI-generated content with high accuracy</li>
              <li style="margin-bottom: 8px;">✅ Analyze texts, articles, and documents</li>
              <li style="margin-bottom: 8px;">✅ Generate detailed analysis reports</li>
              <li style="margin-bottom: 8px;">✅ Access complete analysis history</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://truecheckia.com/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Get started now
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>🎉 You received 10 free credits!</strong><br/>
              Each analysis uses 1 credit.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
            If you have any questions, don't hesitate to contact us. We're here to help!
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style="color: #666; font-size: 12px; margin: 0;">
              <a href="https://truecheckia.com/privacy" style="color: #3b82f6; text-decoration: underline;">Privacy Policy</a>
              | <a href="https://truecheckia.com/terms" style="color: #3b82f6; text-decoration: underline;">Terms of Service</a>
              | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const result = await sendEmail({
    to,
    subject: 'Welcome to TrueCheckIA!',
    template: html as any
  });
  
  debugLog('Welcome email result', result);
  return result;
  
  } catch (error) {
    debugLog('Welcome email failed', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send welcome email:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      message: 'Failed to send welcome email'
    };
  }
}

// Utility function to send password reset email
export async function sendPasswordResetEmail(to: string, userName: string, resetUrl: string) {
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reset your password - TrueCheckIA</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI-generated content detection</p>
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">Reset your password</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Hello ${userName},</p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            We received a request to reset the password for your TrueCheckIA account.
          </p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Reset password
            </a>
          </div>
          
          <p style="color: #333; font-size: 14px; margin-bottom: 10px;">
            If you can't click the button, copy and paste this link in your browser:
          </p>
          
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin-bottom: 30px; background-color: #f8fafc; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 30px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>⚠️ Important:</strong> This reset link expires in 1 hour for security reasons.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            If you didn't request this password reset, you can safely ignore this email. Your account will remain secure.
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style="color: #666; font-size: 12px; margin: 0;">
              <a href="https://truecheckia.com/privacy" style="color: #3b82f6; text-decoration: underline;">Privacy Policy</a>
              | <a href="https://truecheckia.com/terms" style="color: #3b82f6; text-decoration: underline;">Terms of Service</a>
              | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: 'Reset your password - TrueCheckIA',
    template: html as any
  });
}

// Utility function to send analysis complete email
export async function sendAnalysisCompleteEmail(
  to: string, 
  userName: string, 
  analysisResult: {
    text: string;
    aiProbability: number;
    isAiGenerated: boolean;
    analysisId: string;
  }
) {
  const { aiProbability, isAiGenerated, analysisId, text } = analysisResult;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard/analysis/${analysisId}`;
  const textPreview = text.length > 150 ? `${text.substring(0, 150)}...` : text;
  
  const resultColor = isAiGenerated ? '#dc2626' : '#16a34a';
  const resultText = isAiGenerated 
    ? 'Content likely AI-generated' 
    : 'Content likely human-written';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Your TrueCheckIA analysis is complete - ${Math.round(aiProbability)}% AI probability</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI-generated content detection</p>
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">Analysis complete!</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Hello ${userName},</p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Your content analysis has been processed successfully. Here are the results:
          </p>
          
          <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #334155; font-size: 18px; margin: 0 0 12px 0;">Analysis Results</h3>
            <p style="color: ${resultColor}; font-size: 20px; font-weight: bold; margin: 8px 0;">
              ${resultText}
            </p>
            <p style="color: #475569; font-size: 16px; margin: 8px 0 0 0;">
              AI Probability: <strong>${Math.round(aiProbability)}%</strong>
            </p>
          </div>
          
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 30px;">
            <h4 style="color: #374151; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Analyzed text:</h4>
            <p style="color: #6b7280; font-size: 14px; font-style: italic; line-height: 20px; margin: 0;">
              "${textPreview}"
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View complete analysis
            </a>
          </div>
          
          <div style="background-color: #fef7cd; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 30px;">
            <h4 style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">💡 How to interpret the results</h4>
            <p style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0;">
              ${isAiGenerated ? (
                'A result above 50% indicates the text was likely generated by artificial intelligence. ' +
                'The higher the percentage, the greater the confidence in the detection.'
              ) : (
                'A result below 50% indicates the text was likely written by a human. ' +
                'The lower the percentage, the greater the confidence that it is human content.'
              )}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            You can access the complete analysis report in your dashboard. There you'll find more details and can download the results.
          </p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Thank you for using TrueCheckIA!
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style="color: #666; font-size: 12px; margin: 0;">
              <a href="https://truecheckia.com/privacy" style="color: #3b82f6; text-decoration: underline;">Privacy Policy</a>
              | <a href="https://truecheckia.com/terms" style="color: #3b82f6; text-decoration: underline;">Terms of Service</a>
              | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: 'Your analysis is complete - TrueCheckIA',
    template: html as any
  });
}

// Utility function to send subscription confirmation email
export async function sendSubscriptionConfirmationEmail(
  to: string, 
  userName: string, 
  planName: string,
  planDetails: {
    creditsPerMonth: number;
    price: number;
    features: string[];
  }
) {
  const { creditsPerMonth, price, features } = planDetails;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard`;
  const billingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}/dashboard/billing`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${planName} subscription confirmed - TrueCheckIA</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI-generated content detection</p>
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">Subscription confirmed! 🎉</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Hello ${userName},</p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Congratulations! Your <strong>${planName}</strong> plan subscription has been confirmed successfully.
          </p>
          
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <p style="color: #0c4a6e; font-size: 14px; font-weight: bold; margin: 0 0 12px 0; text-transform: uppercase;">Your subscription details</p>
            <h3 style="color: #0c4a6e; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">${planName} Plan</h3>
            <p style="color: #0ea5e9; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">$${price.toFixed(2)}/month</p>
            <p style="color: #475569; font-size: 16px; margin: 0;">
              ${creditsPerMonth.toLocaleString()} credits per month
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 30px;">
            <h3 style="color: #334155; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">What's included:</h3>
            ${features.map(feature => `
              <p style="color: #475569; font-size: 14px; line-height: 20px; margin: 6px 0;">
                ✅ ${feature}
              </p>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Access Dashboard
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 30px;">
            <h4 style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">📋 Important Information</h4>
            <p style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0;">
              • Your credits are automatically renewed every month<br/>
              • You can cancel your subscription at any time<br/>
              • The next payment will be processed in 30 days<br/>
              • You will receive an invoice by email before each charge
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Your ${creditsPerMonth.toLocaleString()} monthly credits are now available in your account. Start using them right away!
          </p>
          
          <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin-bottom: 30px; text-align: center;">
            <h4 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">Manage Subscription</h4>
            <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
              To change your plan, update payment information, or cancel your subscription, access the billing area in your dashboard.
            </p>
            <a href="${billingUrl}" style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              Manage Subscription
            </a>
          </div>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            Thank you for choosing TrueCheckIA!
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style="color: #666; font-size: 12px; margin: 0;">
              <a href="https://truecheckia.com/privacy" style="color: #3b82f6; text-decoration: underline;">Privacy Policy</a>
              | <a href="https://truecheckia.com/terms" style="color: #3b82f6; text-decoration: underline;">Terms of Service</a>
              | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: `${planName} subscription confirmation - TrueCheckIA`,
    template: html as any
  });
}

// Utility function to send credits low warning email
export async function sendCreditsLowEmail(to: string, userName: string, remainingCredits: number) {
  const isVeryLow = remainingCredits <= 2;
  const urgencyColor = isVeryLow ? '#dc2626' : '#f59e0b';
  const urgencyText = isVeryLow ? 'Your credits are almost depleted!' : 'Your credits are running low';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Warning: ${remainingCredits} credits remaining - TrueCheckIA</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI-generated content detection</p>
          </div>
          
          <h2 style="color: ${urgencyColor}; font-size: 20px; margin-bottom: 20px; text-align: center;">${urgencyText}</h2>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Hello ${userName},</p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
            This is a friendly reminder that you have only <strong>${remainingCredits} credit${remainingCredits !== 1 ? 's' : ''}</strong> remaining in your account.
          </p>
          
          <div style="background-color: #fef3c7; border: 2px solid ${urgencyColor}; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <p style="font-size: 32px; margin: 0 0 8px 0;">${isVeryLow ? '🚨' : '⚠️'}</p>
            <p style="color: ${urgencyColor}; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
              ${isVeryLow ? 'Action required!' : 'Attention needed'}
            </p>
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              ${isVeryLow 
                ? 'You only have a few credits remaining. Consider reloading now to avoid interrupting your analyses.'
                : 'To continue using TrueCheckIA without interruptions, consider purchasing more credits or subscribing to a plan.'
              }
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #334155; font-size: 18px; margin: 0 0 20px 0;">💡 Options to continue using:</h3>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 16px; margin-bottom: 16px; text-align: center;">
              <h4 style="color: #0c4a6e; font-size: 16px; margin: 0 0 8px 0;">🔄 Subscribe to a monthly plan</h4>
              <p style="color: #475569; font-size: 14px; margin: 0 0 16px 0;">
                Receive credits automatically every month and never worry about limits again.
              </p>
              <a href="https://truecheckia.com/pricing" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View plans
              </a>
            </div>
            
            <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; text-align: center;">
              <h4 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">💳 Buy individual credits</h4>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
                Purchase credits as needed, without monthly commitment.
              </p>
              <a href="https://truecheckia.com/dashboard/billing" style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                Buy credits
              </a>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
            Remember: each content analysis consumes 1 credit. With an active plan, you'll never run out of credits and have access to exclusive features.
          </p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://truecheckia.com/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View my account
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style="color: #666; font-size: 12px; margin: 0;">
              <a href="https://truecheckia.com/privacy" style="color: #3b82f6; text-decoration: underline;">Privacy Policy</a>
              | <a href="https://truecheckia.com/terms" style="color: #3b82f6; text-decoration: underline;">Terms of Service</a>
              | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: 'Your credits are running low - TrueCheckIA',
    template: html as any
  });
}

// Utility function to validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to get email domain
export function getEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

// Export functions to get resend client (for direct usage if needed)
export { getResendClient };
export const resend = getResendClient();