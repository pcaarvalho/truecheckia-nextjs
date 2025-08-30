import { test, expect } from '@playwright/test';

// Configure test settings
test.use({
  baseURL: process.env.TEST_URL || 'https://truecheckia.com',
  viewport: { width: 1280, height: 720 },
  video: 'on',
  screenshot: 'only-on-failure',
  trace: 'on'
});

// Test data
const TEST_USER = {
  email: 'test@truecheckia.com',
  password: 'Test@123456',
  name: 'Test User'
};

const SAMPLE_TEXT = `Este é um texto de teste para análise de IA. 
O sistema deve ser capaz de detectar se este conteúdo foi gerado 
por inteligência artificial ou escrito por um humano. Esta análise 
é fundamental para a credibilidade do conteúdo digital moderno.`;

test.describe('TrueCheckIA Production Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for production
    test.setTimeout(60000);
    
    // Wait for page to be fully loaded
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Authentication Flow', () => {
    
    test('1.1 User Registration', async ({ page }) => {
      // Navigate to registration
      await page.goto('/register');
      
      // Fill registration form
      await page.fill('input[name="name"]', TEST_USER.name);
      await page.fill('input[name="email"]', `new_${Date.now()}_${TEST_USER.email}`);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.fill('input[name="confirmPassword"]', TEST_USER.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify user is logged in
      expect(page.url()).toContain('/dashboard');
      await expect(page.locator('text=/Welcome|Bem-vindo/')).toBeVisible();
    });

    test('1.2 User Login', async ({ page }) => {
      // Navigate to login
      await page.goto('/login');
      
      // Fill login form
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify dashboard elements
      expect(page.url()).toContain('/dashboard');
      await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    });

    test('1.3 JWT Token Refresh', async ({ page, context }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Get cookies
      const cookies = await context.cookies();
      const accessToken = cookies.find(c => c.name === 'accessToken');
      const refreshToken = cookies.find(c => c.name === 'refreshToken');
      
      // Verify tokens exist
      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      
      // Wait for token to potentially expire and navigate
      await page.waitForTimeout(2000);
      await page.goto('/dashboard/analysis');
      
      // Should still be authenticated
      expect(page.url()).toContain('/dashboard/analysis');
    });
  });

  test.describe('2. Stripe Checkout Flow', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each checkout test
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('2.1 Navigate to Pricing', async ({ page }) => {
      // Go to pricing page
      await page.goto('/dashboard/settings');
      await page.click('text=/Upgrade|Planos|Pricing/i');
      
      // Verify pricing plans are displayed
      await expect(page.locator('text=/PRO|Professional/i')).toBeVisible();
      await expect(page.locator('text=/ENTERPRISE|Empresarial/i')).toBeVisible();
    });

    test('2.2 Initiate PRO Upgrade', async ({ page }) => {
      // Navigate to settings/billing
      await page.goto('/dashboard/settings');
      
      // Click upgrade button
      const upgradeButton = page.locator('button:has-text("Upgrade to PRO")').first();
      await upgradeButton.click();
      
      // Wait for Stripe checkout redirect or modal
      await page.waitForTimeout(3000);
      
      // Check if redirected to Stripe or modal opened
      const url = page.url();
      const hasStripeCheckout = url.includes('checkout.stripe.com') || 
                                await page.locator('iframe[src*="stripe"]').count() > 0;
      
      expect(hasStripeCheckout).toBeTruthy();
      
      // If on Stripe checkout page
      if (url.includes('checkout.stripe.com')) {
        // Verify Stripe checkout elements
        await expect(page.locator('text=/Payment|Pagamento/')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[name="email"]')).toBeVisible();
      }
    });

    test('2.3 Verify Subscription Status', async ({ page }) => {
      // Go to settings
      await page.goto('/dashboard/settings');
      
      // Check current plan display
      const planInfo = page.locator('[data-testid="current-plan"], text=/Current Plan|Plano Atual/i');
      await expect(planInfo).toBeVisible();
      
      // Verify plan details
      const planText = await planInfo.textContent();
      expect(planText).toMatch(/FREE|PRO|ENTERPRISE/);
    });
  });

  test.describe('3. AI Analysis Module', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each analysis test
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('3.1 Navigate to Analysis Page', async ({ page }) => {
      // Go to analysis page
      await page.goto('/dashboard/analysis');
      
      // Verify page loaded
      await expect(page.locator('h1:has-text("AI Analysis"), h1:has-text("Análise de IA")')).toBeVisible();
      await expect(page.locator('textarea, [contenteditable="true"]')).toBeVisible();
    });

    test('3.2 Submit Text for Analysis', async ({ page }) => {
      // Navigate to analysis
      await page.goto('/dashboard/analysis');
      
      // Find and fill text input
      const textInput = page.locator('textarea, [contenteditable="true"]').first();
      await textInput.fill(SAMPLE_TEXT);
      
      // Submit analysis
      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Analisar")').first();
      await analyzeButton.click();
      
      // Wait for loading state
      await expect(page.locator('text=/Loading|Analyzing|Carregando|Analisando/i')).toBeVisible();
      
      // Wait for results (max 30 seconds)
      await expect(page.locator('[data-testid="analysis-results"], .analysis-results')).toBeVisible({ 
        timeout: 30000 
      });
      
      // Verify results contain expected elements
      await expect(page.locator('text=/AI Score|Pontuação|Confidence|Confiança/i')).toBeVisible();
      await expect(page.locator('text=/%|LOW|MEDIUM|HIGH|BAIXA|MÉDIA|ALTA/')).toBeVisible();
    });

    test('3.3 Verify Credit Deduction', async ({ page }) => {
      // Go to dashboard to check initial credits
      await page.goto('/dashboard');
      
      // Get initial credit count
      const creditElement = page.locator('text=/Credits:|Créditos:/i').first();
      const initialCredits = await creditElement.textContent();
      const initialCount = parseInt(initialCredits?.match(/\d+/)?.[0] || '0');
      
      // Perform analysis
      await page.goto('/dashboard/analysis');
      const textInput = page.locator('textarea, [contenteditable="true"]').first();
      await textInput.fill('Test text for credit deduction');
      await page.click('button:has-text("Analyze"), button:has-text("Analisar")');
      
      // Wait for analysis to complete
      await page.waitForSelector('[data-testid="analysis-results"], .analysis-results', { 
        timeout: 30000 
      });
      
      // Go back to dashboard
      await page.goto('/dashboard');
      
      // Check new credit count
      const newCreditElement = page.locator('text=/Credits:|Créditos:/i').first();
      const newCredits = await newCreditElement.textContent();
      const newCount = parseInt(newCredits?.match(/\d+/)?.[0] || '0');
      
      // Verify credits were deducted
      expect(newCount).toBeLessThan(initialCount);
    });

    test('3.4 View Analysis History', async ({ page }) => {
      // Navigate to history
      await page.goto('/dashboard/history');
      
      // Verify history page loads
      await expect(page.locator('h1:has-text("History"), h1:has-text("Histórico")')).toBeVisible();
      
      // Check if there are analysis entries
      const historyItems = page.locator('[data-testid="history-item"], .history-item');
      const count = await historyItems.count();
      
      // If there are items, verify structure
      if (count > 0) {
        const firstItem = historyItems.first();
        await expect(firstItem.locator('text=/Score|Pontuação/')).toBeVisible();
        await expect(firstItem.locator('text=/Date|Data/')).toBeVisible();
      }
    });
  });

  test.describe('4. Integration Tests', () => {
    
    test('4.1 Full User Journey', async ({ page }) => {
      const uniqueEmail = `journey_${Date.now()}@test.com`;
      
      // 1. Register new user
      await page.goto('/register');
      await page.fill('input[name="name"]', 'Journey User');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', 'Journey@123');
      await page.fill('input[name="confirmPassword"]', 'Journey@123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // 2. Perform AI analysis
      await page.goto('/dashboard/analysis');
      await page.fill('textarea, [contenteditable="true"]', 'Test journey analysis text');
      await page.click('button:has-text("Analyze"), button:has-text("Analisar")');
      await page.waitForSelector('[data-testid="analysis-results"], .analysis-results', { 
        timeout: 30000 
      });
      
      // 3. Check history
      await page.goto('/dashboard/history');
      await expect(page.locator('[data-testid="history-item"], .history-item')).toHaveCount(1);
      
      // 4. Navigate to upgrade
      await page.goto('/dashboard/settings');
      await expect(page.locator('button:has-text("Upgrade")')).toBeVisible();
    });

    test('4.2 API Health Check', async ({ request }) => {
      // Check main API endpoints
      const endpoints = [
        '/api/health',
        '/api/auth/status',
        '/api/stripe/status'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request.get(endpoint);
        expect(response.status()).toBeLessThan(500);
      }
    });

    test('4.3 Responsive Design', async ({ page }) => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check mobile menu
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await expect(page.locator('nav a')).toBeVisible();
      }
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');
      
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/dashboard');
    });
  });

  test.describe('5. Performance Tests', () => {
    
    test('5.1 Page Load Times', async ({ page }) => {
      const pages = [
        { url: '/', maxTime: 3000 },
        { url: '/login', maxTime: 2000 },
        { url: '/register', maxTime: 2000 }
      ];
      
      for (const pageTest of pages) {
        const startTime = Date.now();
        await page.goto(pageTest.url);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(pageTest.maxTime);
      }
    });

    test('5.2 API Response Times', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get('/api/health');
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });
  });
});

// Export test configuration
export default {
  testDir: './e2e',
  timeout: 60000,
  retries: 2,
  use: {
    baseURL: process.env.TEST_URL || 'https://truecheckia.com',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'production',
      use: {
        ...globalThis.browserName,
      },
    },
  ],
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],
};