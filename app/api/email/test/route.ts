import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAnalysisCompleteEmail,
  sendSubscriptionConfirmationEmail,
  sendCreditsLowEmail
} from '@/lib/email/resend-client';

// Only allow in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Test email address
const TEST_EMAIL = 'test@truecheckia.com';
const TEST_USER_NAME = 'João Silva';

// Mock data for testing
const mockAnalysisResult = {
  text: 'Este é um texto de exemplo para testar a funcionalidade de detecção de IA. O texto contém várias frases e parágrafos para simular uma análise real.',
  aiProbability: 75.8,
  isAiGenerated: true,
  analysisId: 'test-analysis-123',
};

const mockPlanDetails = {
  creditsPerMonth: 500,
  price: 29.90,
  features: [
    'Análises ilimitadas de texto',
    'Relatórios detalhados',
    'Suporte prioritário',
    'API access',
    'Histórico completo'
  ],
};

export async function GET(request: NextRequest) {
  // Only allow in development
  if (!isDevelopment) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test endpoint only available in development' 
      },
      { status: 403 }
    );
  }

  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Resend API key not configured' 
      },
      { status: 500 }
    );
  }

  // Get test type from query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const email = searchParams.get('email') || TEST_EMAIL;

  try {
    let result;
    let testDescription;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(email, TEST_USER_NAME);
        testDescription = 'Welcome email test';
        break;

      case 'reset-password':
        const testToken = 'test-reset-token-123456';
        result = await sendPasswordResetEmail(email, testToken, TEST_USER_NAME);
        testDescription = 'Password reset email test';
        break;

      case 'analysis-complete':
        result = await sendAnalysisCompleteEmail(email, TEST_USER_NAME, mockAnalysisResult);
        testDescription = 'Analysis complete email test';
        break;

      case 'subscription-confirmation':
        result = await sendSubscriptionConfirmationEmail(
          email, 
          TEST_USER_NAME, 
          'Pro', 
          mockPlanDetails
        );
        testDescription = 'Subscription confirmation email test';
        break;

      case 'credits-low':
        const remainingCredits = 3;
        result = await sendCreditsLowEmail(email, TEST_USER_NAME, remainingCredits);
        testDescription = 'Credits low warning email test';
        break;

      case 'all':
        // Send all test emails
        const results = await Promise.allSettled([
          sendWelcomeEmail(email, TEST_USER_NAME),
          sendPasswordResetEmail(email, 'test-token-123', TEST_USER_NAME),
          sendAnalysisCompleteEmail(email, TEST_USER_NAME, mockAnalysisResult),
          sendSubscriptionConfirmationEmail(email, TEST_USER_NAME, 'Pro', mockPlanDetails),
          sendCreditsLowEmail(email, TEST_USER_NAME, 2),
        ]);

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const totalCount = results.length;

        return NextResponse.json({
          success: successCount > 0,
          message: `Sent ${successCount}/${totalCount} test emails`,
          results: results.map((result, index) => ({
            type: ['welcome', 'reset-password', 'analysis-complete', 'subscription-confirmation', 'credits-low'][index],
            status: result.status,
            ...(result.status === 'fulfilled' 
              ? { success: result.value.success, id: result.value.id }
              : { error: result.reason }
            )
          }))
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type',
          available_types: [
            'welcome',
            'reset-password', 
            'analysis-complete',
            'subscription-confirmation',
            'credits-low',
            'all'
          ],
          usage: 'GET /api/email/test?type=welcome&email=your@email.com'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      message: `${testDescription} - ${result.message}`,
      test_data: {
        type,
        email,
        ...(type === 'analysis-complete' && { analysisResult: mockAnalysisResult }),
        ...(type === 'subscription-confirmation' && { planDetails: mockPlanDetails }),
      },
      result
    });

  } catch (error) {
    console.error('Email test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development
  if (!isDevelopment) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test endpoint only available in development' 
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, email = TEST_EMAIL, customData } = body;

    let result;
    let testDescription;

    switch (type) {
      case 'welcome':
        const userName = customData?.userName || TEST_USER_NAME;
        result = await sendWelcomeEmail(email, userName);
        testDescription = 'Custom welcome email test';
        break;

      case 'reset-password':
        const resetData = customData || { resetToken: 'custom-token-123', userName: TEST_USER_NAME };
        result = await sendPasswordResetEmail(email, resetData.resetToken, resetData.userName);
        testDescription = 'Custom password reset email test';
        break;

      case 'analysis-complete':
        const analysisData = customData || { userName: TEST_USER_NAME, analysisResult: mockAnalysisResult };
        result = await sendAnalysisCompleteEmail(email, analysisData.userName, analysisData.analysisResult);
        testDescription = 'Custom analysis complete email test';
        break;

      case 'subscription-confirmation':
        const subData = customData || { userName: TEST_USER_NAME, planName: 'Pro', planDetails: mockPlanDetails };
        result = await sendSubscriptionConfirmationEmail(
          email, 
          subData.userName, 
          subData.planName, 
          subData.planDetails
        );
        testDescription = 'Custom subscription confirmation email test';
        break;

      case 'credits-low':
        const creditsData = customData || { userName: TEST_USER_NAME, remainingCredits: 1 };
        result = await sendCreditsLowEmail(email, creditsData.userName, creditsData.remainingCredits);
        testDescription = 'Custom credits low email test';
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type',
          available_types: [
            'welcome',
            'reset-password',
            'analysis-complete', 
            'subscription-confirmation',
            'credits-low'
          ]
        }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      message: `${testDescription} - ${result.message}`,
      test_data: {
        type,
        email,
        customData
      },
      result
    });

  } catch (error) {
    console.error('Email test POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}