#!/usr/bin/env node

/**
 * Middleware Test Suite
 * Tests all authentication and redirection scenarios
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
// Note: Using a mock JWT token structure for testing
const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0cnVlY2hlY2tpYS5jb20iLCJyb2xlIjoiVVNFUiIsInBsYW4iOiJGUkVFIiwiaWF0IjoxNzI0NDU0MDAwLCJleHAiOjE3MjQ0NTQwMDF9.invalid'; 

// Test results storage
const testResults = [];
let totalTests = 0;
let passedTests = 0;

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await axios({
      url: `${BASE_URL}${url}`,
      method: 'GET',
      maxRedirects: 0, // Don't follow redirects automatically
      validateStatus: () => true, // Don't throw on any status
      timeout: 5000,
      ...options
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
      redirectLocation: response.headers.location
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
        redirectLocation: error.response.headers.location
      };
    }
    throw error;
  }
}

// Helper function to log test results
function logTest(testName, expected, actual, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${testName}: PASS`);
  } else {
    console.log(`❌ ${testName}: FAIL`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
  }
  
  if (details) {
    console.log(`   Details: ${details}`);
  }
  
  testResults.push({
    test: testName,
    expected,
    actual,
    passed,
    details
  });
  
  console.log(''); // Empty line for readability
}

// Test scenarios
async function runTests() {
  console.log('🚀 Starting Middleware Test Suite');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(50));
  console.log('');

  // Test 1: Access homepage without authentication - should allow
  console.log('Test 1: Homepage access without authentication');
  try {
    const response = await makeRequest('/');
    const passed = response.status === 200;
    logTest(
      'Homepage without auth',
      'Status 200 (allowed)',
      `Status ${response.status}`,
      passed,
      'Homepage should be accessible to everyone'
    );
  } catch (error) {
    logTest(
      'Homepage without auth',
      'Status 200',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 2: Access dashboard without token - should redirect to login
  console.log('Test 2: Dashboard access without authentication');
  try {
    const response = await makeRequest('/dashboard');
    const passed = response.status === 302 && response.redirectLocation?.includes('/login');
    logTest(
      'Dashboard without auth',
      'Redirect to /login (302)',
      `Status ${response.status}, Location: ${response.redirectLocation}`,
      passed,
      'Protected routes should redirect unauthenticated users'
    );
  } catch (error) {
    logTest(
      'Dashboard without auth',
      'Redirect to /login',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 3: Access API routes - should always allow
  console.log('Test 3: API route access');
  try {
    const response = await makeRequest('/api/health');
    const passed = response.status !== 302; // Should not redirect
    logTest(
      'API route access',
      'No redirect (not 302)',
      `Status ${response.status}`,
      passed,
      'API routes should bypass middleware'
    );
  } catch (error) {
    logTest(
      'API route access',
      'No redirect',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 4: Access static files - should always allow
  console.log('Test 4: Static files access');
  try {
    const response = await makeRequest('/_next/static/test');
    const passed = response.status !== 302; // Should not redirect (404 is fine)
    logTest(
      'Static files access',
      'No redirect (not 302)',
      `Status ${response.status}`,
      passed,
      'Static files should bypass middleware'
    );
  } catch (error) {
    logTest(
      'Static files access',
      'No redirect',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 5: Access protected route with expired/invalid token
  console.log('Test 5: Protected route with invalid token');
  try {
    const response = await makeRequest('/profile', {
      headers: {
        'Cookie': `accessToken=${EXPIRED_TOKEN}`
      }
    });
    const passed = response.status === 302 && response.redirectLocation?.includes('/login');
    
    logTest(
      'Protected route with invalid token',
      'Redirect to /login (302)',
      `Status ${response.status}, Location: ${response.redirectLocation}`,
      passed,
      'Invalid tokens should be cleared and user redirected'
    );
  } catch (error) {
    logTest(
      'Protected route with invalid token',
      'Redirect to /login',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 6: Analysis page without authentication - should redirect
  console.log('Test 6: Analysis page without authentication');
  try {
    const response = await makeRequest('/analysis');
    const passed = response.status === 302 && response.redirectLocation?.includes('/login');
    logTest(
      'Analysis without auth',
      'Redirect to /login (302)',
      `Status ${response.status}, Location: ${response.redirectLocation}`,
      passed,
      'Analysis page is protected and should redirect'
    );
  } catch (error) {
    logTest(
      'Analysis without auth',
      'Redirect to /login',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 7: History page without authentication - should redirect
  console.log('Test 7: History page without authentication');
  try {
    const response = await makeRequest('/history');
    const passed = response.status === 302 && response.redirectLocation?.includes('/login');
    logTest(
      'History without auth',
      'Redirect to /login (302)',
      `Status ${response.status}, Location: ${response.redirectLocation}`,
      passed,
      'History page is protected and should redirect'
    );
  } catch (error) {
    logTest(
      'History without auth',
      'Redirect to /login',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 8: Contact page access - should allow (public route)
  console.log('Test 8: Contact page access');
  try {
    const response = await makeRequest('/contact');
    const passed = response.status === 200;
    logTest(
      'Contact page access',
      'Status 200 (allowed)',
      `Status ${response.status}`,
      passed,
      'Contact page should be publicly accessible'
    );
  } catch (error) {
    logTest(
      'Contact page access',
      'Status 200',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 9: Pricing page access - should allow (public route)
  console.log('Test 9: Pricing page access');
  try {
    const response = await makeRequest('/pricing');
    const passed = response.status === 200;
    logTest(
      'Pricing page access',
      'Status 200 (allowed)',
      `Status ${response.status}`,
      passed,
      'Pricing page should be publicly accessible'
    );
  } catch (error) {
    logTest(
      'Pricing page access',
      'Status 200',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 10: Favicon access - should always allow
  console.log('Test 10: Favicon access');
  try {
    const response = await makeRequest('/favicon.ico');
    const passed = response.status !== 302; // Should not redirect (404 is fine)
    logTest(
      'Favicon access',
      'No redirect (not 302)',
      `Status ${response.status}`,
      passed,
      'Favicon should bypass middleware'
    );
  } catch (error) {
    logTest(
      'Favicon access',
      'No redirect',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 11: Test multiple redirects scenario
  console.log('Test 11: Multiple redirects handling');
  try {
    const client = axios.create({
      baseURL: BASE_URL,
      maxRedirects: 3,
      validateStatus: () => true,
      timeout: 10000
    });

    const response = await client.get('/dashboard');
    const redirectCount = response.request.res?.responseUrl ? 
      (response.request._redirectable?._redirectCount || 0) : 0;
    
    const passed = redirectCount <= 3;
    logTest(
      'Multiple redirects handling',
      'Max 3 redirects',
      `${redirectCount} redirects`,
      passed,
      'Should not cause infinite redirect loops'
    );
  } catch (error) {
    logTest(
      'Multiple redirects handling',
      'Max 3 redirects',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 12: Login page without token - should allow
  console.log('Test 12: Login page without authentication');
  try {
    const response = await makeRequest('/login');
    const passed = response.status === 200;
    logTest(
      'Login without auth',
      'Status 200 (allowed)',
      `Status ${response.status}`,
      passed,
      'Login page should be accessible to unauthenticated users'
    );
  } catch (error) {
    logTest(
      'Login without auth',
      'Status 200',
      `Error: ${error.message}`,
      false
    );
  }

  // Test 13: Register page without token - should allow
  console.log('Test 13: Register page without authentication');
  try {
    const response = await makeRequest('/register');
    const passed = response.status === 200;
    logTest(
      'Register without auth',
      'Status 200 (allowed)',
      `Status ${response.status}`,
      passed,
      'Register page should be accessible to unauthenticated users'
    );
  } catch (error) {
    logTest(
      'Register without auth',
      'Status 200',
      `Error: ${error.message}`,
      false
    );
  }

  // Summary
  console.log('='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('');

  // Failed tests details
  const failedTests = testResults.filter(result => !result.passed);
  if (failedTests.length > 0) {
    console.log('❌ FAILED TESTS DETAILS:');
    console.log('-'.repeat(30));
    failedTests.forEach(test => {
      console.log(`• ${test.test}`);
      console.log(`  Expected: ${test.expected}`);
      console.log(`  Actual: ${test.actual}`);
      if (test.details) {
        console.log(`  Details: ${test.details}`);
      }
      console.log('');
    });
  }

  // Critical issues check
  const criticalIssues = [];
  
  // Check for missing redirects on protected routes
  const protectedRouteTests = testResults.filter(test => 
    test.test.includes('Dashboard without auth') || 
    test.test.includes('Analysis without auth') ||
    test.test.includes('History without auth')
  );
  
  protectedRouteTests.forEach(test => {
    if (!test.passed) {
      criticalIssues.push(`Protected route not properly secured: ${test.test}`);
    }
  });

  // Check for redirect loops
  const redirectTests = testResults.filter(test => 
    test.test.includes('redirect') || test.test.includes('Multiple redirects')
  );
  
  redirectTests.forEach(test => {
    if (!test.passed && test.test.includes('Multiple redirects')) {
      criticalIssues.push(`Potential infinite redirect loop: ${test.test}`);
    }
  });

  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    console.log('-'.repeat(30));
    criticalIssues.forEach(issue => {
      console.log(`• ${issue}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('-'.repeat(20));
  
  if (passedTests === totalTests) {
    console.log('• All tests passed! Middleware is working correctly.');
  } else {
    console.log(`• ${totalTests - passedTests} tests failed. Review middleware logic.`);
  }
  
  if (criticalIssues.length > 0) {
    console.log('• Address critical security issues immediately.');
  }
  
  console.log('• Monitor middleware performance in production.');
  console.log('• Set up alerts for authentication failures.');
  console.log('• Consider implementing rate limiting for auth endpoints.');
  
  // Save results to file
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
    },
    results: testResults,
    criticalIssues
  };
  
  fs.writeFileSync('middleware-test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed results saved to: middleware-test-results.json');
}

// Handle server availability
async function checkServerAvailability() {
  try {
    await makeRequest('/api/health');
    return true;
  } catch (error) {
    console.log(`❌ Server not available at ${BASE_URL}`);
    console.log('Please start the development server with: npm run dev');
    console.log('Or specify a different URL with: TEST_URL=http://localhost:3001 node scripts/test-middleware.js');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server availability...');
  
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    process.exit(1);
  }
  
  console.log('✅ Server is available. Starting tests...\n');
  
  await runTests();
  
  const exitCode = (passedTests === totalTests) ? 0 : 1;
  process.exit(exitCode);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { runTests, makeRequest };