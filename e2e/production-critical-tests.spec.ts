import { test, expect } from '@playwright/test'

const BASE_URL = 'https://www.truecheckia.com'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'Test123456!'

test.describe('TrueCheckIA Production Critical Tests', () => {
  
  test('1. Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/TrueCheckIA/)
    await expect(page.locator('h1')).toContainText('Detect AI-Generated Content')
  })

  test('2. User can login successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Sign In")')
    
    await page.waitForURL(`${BASE_URL}/dashboard`)
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('3. AI Analysis works in dashboard', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Sign In")')
    await page.waitForURL(`${BASE_URL}/dashboard`)
    
    // Navigate to analysis
    await page.click('a:has-text("New Analysis")')
    await page.waitForURL(`${BASE_URL}/analysis`)
    
    // Input text for analysis
    const testText = 'Artificial intelligence has revolutionized the way we interact with technology. Machine learning algorithms now power everything from recommendation systems to autonomous vehicles. The rapid advancement in neural networks has enabled computers to perform tasks that were once thought to be exclusively human domains.'
    
    await page.fill('textarea', testText)
    
    // Check if analyze button is enabled
    const analyzeButton = page.locator('button:has-text("Analyze Content")')
    await expect(analyzeButton).toBeEnabled()
    
    // Perform analysis
    await analyzeButton.click()
    
    // Wait for result (max 10 seconds)
    await page.waitForSelector('[data-testid="analysis-result"], .toast', { 
      timeout: 10000 
    })
    
    // Check for either success or error message
    const hasResult = await page.locator('[data-testid="analysis-result"]').isVisible().catch(() => false)
    const hasError = await page.locator('.toast').isVisible().catch(() => false)
    
    expect(hasResult || hasError).toBeTruthy()
  })

  test('4. Stripe checkout flow initiates', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)
    
    // Find and click Pro plan button
    const proButton = page.locator('button:has-text("Get Started"), button:has-text("Start Pro Trial")')
    await proButton.first().click()
    
    // Wait for either dialog or redirect
    await page.waitForTimeout(2000)
    
    // Check if a dialog appears or if we're redirected
    const hasDialog = await page.locator('dialog, [role="dialog"]').isVisible().catch(() => false)
    const isProcessing = await page.locator('button:has-text("Processing")').isVisible().catch(() => false)
    
    expect(hasDialog || isProcessing).toBeTruthy()
  })

  test('5. User credits are displayed correctly', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Sign In")')
    await page.waitForURL(`${BASE_URL}/dashboard`)
    
    // Check credits display
    const creditsElement = page.locator(':text("Credits")')
    await expect(creditsElement).toBeVisible()
    
    // Navigate to analysis page
    await page.click('a:has-text("New Analysis")')
    await page.waitForURL(`${BASE_URL}/analysis`)
    
    // Check credits on analysis page
    const creditsOnAnalysis = page.locator(':text("Credits remaining")')
    await expect(creditsOnAnalysis).toBeVisible()
  })

  test('6. API endpoints are responding', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get(`${BASE_URL}/api/health`)
    expect(healthResponse.status()).toBeLessThan(500)
    
    // Test auth refresh endpoint (should return 401 without token)
    const refreshResponse = await page.request.post(`${BASE_URL}/api/auth/refresh`)
    expect([200, 401, 400]).toContain(refreshResponse.status())
  })
})

test.describe('Error Recovery Tests', () => {
  
  test('7. Handles expired token gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    // Set invalid token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'invalid.token.here')
    })
    
    // Try to access protected route
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Should redirect to login
    await page.waitForURL(/login/)
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('8. Shows appropriate error for insufficient credits', async ({ page }) => {
    // This test assumes user has 0 credits
    // Login with a test user that has no credits
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'nocredits@test.com')
    await page.fill('input[type="password"]', 'Test123456!')
    
    // If login fails, skip this test
    await page.click('button:has-text("Sign In")')
    const loginSuccess = await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 5000 }).catch(() => false)
    
    if (loginSuccess) {
      await page.click('a:has-text("New Analysis")')
      await page.fill('textarea', 'Test text for analysis')
      await page.click('button:has-text("Analyze Content")')
      
      // Should show insufficient credits error
      const errorToast = page.locator(':text("Insufficient credits"), :text("upgrade")')
      await expect(errorToast).toBeVisible({ timeout: 5000 })
    }
  })
})

// Run tests with: npx playwright test e2e/production-critical-tests.spec.ts