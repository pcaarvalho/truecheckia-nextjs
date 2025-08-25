import React from 'react';

interface SimpleWelcomeEmailProps {
  userName: string;
}

export const SimpleWelcomeEmail = ({ userName }: SimpleWelcomeEmailProps) => {
  return (
    <html>
      <head>
        <title>Welcome to TrueCheckIA</title>
      </head>
      <body style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        margin: '0',
        padding: '20px',
        backgroundColor: '#f6f9fc'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#3b82f6', fontSize: '24px', margin: '0' }}>TrueCheckIA</h1>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              AI-generated content detection
            </p>
          </div>
          
          <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '20px' }}>
            Welcome, {userName}!
          </h2>
          
          <p style={{ color: '#333', fontSize: '16px', marginBottom: '20px' }}>
            Thank you for joining TrueCheckIA, the leading platform for AI-generated 
            content detection.
          </p>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#0c4a6e', fontSize: '16px', margin: '0 0 15px 0' }}>
              What you can do with TrueCheckIA:
            </h3>
            <ul style={{ color: '#334155', fontSize: '14px', marginLeft: '0', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Detect AI-generated content with high accuracy</li>
              <li style={{ marginBottom: '8px' }}>Analyze texts, articles, and documents</li>
              <li style={{ marginBottom: '8px' }}>Generate detailed analysis reports</li>
              <li style={{ marginBottom: '8px' }}>Access complete analysis history</li>
            </ul>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <a href="https://truecheckia.com/dashboard" style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Get started now
            </a>
          </div>
          
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#92400e', fontSize: '14px', margin: '0' }}>
              <strong>🎉 You received 10 free credits!</strong><br/>
              Each analysis uses 1 credit.
            </p>
          </div>
          
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
            If you have any questions, don&apos;t hesitate to contact us. 
            We&apos;re here to help!
          </p>
          
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0' }}>
              TrueCheckIA - Cutting-edge AI detection technology
            </p>
            <p style={{ color: '#666', fontSize: '12px', margin: '0' }}>
              <a href="https://truecheckia.com/privacy" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Privacy Policy
              </a>
              {' | '}
              <a href="https://truecheckia.com/terms" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Terms of Service
              </a>
              {' | '}
              <a href="https://truecheckia.com/contact" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                Contact
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default SimpleWelcomeEmail;