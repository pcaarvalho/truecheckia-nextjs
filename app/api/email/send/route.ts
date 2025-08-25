import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAnalysisCompleteEmail,
  sendSubscriptionConfirmationEmail,
  sendCreditsLowEmail,
  // EmailType,
  isValidEmail
} from '@/lib/email/resend-client';

// Rate limiting (simple in-memory store - in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 emails per minute per IP

// Base email request schema
const baseEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  type: z.enum(['welcome', 'reset-password', 'analysis-complete', 'subscription-confirmation', 'credits-low'] as const),
});

// Type-specific schemas
const welcomeEmailSchema = baseEmailSchema.extend({
  type: z.literal('welcome'),
  data: z.object({
    userName: z.string().min(1, 'User name is required'),
  }),
});

const resetPasswordSchema = baseEmailSchema.extend({
  type: z.literal('reset-password'),
  data: z.object({
    userName: z.string().min(1, 'User name is required'),
    resetToken: z.string().min(1, 'Reset token is required'),
  }),
});

const analysisCompleteSchema = baseEmailSchema.extend({
  type: z.literal('analysis-complete'),
  data: z.object({
    userName: z.string().min(1, 'User name is required'),
    analysisResult: z.object({
      text: z.string().min(1, 'Analysis text is required'),
      aiProbability: z.number().min(0).max(100),
      isAiGenerated: z.boolean(),
      analysisId: z.string().min(1, 'Analysis ID is required'),
    }),
  }),
});

const subscriptionConfirmationSchema = baseEmailSchema.extend({
  type: z.literal('subscription-confirmation'),
  data: z.object({
    userName: z.string().min(1, 'User name is required'),
    planName: z.string().min(1, 'Plan name is required'),
    planDetails: z.object({
      creditsPerMonth: z.number().min(0),
      price: z.number().min(0),
      features: z.array(z.string()),
    }),
  }),
});

const creditsLowSchema = baseEmailSchema.extend({
  type: z.literal('credits-low'),
  data: z.object({
    userName: z.string().min(1, 'User name is required'),
    remainingCredits: z.number().min(0),
  }),
});

// Union type for all email schemas
const emailRequestSchema = z.discriminatedUnion('type', [
  welcomeEmailSchema,
  resetPasswordSchema,
  analysisCompleteSchema,
  subscriptionConfirmationSchema,
  creditsLowSchema,
]);

// type EmailRequest = z.infer<typeof emailRequestSchema>;

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const current = rateLimitStore.get(identifier);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: current.resetTime };
  }

  // Increment count
  rateLimitStore.set(identifier, {
    ...current,
    count: current.count + 1,
  });

  return { allowed: true };
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service not configured' 
        },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      const resetTimeSeconds = rateLimitResult.resetTime 
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) 
        : 60;
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${resetTimeSeconds} seconds.`
        },
        { 
          status: 429,
          headers: {
            'Retry-After': resetTimeSeconds.toString(),
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request
    const validationResult = emailRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const emailRequest = validationResult.data;

    // Additional email validation
    if (!isValidEmail(emailRequest.to)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address format' 
        },
        { status: 400 }
      );
    }

    // Send email based on type
    let result;
    
    switch (emailRequest.type) {
      case 'welcome':
        result = await sendWelcomeEmail(
          emailRequest.to,
          emailRequest.data.userName
        );
        break;
        
      case 'reset-password':
        result = await sendPasswordResetEmail(
          emailRequest.to,
          emailRequest.data.resetToken,
          emailRequest.data.userName
        );
        break;
        
      case 'analysis-complete':
        result = await sendAnalysisCompleteEmail(
          emailRequest.to,
          emailRequest.data.userName,
          emailRequest.data.analysisResult
        );
        break;
        
      case 'subscription-confirmation':
        result = await sendSubscriptionConfirmationEmail(
          emailRequest.to,
          emailRequest.data.userName,
          emailRequest.data.planName,
          emailRequest.data.planDetails
        );
        break;
        
      case 'credits-low':
        result = await sendCreditsLowEmail(
          emailRequest.to,
          emailRequest.data.userName,
          emailRequest.data.remainingCredits
        );
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email type' 
          },
          { status: 400 }
        );
    }

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        id: result.id,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          message: result.message
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to process email request'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check email service status
export async function GET() {
  const isConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  
  return NextResponse.json({
    status: 'ok',
    service: 'Email API',
    configured: isConfigured,
    rateLimits: {
      window: `${RATE_LIMIT_WINDOW / 1000}s`,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    },
  });
}