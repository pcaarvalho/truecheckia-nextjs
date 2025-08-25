import { NextRequest, NextResponse } from 'next/server';
import { CreditManager } from '@/lib/credits/credit-manager';
import { headers } from 'next/headers';

/**
 * Cron Job: Reset Monthly Credits
 * 
 * This endpoint is called by Vercel Cron (or external cron service) to reset
 * monthly credits for users whose billing cycle has renewed.
 * 
 * Security: Uses CRON_SECRET to authenticate requests
 * Schedule: Should run daily to catch users whose credits need resetting
 * 
 * Webhook URL: https://truecheckia.com/api/cron/reset-credits
 * Schedule: 0 1 * * * (daily at 1 AM)
 */

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret for security
    const authHeader = (await headers()).get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid cron secret' }, 
        { status: 401 }
      );
    }

    console.log('🔄 Starting credit reset cron job...');

    // Get all users who need credit reset
    const userIds = await CreditManager.getUsersForCreditReset();
    
    if (userIds.length === 0) {
      console.log('✅ No users need credit reset at this time');
      return NextResponse.json({
        success: true,
        message: 'No users need credit reset',
        usersProcessed: 0,
        executionTime: Date.now() - startTime
      });
    }

    console.log(`📊 Found ${userIds.length} users needing credit reset`);

    // Batch process credit resets
    const result = await CreditManager.batchResetCredits(userIds);
    
    const executionTime = Date.now() - startTime;

    // Log results
    console.log(`✅ Credit reset completed:`);
    console.log(`   - Successful: ${result.success}`);
    console.log(`   - Failed: ${result.failed}`);
    console.log(`   - Execution time: ${executionTime}ms`);

    if (result.errors.length > 0) {
      console.error('❌ Credit reset errors:');
      result.errors.forEach(error => console.error(`   - ${error}`));
    }

    // Return success response with statistics
    return NextResponse.json({
      success: true,
      message: 'Credit reset completed',
      statistics: {
        usersProcessed: userIds.length,
        successful: result.success,
        failed: result.failed,
        executionTime
      },
      errors: result.errors.length > 0 ? result.errors : undefined
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('❌ Credit reset cron job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    }, { status: 500 });
  }
}

// Also support POST for manual triggers (with additional auth)
export async function POST(request: NextRequest) {
  try {
    // More strict auth for manual triggers
    const body = await request.json().catch(() => ({}));
    const { adminId, cronSecret } = body;
    
    const expectedSecret = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (!cronSecret || cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid cron secret' }, 
        { status: 401 }
      );
    }

    console.log(`🔧 Manual credit reset triggered by admin: ${adminId || 'unknown'}`);
    
    // Reuse the GET logic
    return GET(request);
    
  } catch (error) {
    console.error('❌ Manual credit reset failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}