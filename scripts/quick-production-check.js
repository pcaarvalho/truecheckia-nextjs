#!/usr/bin/env node

/**
 * Quick Production Readiness Check
 * Validates critical configuration before deployment
 */

const fs = require('fs');
const path = require('path');

class ProductionReadinessCheck {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  checkPackageJson() {
    console.log('🔍 Checking package.json...');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check build command
    if (!pkg.scripts['vercel-build']) {
      this.issues.push('Missing vercel-build script in package.json');
    }
    
    if (!pkg.scripts['vercel-build'].includes('16384')) {
      this.issues.push('vercel-build script not using 16GB memory allocation');
    }
    
    // Check engine requirements
    if (!pkg.engines || !pkg.engines.node) {
      this.warnings.push('No Node.js engine requirement specified');
    }
    
    console.log('✅ package.json checked');
  }

  checkVercelJson() {
    console.log('🔍 Checking vercel.json...');
    
    const vercelPath = path.join(process.cwd(), 'vercel.json');
    if (!fs.existsSync(vercelPath)) {
      this.issues.push('vercel.json not found');
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    
    // Check memory allocation
    if (!config.build?.env?.NODE_OPTIONS?.includes('16384')) {
      this.issues.push('vercel.json not configured for 16GB memory');
    }
    
    // Check framework
    if (config.framework !== 'nextjs') {
      this.warnings.push('Framework not set to nextjs in vercel.json');
    }
    
    console.log('✅ vercel.json checked');
  }

  checkNextConfig() {
    console.log('🔍 Checking next.config.js...');
    
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check if standalone is disabled
    if (configContent.includes("output: 'standalone'") && !configContent.includes('// output:')) {
      this.warnings.push('Standalone output enabled - may cause issues on Vercel');
    }
    
    // Check CORS settings
    if (configContent.includes("'https://www.truecheckia.com'")) {
      this.warnings.push('Hardcoded domain in CORS - should use environment variable');
    }
    
    console.log('✅ next.config.js checked');
  }

  checkEnvironmentTemplate() {
    console.log('🔍 Checking environment setup...');
    
    // Check if production env guide exists
    const prodEnvPath = path.join(process.cwd(), 'PRODUCTION_ENV_SETUP.md');
    if (!fs.existsSync(prodEnvPath)) {
      this.warnings.push('Production environment setup guide not found');
    }
    
    // Check local env for reference
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      
      if (envContent.includes('file:./prisma/dev.db')) {
        this.warnings.push('Local environment using SQLite - ensure PostgreSQL is configured for production');
      }
      
      if (envContent.includes('localhost:3000')) {
        this.warnings.push('Local URLs in .env.local - ensure production URLs are set in Vercel');
      }
    }
    
    console.log('✅ Environment setup checked');
  }

  checkDatabaseSchema() {
    console.log('🔍 Checking database schema...');
    
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      if (!schema.includes('provider = "postgresql"') && !schema.includes('provider = "sqlite"')) {
        this.issues.push('Database provider not configured in Prisma schema');
      }
      
      if (schema.includes('provider = "sqlite"') && process.env.NODE_ENV === 'production') {
        this.issues.push('SQLite configured as database provider - PostgreSQL required for production');
      }
    } else {
      this.issues.push('Prisma schema not found');
    }
    
    console.log('✅ Database schema checked');
  }

  checkMiddleware() {
    console.log('🔍 Checking middleware configuration...');
    
    const middlewarePath = path.join(process.cwd(), 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const middleware = fs.readFileSync(middlewarePath, 'utf8');
      
      // Check for production logging optimization
      if (middleware.includes('console.log') && !middleware.includes('shouldLog')) {
        this.warnings.push('Middleware may have excessive logging in production');
      }
      
      // Check matcher configuration
      if (!middleware.includes('matcher:')) {
        this.issues.push('Middleware matcher not configured');
      }
    } else {
      this.warnings.push('Middleware not found');
    }
    
    console.log('✅ Middleware checked');
  }

  checkCriticalFiles() {
    console.log('🔍 Checking critical files...');
    
    const criticalFiles = [
      'app/api/health/route.ts',
      'lib/prisma.ts',
      'lib/auth-edge.ts'
    ];
    
    criticalFiles.forEach(file => {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        this.issues.push(`Critical file missing: ${file}`);
      }
    });
    
    console.log('✅ Critical files checked');
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 PRODUCTION READINESS REPORT');
    console.log('='.repeat(60));
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('🎉 ALL CHECKS PASSED - READY FOR PRODUCTION!');
      return true;
    }
    
    if (this.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES (Must fix before deploy):');
      this.issues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Recommended to fix):');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (this.issues.length > 0) {
      console.log('1. Fix all critical issues above');
      console.log('2. Re-run this check: node scripts/quick-production-check.js');
      console.log('3. Configure environment variables in Vercel Dashboard');
      console.log('4. Deploy to Vercel');
    } else {
      console.log('1. Configure environment variables in Vercel Dashboard');
      console.log('2. Deploy to Vercel');
      console.log('3. Test production endpoints');
    }
    
    return this.issues.length === 0;
  }

  async run() {
    console.log('🚀 Production Readiness Check Starting...\n');
    
    this.checkPackageJson();
    this.checkVercelJson();
    this.checkNextConfig();
    this.checkEnvironmentTemplate();
    this.checkDatabaseSchema();
    this.checkMiddleware();
    this.checkCriticalFiles();
    
    const isReady = this.generateReport();
    
    console.log('\n' + '='.repeat(60));
    process.exit(isReady ? 0 : 1);
  }
}

// Run check if called directly
if (require.main === module) {
  const checker = new ProductionReadinessCheck();
  checker.run().catch(error => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionReadinessCheck;