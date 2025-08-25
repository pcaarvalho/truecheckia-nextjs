/**
 * End-to-End Authentication Flow Tests
 * 
 * Comprehensive test suite that validates the complete authentication system
 * including registration, login, token refresh, logout, and middleware protection.
 * 
 * This test addresses the reported bug:
 * - "token error" on login but refresh shows logged in
 * - Clicking buttons asks to login again
 */

import { spawn, ChildProcess } from 'child_process';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_EMAIL: 'test@truecheckia.com',
  TEST_PASSWORD: 'Test123456!',
  NEW_USER_EMAIL: `e2e-test-${Date.now()}@truecheckia.com`,
  NEW_USER_PASSWORD: 'E2ETest123456!',
  NEW_USER_NAME: 'E2E Test User',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
};

interface TestUser {
  email: string;
  password: string;
  name: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

class E2EAuthTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private devServer: ChildProcess | null = null;
  private results: TestResult[] = [];

  constructor() {
    // Ensure proper cleanup on exit
    process.on('SIGINT', this.cleanup.bind(this));
    process.on('SIGTERM', this.cleanup.bind(this));
    process.on('exit', this.cleanup.bind(this));
  }

  private async startDevServer(): Promise<void> {
    console.log('🚀 Starting development server...');
    
    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true,
      });

      let serverStarted = false;
      const timeout = setTimeout(() => {
        if (!serverStarted) {
          reject(new Error('Dev server failed to start within timeout'));
        }
      }, 60000); // 60 second timeout

      this.devServer.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`[DEV SERVER] ${output.trim()}`);
        
        if (output.includes('localhost:3000') || output.includes('Ready in')) {
          serverStarted = true;
          clearTimeout(timeout);
          setTimeout(resolve, 2000); // Wait 2 more seconds for full startup
        }
      });

      this.devServer.stderr?.on('data', (data: Buffer) => {
        console.error(`[DEV SERVER ERROR] ${data.toString()}`);
      });

      this.devServer.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private async stopDevServer(): Promise<void> {
    if (this.devServer) {
      console.log('🛑 Stopping development server...');
      this.devServer.kill('SIGTERM');
      this.devServer = null;
      
      // Wait for server to fully stop
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  private async setupBrowser(): Promise<void> {
    console.log('🌐 Setting up browser...');
    
    this.browser = await chromium.launch({
      headless: false, // Set to true for CI/automated runs
      devtools: true,
      slowMo: 100, // Add slight delay for easier observation
      args: [
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor',
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: path.join(process.cwd(), 'test-results', 'videos'),
        size: { width: 1280, height: 720 }
      },
      recordHar: {
        path: path.join(process.cwd(), 'test-results', 'network.har')
      }
    });

    this.page = await this.context.newPage();
    
    // Enable console logging from the page
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      } else {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });

    // Monitor network requests
    this.page.on('request', request => {
      if (request.url().includes('/api/auth')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/api/auth')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
  }

  private async closeBrowser(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    console.log(`\n🧪 Running: ${testName}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      const result: TestResult = {
        name: testName,
        status: 'PASS',
        duration,
      };
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        name: testName,
        status: 'FAIL',
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
      console.log(`❌ FAILED: ${testName} (${duration}ms)`);
      console.error(`Error: ${result.error}`);
      this.results.push(result);
      return result;
    }
  }

  private async clearBrowserData(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Navigate to a page first to establish proper context
      await this.page.goto(`${TEST_CONFIG.BASE_URL}`);
      
      // Clear localStorage and sessionStorage
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear storage:', e);
        }
      });

      // Clear cookies
      await this.context?.clearCookies();
      
      console.log('🧹 Browser data cleared');
    } catch (error) {
      console.warn('Browser data clearing had issues:', error);
      // Continue with test execution
    }
  }

  private async getStoredAuthData(): Promise<{ 
    localStorage: any; 
    cookies: any[];
  }> {
    if (!this.page) throw new Error('Page not initialized');

    let localStorage = {
      accessToken: null,
      refreshToken: null,
      user: null,
    };

    try {
      localStorage = await this.page.evaluate(() => {
        try {
          return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
            user: localStorage.getItem('user'),
          };
        } catch (e) {
          console.warn('Could not access localStorage:', e);
          return {
            accessToken: null,
            refreshToken: null,
            user: null,
          };
        }
      });
    } catch (error) {
      console.warn('Error getting stored auth data:', error);
    }

    const cookies = await this.context?.cookies() || [];

    return { localStorage, cookies };
  }

  private async waitForElement(selector: string, timeout = TEST_CONFIG.TIMEOUT): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  private async waitForNavigation(expectedUrl?: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    await this.page.waitForLoadState('networkidle');
    
    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl, { timeout: TEST_CONFIG.TIMEOUT });
    }
  }

  // Test 1: User Registration → Auto-login → Dashboard Access
  private async testUserRegistration(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Go to registration page
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/register`);
    await this.waitForNavigation();

    // Fill registration form
    await this.page.fill('[data-testid="name-input"]', TEST_CONFIG.NEW_USER_NAME);
    await this.page.fill('[data-testid="email-input"]', TEST_CONFIG.NEW_USER_EMAIL);
    await this.page.fill('[data-testid="password-input"]', TEST_CONFIG.NEW_USER_PASSWORD);
    await this.page.fill('[data-testid="confirmPassword-input"]', TEST_CONFIG.NEW_USER_PASSWORD);

    // Submit registration
    await this.page.click('[data-testid="register-button"]');

    // Wait for registration to complete and check for auto-login
    await this.waitForNavigation('/dashboard');

    // Verify we're on dashboard
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected to be redirected to dashboard, but got: ${currentUrl}`);
    }

    // Verify auth data is stored
    const authData = await this.getStoredAuthData();
    
    if (!authData.localStorage.accessToken) {
      throw new Error('Access token not found in localStorage after registration');
    }

    if (!authData.localStorage.user) {
      throw new Error('User data not found in localStorage after registration');
    }

    // Verify user data
    const user = JSON.parse(authData.localStorage.user);
    if (user.email !== TEST_CONFIG.NEW_USER_EMAIL) {
      throw new Error(`User email mismatch: expected ${TEST_CONFIG.NEW_USER_EMAIL}, got ${user.email}`);
    }

    console.log('✅ Registration → Auto-login → Dashboard access successful');
  }

  // Test 2: User Login → Dashboard → Refresh Page → Still Logged In
  private async testLoginAndRefresh(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Go to login page
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await this.waitForNavigation();

    // Fill login form
    await this.page.fill('[data-testid="email-input"]', TEST_CONFIG.TEST_EMAIL);
    await this.page.fill('[data-testid="password-input"]', TEST_CONFIG.TEST_PASSWORD);

    // Submit login
    await this.page.click('[data-testid="login-button"]');

    // Wait for login to complete
    await this.waitForNavigation('/dashboard');

    // Verify we're on dashboard
    let currentUrl = this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected to be redirected to dashboard, but got: ${currentUrl}`);
    }

    // Verify auth data is stored
    let authData = await this.getStoredAuthData();
    
    if (!authData.localStorage.accessToken) {
      throw new Error('Access token not found in localStorage after login');
    }

    // Now refresh the page
    console.log('🔄 Refreshing page...');
    await this.page.reload({ waitUntil: 'networkidle' });

    // Verify we're still on dashboard after refresh
    currentUrl = this.page.url();
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`After refresh, expected to be on dashboard, but got: ${currentUrl}`);
    }

    // Verify auth data is still present
    authData = await this.getStoredAuthData();
    
    if (!authData.localStorage.accessToken) {
      throw new Error('Access token not found in localStorage after page refresh');
    }

    // Verify the dashboard content is accessible (test for the reported bug)
    await this.waitForElement('[data-testid="dashboard-content"]', 5000);

    console.log('✅ Login → Dashboard → Refresh → Still logged in successful');
  }

  // Test 3: User Login → Close Browser → Reopen → Still Logged In
  private async testPersistentSession(): Promise<void> {
    if (!this.page || !this.context || !this.browser) throw new Error('Browser not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Go to login page
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await this.waitForNavigation();

    // Fill login form
    await this.page.fill('[data-testid="email-input"]', TEST_CONFIG.TEST_EMAIL);
    await this.page.fill('[data-testid="password-input"]', TEST_CONFIG.TEST_PASSWORD);

    // Submit login
    await this.page.click('[data-testid="login-button"]');

    // Wait for login to complete
    await this.waitForNavigation('/dashboard');

    // Store auth data before closing
    const authDataBeforeClose = await this.getStoredAuthData();
    
    if (!authDataBeforeClose.localStorage.accessToken) {
      throw new Error('Access token not found before closing browser');
    }

    // Close browser context (simulating browser close)
    console.log('🔒 Closing browser context...');
    await this.page.close();
    await this.context.close();

    // Create new context (simulating browser reopen)
    console.log('🔓 Reopening browser context...');
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    this.page = await this.context.newPage();

    // Enable console logging for new page
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      } else {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });

    // Go directly to dashboard (should work if session is persistent)
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/dashboard`);
    await this.waitForNavigation();

    // Check if we're redirected to login (which would indicate session not persistent)
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('/login')) {
      throw new Error('Session was not persistent - redirected to login after browser reopen');
    }

    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected to be on dashboard after reopen, but got: ${currentUrl}`);
    }

    console.log('✅ Login → Close browser → Reopen → Still logged in successful');
  }

  // Test 4: User Logout → Try Access Dashboard → Redirected to Login
  private async testLogoutAndRedirect(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Ensure we're logged in first
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await this.page.fill('input[name="email"]', TEST_CONFIG.TEST_EMAIL);
    await this.page.fill('input[name="password"]', TEST_CONFIG.TEST_PASSWORD);
    await this.page.click('button[type="submit"]');
    await this.waitForNavigation('/dashboard');

    // Now logout
    console.log('🚪 Logging out...');
    await this.page.click('[data-testid="logout-button"]');
    
    // Wait for logout to complete
    await this.waitForNavigation();

    // Verify auth data is cleared
    const authData = await this.getStoredAuthData();
    
    if (authData.localStorage.accessToken) {
      throw new Error('Access token still present in localStorage after logout');
    }

    // Try to access dashboard directly
    console.log('🔒 Trying to access dashboard after logout...');
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/dashboard`);
    await this.waitForNavigation();

    // Should be redirected to login
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/login')) {
      throw new Error(`Expected to be redirected to login, but got: ${currentUrl}`);
    }

    // Should include 'from' parameter
    if (!currentUrl.includes('from=%2Fdashboard')) {
      console.warn('Login URL does not include expected "from" parameter');
    }

    console.log('✅ Logout → Try access dashboard → Redirected to login successful');
  }

  // Test 5: Invalid Token → Should Redirect to Login
  private async testInvalidToken(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Set invalid token in localStorage
    await this.page.evaluate(() => {
      localStorage.setItem('accessToken', 'invalid.token.here');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });

    console.log('🚫 Set invalid token, trying to access dashboard...');
    
    // Try to access dashboard with invalid token
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/dashboard`);
    await this.waitForNavigation();

    // Should be redirected to login
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/login')) {
      throw new Error(`Expected to be redirected to login with invalid token, but got: ${currentUrl}`);
    }

    // Verify invalid token was cleared
    const authData = await this.getStoredAuthData();
    if (authData.localStorage.accessToken) {
      console.warn('Invalid token was not cleared from localStorage');
    }

    console.log('✅ Invalid token → Redirected to login successful');
  }

  // Test 6: Token Refresh Mechanism
  private async testTokenRefresh(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Login first
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await this.page.fill('input[name="email"]', TEST_CONFIG.TEST_EMAIL);
    await this.page.fill('input[name="password"]', TEST_CONFIG.TEST_PASSWORD);
    await this.page.click('button[type="submit"]');
    await this.waitForNavigation('/dashboard');

    // Get initial tokens
    const initialAuthData = await this.getStoredAuthData();
    const initialAccessToken = initialAuthData.localStorage.accessToken;
    
    if (!initialAccessToken) {
      throw new Error('No initial access token found');
    }

    // Simulate token refresh by calling the refresh endpoint
    console.log('🔄 Testing token refresh endpoint...');
    
    const refreshResponse = await this.page.evaluate(async (refreshToken) => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });
        
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json()
        };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }, initialAuthData.localStorage.refreshToken);

    if (!refreshResponse.ok) {
      throw new Error(`Token refresh failed: ${refreshResponse.error || 'Unknown error'}`);
    }

    if (!refreshResponse.data.success || !refreshResponse.data.data.accessToken) {
      throw new Error('Token refresh did not return new access token');
    }

    console.log('✅ Token refresh mechanism working');
  }

  // Test 7: Middleware Protection
  private async testMiddlewareProtection(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const protectedRoutes = ['/dashboard', '/analysis', '/history', '/profile'];
    
    // Clear any existing data to ensure unauthenticated state
    await this.clearBrowserData();

    for (const route of protectedRoutes) {
      console.log(`🛡️ Testing protection for ${route}...`);
      
      await this.page.goto(`${TEST_CONFIG.BASE_URL}${route}`);
      await this.waitForNavigation();

      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        throw new Error(`Route ${route} is not protected - did not redirect to login`);
      }
      
      console.log(`✅ Route ${route} is properly protected`);
    }

    console.log('✅ All middleware protection tests passed');
  }

  // Test 8: Cookie and localStorage Behavior
  private async testStorageBehavior(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Clear any existing data
    await this.clearBrowserData();

    // Login
    await this.page.goto(`${TEST_CONFIG.BASE_URL}/login`);
    await this.page.fill('input[name="email"]', TEST_CONFIG.TEST_EMAIL);
    await this.page.fill('input[name="password"]', TEST_CONFIG.TEST_PASSWORD);
    await this.page.click('button[type="submit"]');
    await this.waitForNavigation('/dashboard');

    // Check storage after login
    const authData = await this.getStoredAuthData();
    
    console.log('📱 Verifying storage after login...');

    // Verify localStorage has tokens
    if (!authData.localStorage.accessToken) {
      throw new Error('Access token not in localStorage');
    }
    
    if (!authData.localStorage.refreshToken) {
      throw new Error('Refresh token not in localStorage');
    }
    
    if (!authData.localStorage.user) {
      throw new Error('User data not in localStorage');
    }

    // Verify cookies are set (httpOnly cookies from server)
    const accessTokenCookie = authData.cookies.find(c => c.name === 'accessToken');
    const refreshTokenCookie = authData.cookies.find(c => c.name === 'refreshToken');
    
    if (!accessTokenCookie) {
      console.warn('Access token cookie not found - may be httpOnly');
    }
    
    if (!refreshTokenCookie) {
      console.warn('Refresh token cookie not found - may be httpOnly');
    }

    console.log('Storage verification:', {
      localStorage: {
        hasAccessToken: !!authData.localStorage.accessToken,
        hasRefreshToken: !!authData.localStorage.refreshToken,
        hasUser: !!authData.localStorage.user,
      },
      cookies: {
        count: authData.cookies.length,
        hasAccessToken: !!accessTokenCookie,
        hasRefreshToken: !!refreshTokenCookie,
      }
    });

    console.log('✅ Storage behavior verification complete');
  }

  public async runAllTests(): Promise<void> {
    console.log('🏁 Starting E2E Authentication Flow Tests');
    console.log('======================================');

    try {
      // Setup
      await this.startDevServer();
      await this.setupBrowser();

      // Create results directory
      await fs.mkdir(path.join(process.cwd(), 'test-results'), { recursive: true });
      await fs.mkdir(path.join(process.cwd(), 'test-results', 'videos'), { recursive: true });

      // Run all tests
      await this.runTest('User Registration → Auto-login → Dashboard Access', 
        this.testUserRegistration.bind(this));

      await this.runTest('User Login → Dashboard → Refresh Page → Still Logged In', 
        this.testLoginAndRefresh.bind(this));

      await this.runTest('User Login → Close Browser → Reopen → Still Logged In', 
        this.testPersistentSession.bind(this));

      await this.runTest('User Logout → Try Access Dashboard → Redirected to Login', 
        this.testLogoutAndRedirect.bind(this));

      await this.runTest('Invalid Token → Should Redirect to Login', 
        this.testInvalidToken.bind(this));

      await this.runTest('Token Refresh Mechanism', 
        this.testTokenRefresh.bind(this));

      await this.runTest('Middleware Protection Works', 
        this.testMiddlewareProtection.bind(this));

      await this.runTest('Cookie and localStorage Behavior', 
        this.testStorageBehavior.bind(this));

      // Generate results
      await this.generateResults();

    } catch (error) {
      console.error('❌ Fatal error during test execution:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async generateResults(): Promise<void> {
    console.log('\n📊 Test Results Summary');
    console.log('========================');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Write results to file
    const resultsFile = path.join(process.cwd(), 'test-results', 'auth-flow-results.json');
    await fs.writeFile(resultsFile, JSON.stringify({
      summary: { total, passed, failed, successRate: (passed / total) * 100 },
      results: this.results,
      timestamp: new Date().toISOString(),
    }, null, 2));

    console.log(`\n📄 Results saved to: ${resultsFile}`);

    // Critical issues analysis
    const criticalFailures = this.results.filter(r => 
      r.status === 'FAIL' && (
        r.name.includes('Login → Dashboard → Refresh') ||
        r.name.includes('Token Refresh') ||
        r.name.includes('Middleware Protection')
      )
    );

    if (criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED:');
      criticalFailures.forEach(failure => {
        console.log(`⚠️  ${failure.name}: ${failure.error}`);
      });
    } else {
      console.log('\n🎉 All critical authentication flows are working correctly!');
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');
    
    try {
      await this.closeBrowser();
      await this.stopDevServer();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Main execution
async function main() {
  const tester = new E2EAuthTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ E2E tests failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

export { E2EAuthTester, TEST_CONFIG };