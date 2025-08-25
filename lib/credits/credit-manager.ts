import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';
import { sendCreditsLowEmail } from '@/lib/email/resend-client';

export interface CreditUsage {
  current: number;
  limit: number;
  resetDate: Date;
  percentageUsed: number;
  isUnlimited: boolean;
  daysUntilReset: number;
  analysesThisMonth: number;
}

export interface CreditDeductionResult {
  success: boolean;
  remainingCredits: number;
  isUnlimited: boolean;
  message?: string;
}

/**
 * Credit Management System for TrueCheckIA
 * Based on the legacy implementation with enhancements for Next.js
 */
export class CreditManager {
  
  /**
   * Plan credit limits
   */
  private static readonly PLAN_CREDITS = {
    FREE: 10,
    PRO: 1000,
    ENTERPRISE: 10000,
  } as const;

  /**
   * Check if user has sufficient credits
   */
  static async hasCredits(userId: string, requiredCredits = 1): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, plan: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Unlimited plans (legacy compatibility)
      if (user.credits === -1) {
        return true;
      }

      // Check if user has enough credits
      return user.credits >= requiredCredits;
    } catch (error) {
      console.error('Error checking user credits:', error);
      return false;
    }
  }

  /**
   * Deduct credits from user account
   */
  static async deductCredits(
    userId: string, 
    amount = 1
  ): Promise<CreditDeductionResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          credits: true, 
          plan: true, 
          email: true,
          name: true,
          creditsResetAt: true 
        }
      });

      if (!user) {
        return {
          success: false,
          remainingCredits: 0,
          isUnlimited: false,
          message: 'User not found'
        };
      }

      // Handle unlimited plans (legacy compatibility)
      if (user.credits === -1) {
        return {
          success: true,
          remainingCredits: -1,
          isUnlimited: true,
          message: 'Unlimited plan - no credits deducted'
        };
      }

      // Check if user has enough credits
      if (user.credits < amount) {
        // Send low credits notification if this is the first time hitting 0
        if (user.credits > 0 && user.email && user.name) {
          await this.sendLowCreditsNotification(user.email, user.name, user.plan);
        }

        return {
          success: false,
          remainingCredits: user.credits,
          isUnlimited: false,
          message: 'Insufficient credits'
        };
      }

      // Deduct credits
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount
          }
        },
        select: { credits: true }
      });

      // Send warning if credits are getting low (< 20% remaining)
      const creditLimit = this.PLAN_CREDITS[user.plan as keyof typeof this.PLAN_CREDITS];
      const warningThreshold = Math.ceil(creditLimit * 0.2);
      
      if (updatedUser.credits <= warningThreshold && 
          updatedUser.credits > 0 && 
          user.email && 
          user.name) {
        await this.sendLowCreditsNotification(user.email, user.name, user.plan);
      }

      return {
        success: true,
        remainingCredits: updatedUser.credits,
        isUnlimited: false,
        message: `${amount} credit${amount > 1 ? 's' : ''} deducted successfully`
      };

    } catch (error) {
      console.error('Error deducting credits:', error);
      return {
        success: false,
        remainingCredits: 0,
        isUnlimited: false,
        message: 'Internal error while deducting credits'
      };
    }
  }

  /**
   * Reset monthly credits for a user based on their plan
   */
  static async resetMonthlyCredits(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, stripeSubscriptionId: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const credits = this.getCreditsForPlan(user.plan);
      
      // Calculate next reset date (next month)
      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      nextResetDate.setDate(1); // First day of next month
      nextResetDate.setHours(0, 0, 0, 0); // Start of day

      await prisma.user.update({
        where: { id: userId },
        data: {
          credits,
          creditsResetAt: nextResetDate
        }
      });

      console.log(`Credits reset for user ${userId}: ${credits} credits`);
    } catch (error) {
      console.error('Error resetting monthly credits:', error);
      throw error;
    }
  }

  /**
   * Get credit usage analytics for a user
   */
  static async getCreditUsage(userId: string): Promise<CreditUsage> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          credits: true, 
          plan: true, 
          creditsResetAt: true 
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Handle unlimited plans
      if (user.credits === -1) {
        return {
          current: -1,
          limit: -1,
          resetDate: user.creditsResetAt,
          percentageUsed: 0,
          isUnlimited: true,
          daysUntilReset: 0,
          analysesThisMonth: await this.getAnalysesThisMonth(userId)
        };
      }

      const limit = this.getCreditsForPlan(user.plan);
      const used = limit - user.credits;
      const percentageUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;
      
      // Calculate days until reset
      const now = new Date();
      const resetDate = user.creditsResetAt;
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        current: user.credits,
        limit,
        resetDate,
        percentageUsed,
        isUnlimited: false,
        daysUntilReset: Math.max(0, daysUntilReset),
        analysesThisMonth: await this.getAnalysesThisMonth(userId)
      };
    } catch (error) {
      console.error('Error getting credit usage:', error);
      throw error;
    }
  }

  /**
   * Get users whose credits should be reset
   */
  static async getUsersForCreditReset(): Promise<string[]> {
    try {
      const now = new Date();
      
      const users = await prisma.user.findMany({
        where: {
          creditsResetAt: {
            lte: now
          },
          plan: {
            in: ['PRO', 'ENTERPRISE'] // Only reset for paid plans
          }
        },
        select: { id: true }
      });

      return users.map(user => user.id);
    } catch (error) {
      console.error('Error getting users for credit reset:', error);
      return [];
    }
  }

  /**
   * Batch reset credits for multiple users (for cron job)
   */
  static async batchResetCredits(userIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        await this.resetMonthlyCredits(userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`User ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Get credits amount for a specific plan
   */
  static getCreditsForPlan(plan: Plan): number {
    return this.PLAN_CREDITS[plan] || this.PLAN_CREDITS.FREE;
  }

  /**
   * Check if user needs credit reset (for individual checks)
   */
  static async needsCreditReset(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditsResetAt: true, plan: true }
      });

      if (!user || user.plan === 'FREE') {
        return false;
      }

      return new Date() >= user.creditsResetAt;
    } catch (error) {
      console.error('Error checking if user needs credit reset:', error);
      return false;
    }
  }

  /**
   * Force reset credits for a user (admin function)
   */
  static async forceResetCredits(userId: string, adminId: string): Promise<void> {
    try {
      await this.resetMonthlyCredits(userId);
      
      // Log admin action
      console.log(`Admin ${adminId} forced credit reset for user ${userId}`);
      
      // You could add audit logging here
      // await this.logAdminAction(adminId, 'FORCE_CREDIT_RESET', { targetUserId: userId });
    } catch (error) {
      console.error('Error forcing credit reset:', error);
      throw error;
    }
  }

  /**
   * Private method to get analyses count for current month
   */
  private static async getAnalysesThisMonth(userId: string): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await prisma.analysis.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth
          }
        }
      });

      return count;
    } catch (error) {
      console.error('Error getting analyses count:', error);
      return 0;
    }
  }

  /**
   * Private method to send low credits notification
   */
  private static async sendLowCreditsNotification(
    email: string, 
    name: string, 
    plan: Plan
  ): Promise<void> {
    try {
      // Only send notification for FREE plan users
      // Pro users have higher limits and different notification strategy
      if (plan === 'FREE') {
        await sendCreditsLowEmail(email, name || 'User', 3);
      }
    } catch (error) {
      console.error('Error sending low credits notification:', error);
      // Don't throw - this shouldn't block credit deduction
    }
  }
}

/**
 * Middleware function to check credits before analysis
 */
export async function withCreditCheck<T extends any[], R>(
  userId: string,
  requiredCredits: number,
  operation: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const hasCredits = await CreditManager.hasCredits(userId, requiredCredits);
    
    if (!hasCredits) {
      throw new Error('Insufficient credits to perform this operation');
    }

    // Perform the operation
    const result = await operation(...args);

    // Deduct credits after successful operation
    const deductionResult = await CreditManager.deductCredits(userId, requiredCredits);
    
    if (!deductionResult.success) {
      console.warn('Credit deduction failed after successful operation:', deductionResult.message);
      // In a real-world scenario, you might want to handle this more carefully
      // For now, we'll just log it since the operation was successful
    }

    return result;
  };
}

export default CreditManager;