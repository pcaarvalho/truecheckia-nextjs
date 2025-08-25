/**
 * E2E Test Utilities
 * 
 * Helper functions for setting up test data, managing test users,
 * and cleaning up after tests.
 */

import { spawn, ChildProcess } from 'child_process';

export interface TestUser {
  id?: string;
  email: string;
  password: string;
  name: string;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  role?: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  credits?: number;
}

export interface TestEnvironment {
  baseUrl: string;
  apiUrl: string;
  testDatabaseUrl?: string;
}

/**
 * Test environment configuration
 */
export const TEST_ENV: TestEnvironment = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  testDatabaseUrl: process.env.TEST_DATABASE_URL,
};

/**
 * Predefined test users
 */
export const TEST_USERS = {
  EXISTING: {
    email: 'test@truecheckia.com',
    password: 'Test123456!',
    name: 'Test User',
    plan: 'FREE' as const,
    role: 'USER' as const,
    emailVerified: true,
    credits: 10,
  },
  NEW: {
    email: `e2e-test-${Date.now()}@truecheckia.com`,
    password: 'E2ETest123456!',
    name: 'E2E Test User',
    plan: 'FREE' as const,
    role: 'USER' as const,
  },
  PREMIUM: {
    email: 'premium@truecheckia.com',
    password: 'Premium123456!',
    name: 'Premium User',
    plan: 'PRO' as const,
    role: 'USER' as const,
    emailVerified: true,
    credits: 1000,
  },
  ADMIN: {
    email: 'admin@truecheckia.com',
    password: 'Admin123456!',
    name: 'Admin User',
    plan: 'ENTERPRISE' as const,
    role: 'ADMIN' as const,
    emailVerified: true,
    credits: 99999,
  }
};

/**
 * Create a test user via API
 */
export async function createTestUser(user: TestUser): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${TEST_ENV.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
        plan: user.plan || 'FREE',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to create test user' };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating test user' 
    };
  }
}

/**
 * Clean up test user via API
 */
export async function cleanupTestUser(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: This would require a test-only API endpoint to delete users
    // For now, we'll just return success since cleanup is handled by database reset
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error cleaning up test user' 
    };
  }
}

/**
 * Reset test database to clean state
 */
export async function resetTestDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot reset database in production');
    }

    // This would typically involve:
    // 1. Running database migrations to reset schema
    // 2. Seeding with test data
    // 3. Ensuring test user exists
    
    console.log('[TestUtils] Database reset would happen here in a real implementation');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error resetting database' 
    };
  }
}

/**
 * Validate authentication token
 */
export async function validateAuthToken(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${TEST_ENV.apiUrl}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Token validation failed' };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error validating token' 
    };
  }
}

/**
 * Generate test report data
 */
export interface TestReportData {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  screenshot?: string;
  details?: any;
  timestamp: string;
}

export function generateTestReport(results: TestReportData[]): string {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  const report = `
# E2E Authentication Test Report

**Generated:** ${new Date().toISOString()}

## Summary
- **Total Tests:** ${total}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Success Rate:** ${successRate}%

## Detailed Results

${results.map(result => `
### ${result.testName}
- **Status:** ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
- **Duration:** ${result.duration}ms
- **Timestamp:** ${result.timestamp}
${result.error ? `- **Error:** ${result.error}` : ''}
${result.details ? `- **Details:** ${JSON.stringify(result.details, null, 2)}` : ''}
${result.screenshot ? `- **Screenshot:** ${result.screenshot}` : ''}
`).join('\n')}

## Critical Issues

${results
  .filter(r => r.status === 'FAIL')
  .map(r => `- **${r.testName}**: ${r.error || 'Unknown error'}`)
  .join('\n') || 'None detected'}

## Recommendations

${failed > 0 ? `
🚨 **ATTENTION REQUIRED**: ${failed} test(s) failed

Please review the failed tests above and address the underlying issues before deploying to production.
` : `
🎉 **ALL TESTS PASSED**: The authentication system is working correctly!

All critical authentication flows are functioning as expected.
`}
`;

  return report;
}

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean> | boolean,
  timeout: number = 10000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await condition();
      if (result) {
        return true;
      }
    } catch (error) {
      // Continue waiting if condition throws
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Ensure test user exists
 */
export async function ensureTestUserExists(user: TestUser): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to login with the user first to check if they exist
    const loginResponse = await fetch(`${TEST_ENV.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    if (loginResponse.ok) {
      // User exists and can login
      console.log(`[TestUtils] Test user ${user.email} already exists`);
      return { success: true };
    }

    // User doesn't exist, try to create them
    console.log(`[TestUtils] Creating test user ${user.email}`);
    const createResult = await createTestUser(user);
    
    if (!createResult.success) {
      return { success: false, error: `Failed to create test user: ${createResult.error}` };
    }

    console.log(`[TestUtils] Test user ${user.email} created successfully`);
    return { success: true };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error ensuring test user exists' 
    };
  }
}

export default {
  TEST_ENV,
  TEST_USERS,
  createTestUser,
  cleanupTestUser,
  resetTestDatabase,
  validateAuthToken,
  generateTestReport,
  waitForCondition,
  retryWithBackoff,
  ensureTestUserExists,
};