#!/usr/bin/env node

/**
 * TrueCheckIA E2E Test Suite with Puppeteer MCP
 * These tests can be run via Claude Code with Puppeteer MCP
 */

const testScenarios = {
  /**
   * Test 1: Login Flow
   */
  async testLogin(page) {
    console.log('🧪 Testing Login Flow...');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]');
    
    // Fill login form
    await page.type('input[type="email"]', 'test@truecheckia.com');
    await page.type('input[type="password"]', 'Test123456!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation();
    
    // Check if we're on dashboard
    const url = page.url();
    if (url.includes('/dashboard')) {
      console.log('✅ Login successful!');
      return true;
    } else {
      console.log('❌ Login failed - not redirected to dashboard');
      return false;
    }
  },

  /**
   * Test 2: AI Detection Analysis
   */
  async testAIDetection(page) {
    console.log('🧪 Testing AI Detection...');
    
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('textarea', { timeout: 5000 });
    
    // Enter sample text
    const sampleText = `This is a test text to check if the AI detection 
    system is working properly. It should analyze this content and 
    provide a probability score.`;
    
    await page.type('textarea', sampleText);
    
    // Click analyze button
    const analyzeButton = await page.$('button:contains("Analyze")');
    if (analyzeButton) {
      await analyzeButton.click();
      
      // Wait for results
      await page.waitForSelector('.analysis-result', { timeout: 10000 });
      
      console.log('✅ AI Detection working!');
      return true;
    } else {
      console.log('❌ Analyze button not found');
      return false;
    }
  },

  /**
   * Test 3: Theme Toggle
   */
  async testThemeToggle(page) {
    console.log('🧪 Testing Theme Toggle...');
    
    await page.goto('http://localhost:3000');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Click theme toggle
    await page.click('[aria-label*="theme"], [title*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])');
    
    // Wait a bit for transition
    await page.waitForTimeout(500);
    
    // Get new theme
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    if (initialTheme !== newTheme) {
      console.log(`✅ Theme toggled from ${initialTheme} to ${newTheme}`);
      return true;
    } else {
      console.log('❌ Theme toggle failed');
      return false;
    }
  },

  /**
   * Test 4: Mobile Responsiveness
   */
  async testMobileView(page) {
    console.log('🧪 Testing Mobile Responsiveness...');
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Check if mobile menu button is visible
    const mobileMenuButton = await page.$('[aria-label*="menu"], button:has(svg[class*="menu"])');
    
    if (mobileMenuButton) {
      const isVisible = await mobileMenuButton.isIntersectingViewport();
      if (isVisible) {
        console.log('✅ Mobile view working!');
        
        // Test mobile menu
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
        
        const mobileMenu = await page.$('[role="navigation"], .mobile-menu, .drawer');
        if (mobileMenu) {
          console.log('✅ Mobile menu functional!');
        }
        
        return true;
      }
    }
    
    console.log('❌ Mobile view issues detected');
    return false;
  },

  /**
   * Test 5: Performance Metrics
   */
  async testPerformance(page) {
    console.log('🧪 Testing Performance...');
    
    await page.goto('http://localhost:3000');
    
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
      };
    });
    
    console.log(`📊 Performance Metrics:`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  Page Load Complete: ${metrics.loadComplete}ms`);
    
    if (metrics.loadComplete < 3000) {
      console.log('✅ Performance is good!');
      return true;
    } else {
      console.log('⚠️ Performance could be improved');
      return false;
    }
  },

  /**
   * Test 6: Screenshot Capture
   */
  async captureScreenshots(page) {
    console.log('📸 Capturing Screenshots...');
    
    const pages = [
      { url: 'http://localhost:3000', name: 'homepage' },
      { url: 'http://localhost:3000/login', name: 'login' },
      { url: 'http://localhost:3000/dashboard', name: 'dashboard' },
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForTimeout(1000); // Wait for animations
      
      // Desktop screenshot
      await page.setViewport({ width: 1920, height: 1080 });
      await page.screenshot({ 
        path: `.claude/screenshots/${pageInfo.name}-desktop.png`,
        fullPage: true 
      });
      
      // Mobile screenshot
      await page.setViewport({ width: 375, height: 667 });
      await page.screenshot({ 
        path: `.claude/screenshots/${pageInfo.name}-mobile.png`,
        fullPage: true 
      });
      
      console.log(`✅ Captured screenshots for ${pageInfo.name}`);
    }
    
    return true;
  }
};

// Export for use with Puppeteer MCP
module.exports = testScenarios;

// CLI runner
if (require.main === module) {
  console.log(`
📋 TrueCheckIA Puppeteer Test Suite
===================================

Available tests:
1. testLogin - Test login flow
2. testAIDetection - Test AI detection feature
3. testThemeToggle - Test dark/light theme toggle
4. testMobileView - Test mobile responsiveness
5. testPerformance - Check performance metrics
6. captureScreenshots - Capture screenshots of all pages

To run with Claude Code:
- Use Puppeteer MCP to execute these tests
- Results will help identify UI/UX issues

Note: Make sure the dev server is running on http://localhost:3000
  `);
}