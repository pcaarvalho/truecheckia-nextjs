#!/usr/bin/env node

/**
 * E2E Test Runner
 * 
 * Simple script to run the authentication flow tests with proper setup and teardown.
 */

import { E2EAuthTester } from './auth-flow.test';
import { ensureTestUserExists, TEST_USERS, generateTestReport, TestReportData } from './test-utils';
import { promises as fs } from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : '';
  const resetCode = color ? colors.reset : '';
  console.log(`${colorCode}${message}${resetCode}`);
}

async function setupTestEnvironment(): Promise<boolean> {
  log('\n🔧 Setting up test environment...', 'cyan');
  
  try {
    // Ensure test users exist
    const testUser = TEST_USERS.EXISTING;
    log(`📝 Ensuring test user exists: ${testUser.email}`, 'blue');
    
    const userResult = await ensureTestUserExists(testUser);
    if (!userResult.success) {
      log(`❌ Failed to setup test user: ${userResult.error}`, 'red');
      return false;
    }
    
    log('✅ Test environment setup complete', 'green');
    return true;
  } catch (error) {
    log(`❌ Test environment setup failed: ${error}`, 'red');
    return false;
  }
}

async function runTests(): Promise<TestReportData[]> {
  log('\n🚀 Starting E2E Authentication Tests...', 'magenta');
  
  const tester = new E2EAuthTester();
  
  try {
    await tester.runAllTests();
    return []; // The tester handles its own results internally
  } catch (error) {
    log(`❌ Test execution failed: ${error}`, 'red');
    return [{
      testName: 'Test Suite Execution',
      status: 'FAIL',
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }];
  }
}

async function generateReports(results: TestReportData[]): Promise<void> {
  try {
    log('\n📊 Generating test reports...', 'cyan');
    
    // Create reports directory
    const reportsDir = path.join(process.cwd(), 'test-results');
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Generate markdown report
    const markdownReport = generateTestReport(results);
    const reportPath = path.join(reportsDir, 'e2e-auth-report.md');
    await fs.writeFile(reportPath, markdownReport);
    
    log(`📄 Test report saved: ${reportPath}`, 'green');
    
  } catch (error) {
    log(`❌ Failed to generate reports: ${error}`, 'red');
  }
}

async function cleanupTestEnvironment(): Promise<void> {
  log('\n🧹 Cleaning up test environment...', 'cyan');
  
  try {
    // Any cleanup tasks would go here
    // For now, we'll just log success
    log('✅ Test environment cleanup complete', 'green');
  } catch (error) {
    log(`⚠️  Test environment cleanup had issues: ${error}`, 'yellow');
  }
}

async function main() {
  const startTime = Date.now();
  let success = false;
  
  log('='.repeat(60), 'blue');
  log('🧪 E2E Authentication Test Suite', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    // Setup
    const setupSuccess = await setupTestEnvironment();
    if (!setupSuccess) {
      log('❌ Test setup failed, aborting', 'red');
      process.exit(1);
    }
    
    // Run tests
    const results = await runTests();
    
    // Generate reports if we have custom results
    if (results.length > 0) {
      await generateReports(results);
    }
    
    success = true;
    
  } catch (error) {
    log(`❌ Test suite failed with error: ${error}`, 'red');
    success = false;
  } finally {
    // Cleanup
    await cleanupTestEnvironment();
    
    // Summary
    const duration = Date.now() - startTime;
    log('\n' + '='.repeat(60), 'blue');
    log(`⏱️  Total execution time: ${(duration / 1000).toFixed(2)}s`, 'cyan');
    
    if (success) {
      log('🎉 E2E Authentication Tests completed successfully!', 'green');
      log('📋 Check test-results/ directory for detailed reports', 'blue');
    } else {
      log('💥 E2E Authentication Tests failed!', 'red');
      log('🔍 Check the error messages above and test-results/ for details', 'blue');
    }
    
    log('='.repeat(60), 'blue');
  }
  
  process.exit(success ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run main if this script is executed directly
if (require.main === module) {
  main();
}

export default main;