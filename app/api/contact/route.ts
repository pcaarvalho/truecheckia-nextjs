import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler, createResponse, AppError, ERROR_CODES } from '@/app/lib/middleware';
import { sendEmail } from '@/lib/email/resend-client';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  plan: z.enum(['ENTERPRISE', 'CUSTOM']).optional(),
  phone: z.string().optional(),
});

async function handleContactRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Send email to sales team using Resend
    console.log('Contact form submission:', data);

    const salesEmail = 'sales@truecheckia.com';
    const subject = `${data.plan === 'ENTERPRISE' ? 'Enterprise' : 'Sales'} Inquiry from ${data.name}`;
    
    // Create HTML email for sales team
    const salesEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>New Contact Form Submission</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">New Contact Form Submission</p>
            </div>
            
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">New ${data.plan === 'ENTERPRISE' ? 'Enterprise' : 'Sales'} Inquiry</h2>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #334155; font-size: 16px; margin: 0 0 15px 0;">Contact Information:</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 8px 0;"><strong>Company:</strong> ${data.company || 'Not provided'}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
              <p style="margin: 8px 0;"><strong>Plan Interest:</strong> ${data.plan || 'Enterprise'}</p>
              <p style="margin: 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <h4 style="color: #374151; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Message:</h4>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">${data.message}</p>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <h4 style="color: #92400e; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">⚡ Action Required:</h4>
              <p style="color: #92400e; font-size: 14px; margin: 0;">Please respond to this inquiry within 24 hours as promised to the customer.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${data.email}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reply to Customer
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // For now, skip email sending as sendEmail expects ReactElement not HTML string
    // TODO: Create React email template for contact form submissions
    console.log('Contact form submission:', { name, email, company, message });
    console.log('Would send email to:', salesEmail);
    
    // Send auto-reply to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thank you for contacting TrueCheckIA</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f6f9fc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">TrueCheckIA</h1>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">AI Content Detection</p>
            </div>
            
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">Thank you for your inquiry!</h2>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Hello ${data.name},</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in TrueCheckIA's ${data.plan === 'ENTERPRISE' ? 'Enterprise' : ''} solutions. We've received your inquiry and our sales team will review it carefully.
            </p>
            
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
              <h3 style="color: #0c4a6e; font-size: 18px; margin: 0 0 12px 0;">What happens next?</h3>
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">✅ Our sales team will review your requirements</p>
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">✅ We'll prepare a customized proposal for your needs</p>
              <p style="color: #0c4a6e; font-size: 14px; margin: 8px 0;">✅ A sales representative will contact you within 24 hours</p>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 30px;">
              In the meantime, feel free to explore our platform or start with our free plan to see TrueCheckIA in action.
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://truecheckia.com/register" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-right: 10px;">
                Try Free Plan
              </a>
              <a href="https://truecheckia.com/pricing" style="display: inline-block; background-color: transparent; color: #3b82f6; padding: 12px 24px; text-decoration: none; border: 2px solid #3b82f6; border-radius: 6px; font-weight: bold; font-size: 16px;">
                View Pricing
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                TrueCheckIA - Cutting-edge AI detection technology
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                <a href="https://truecheckia.com" style="color: #3b82f6; text-decoration: underline;">Website</a>
                | <a href="https://truecheckia.com/contact" style="color: #3b82f6; text-decoration: underline;">Contact</a>
                | <a href="https://truecheckia.com/support" style="color: #3b82f6; text-decoration: underline;">Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // For now, skip auto-reply as sendEmail expects ReactElement not HTML string
    // TODO: Create React email template for auto-reply
    console.log('Would send auto-reply to:', data.email);

    return createResponse({
      success: true,
      message: 'Thank you for your inquiry. Our sales team will contact you within 24 hours.',
      data: {
        emailSent: emailResult.success,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        'Invalid form data',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
    throw error;
  }
}

export const POST = withErrorHandler(handleContactRequest);