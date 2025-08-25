#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class PreDeployValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      routes: [],
      build: { success: false, errors: [], warnings: [] },
      lighthouse: { scores: {}, issues: [] },
      overall: { ready: false, blockers: [], warnings: [] }
    };
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async validateRoutes() {
    console.log('🔍 Testing critical routes...');
    
    const routes = [
      { path: '/', expectedStatus: 200, description: 'Landing page' },
      { path: '/login', expectedStatus: 200, description: 'Login page' },
      { path: '/register', expectedStatus: 200, description: 'Register page' },
      { path: '/dashboard', expectedStatus: [302, 307], description: 'Dashboard (should redirect without auth)' },
      { path: '/api/health', expectedStatus: 200, description: 'Health check API' }
    ];

    for (const route of routes) {
      try {
        const result = await this.testRoute(route);
        this.results.routes.push(result);
        
        const statusOk = Array.isArray(route.expectedStatus) 
          ? route.expectedStatus.includes(result.status)
          : result.status === route.expectedStatus;
          
        console.log(`${statusOk ? '✅' : '❌'} ${route.path} → ${result.status} (${result.responseTime}ms)`);
        
        if (!statusOk) {
          this.results.overall.blockers.push(`Route ${route.path} returned ${result.status}, expected ${route.expectedStatus}`);
        }
      } catch (error) {
        console.log(`❌ ${route.path} → ERROR: ${error.message}`);
        this.results.routes.push({
          path: route.path,
          status: 'ERROR',
          error: error.message,
          responseTime: 0
        });
        this.results.overall.blockers.push(`Route ${route.path} failed: ${error.message}`);
      }
    }
  }

  async testRoute(route) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = `${this.baseUrl}${route.path}`;
      const lib = url.startsWith('https') ? https : http;
      
      const req = lib.get(url, (res) => {
        const responseTime = Date.now() - startTime;
        resolve({
          path: route.path,
          status: res.statusCode,
          responseTime,
          headers: res.headers
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
    });
  }

  async validateBuild() {
    console.log('🏗️ Validating production build...');
    
    return new Promise((resolve) => {
      const build = spawn('npm', ['run', 'build'], { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';
      
      build.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      build.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      build.on('close', (code) => {
        this.results.build.success = code === 0;
        
        if (code !== 0) {
          this.results.build.errors.push(`Build failed with exit code ${code}`);
          if (stderr) {
            this.results.build.errors.push(stderr);
          }
          this.results.overall.blockers.push('Production build failed');
          console.log('❌ Build failed');
        } else {
          console.log('✅ Build successful');
          
          // Parse build output for warnings
          const lines = stdout.split('\n');
          lines.forEach(line => {
            if (line.includes('warning') || line.includes('Warning')) {
              this.results.build.warnings.push(line.trim());
            }
          });
          
          // Extract bundle sizes
          this.extractBundleSizes(stdout);
        }
        
        resolve();
      });
    });
  }

  extractBundleSizes(buildOutput) {
    const lines = buildOutput.split('\n');
    const bundleInfo = [];
    
    lines.forEach(line => {
      if (line.includes('.js') && (line.includes('kB') || line.includes('MB'))) {
        bundleInfo.push(line.trim());
      }
    });
    
    this.results.build.bundleInfo = bundleInfo;
    
    // Check for large bundles
    bundleInfo.forEach(info => {
      if (info.includes('MB') && parseFloat(info.match(/(\d+\.?\d*)\s*MB/)?.[1] || 0) > 1) {
        this.results.overall.warnings.push(`Large bundle detected: ${info}`);
      }
    });
  }

  async runLighthouse() {
    console.log('🚀 Running Lighthouse performance tests...');
    
    try {
      // Check if lighthouse is available
      const lighthouse = spawn('lighthouse', ['--version'], { stdio: 'pipe' });
      
      await new Promise((resolve, reject) => {
        lighthouse.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Lighthouse not available'));
          } else {
            resolve();
          }
        });
      });
      
      // Run lighthouse on homepage
      const lighthouseRun = spawn('lighthouse', [
        this.baseUrl,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        '--output-path=./lighthouse-report.json',
        '--chrome-flags="--headless --no-sandbox"'
      ], { stdio: 'pipe' });
      
      await new Promise((resolve) => {
        lighthouseRun.on('close', (code) => {
          if (code === 0 && fs.existsSync('./lighthouse-report.json')) {
            try {
              const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
              this.results.lighthouse.scores = {
                performance: Math.round(report.categories.performance.score * 100),
                accessibility: Math.round(report.categories.accessibility.score * 100),
                bestPractices: Math.round(report.categories['best-practices'].score * 100),
                seo: Math.round(report.categories.seo.score * 100)
              };
              
              // Check scores against thresholds
              const thresholds = { performance: 90, accessibility: 95, bestPractices: 90, seo: 90 };
              
              Object.entries(this.results.lighthouse.scores).forEach(([category, score]) => {
                const threshold = thresholds[category] || 90;
                console.log(`📊 ${category}: ${score}% ${score >= threshold ? '✅' : '⚠️'}`);
                
                if (score < threshold) {
                  this.results.lighthouse.issues.push(`${category} score (${score}%) below threshold (${threshold}%)`);
                  if (score < 80) {
                    this.results.overall.blockers.push(`Critical ${category} score: ${score}%`);
                  } else {
                    this.results.overall.warnings.push(`Low ${category} score: ${score}%`);
                  }
                }
              });
              
              // Clean up report file
              fs.unlinkSync('./lighthouse-report.json');
            } catch (error) {
              console.log('⚠️ Could not parse Lighthouse report');
              this.results.lighthouse.issues.push('Could not parse Lighthouse report');
            }
          } else {
            console.log('⚠️ Lighthouse test failed');
            this.results.lighthouse.issues.push('Lighthouse execution failed');
            this.results.overall.warnings.push('Performance tests could not be completed');
          }
          resolve();
        });
      });
      
    } catch (error) {
      console.log('⚠️ Lighthouse not available, skipping performance tests');
      this.results.lighthouse.issues.push('Lighthouse not available');
      this.results.overall.warnings.push('Performance tests skipped - Lighthouse not available');
    }
  }

  generateReport() {
    // Determine overall readiness
    this.results.overall.ready = this.results.overall.blockers.length === 0;
    
    const report = `# Pre-Deployment Validation Report
Generated: ${this.results.timestamp}

## 🎯 Overall Status: ${this.results.overall.ready ? '✅ READY FOR DEPLOY' : '❌ NOT READY - BLOCKERS FOUND'}

### Critical Issues (Blockers)
${this.results.overall.blockers.length > 0 
  ? this.results.overall.blockers.map(b => `- ❌ ${b}`).join('\n')
  : '✅ No blockers found'
}

### Warnings (Non-blocking)
${this.results.overall.warnings.length > 0
  ? this.results.overall.warnings.map(w => `- ⚠️ ${w}`).join('\n')
  : '✅ No warnings'
}

## 🛣️ Route Testing Results

${this.results.routes.map(route => {
  const statusOk = route.status === 200 || (route.path === '/dashboard' && [302, 307].includes(route.status));
  return `- ${statusOk ? '✅' : '❌'} ${route.path} → ${route.status} ${route.error ? `(${route.error})` : `(${route.responseTime}ms)`}`;
}).join('\n')}

## 🏗️ Build Validation

**Status**: ${this.results.build.success ? '✅ SUCCESS' : '❌ FAILED'}

${this.results.build.errors.length > 0 ? `
**Errors**:
${this.results.build.errors.map(e => `- ❌ ${e}`).join('\n')}
` : ''}

${this.results.build.warnings.length > 0 ? `
**Warnings**:
${this.results.build.warnings.map(w => `- ⚠️ ${w}`).join('\n')}
` : ''}

${this.results.build.bundleInfo && this.results.build.bundleInfo.length > 0 ? `
**Bundle Information**:
\`\`\`
${this.results.build.bundleInfo.join('\n')}
\`\`\`
` : ''}

## 🚀 Performance Testing (Lighthouse)

${Object.keys(this.results.lighthouse.scores).length > 0 ? `
**Scores**:
- 📈 Performance: ${this.results.lighthouse.scores.performance}% ${this.results.lighthouse.scores.performance >= 90 ? '✅' : '⚠️'}
- ♿ Accessibility: ${this.results.lighthouse.scores.accessibility}% ${this.results.lighthouse.scores.accessibility >= 95 ? '✅' : '⚠️'}
- ✨ Best Practices: ${this.results.lighthouse.scores.bestPractices}% ${this.results.lighthouse.scores.bestPractices >= 90 ? '✅' : '⚠️'}
- 🔍 SEO: ${this.results.lighthouse.scores.seo}% ${this.results.lighthouse.scores.seo >= 90 ? '✅' : '⚠️'}
` : '⚠️ Performance tests not completed'}

${this.results.lighthouse.issues.length > 0 ? `
**Issues**:
${this.results.lighthouse.issues.map(i => `- ⚠️ ${i}`).join('\n')}
` : ''}

## 🎯 Deployment Checklist

- [${this.results.build.success ? 'x' : ' '}] Production build completes successfully
- [${this.results.routes.filter(r => r.status === 200 || (r.path === '/dashboard' && [302, 307].includes(r.status))).length === this.results.routes.length ? 'x' : ' '}] All critical routes respond correctly
- [${Object.keys(this.results.lighthouse.scores).length > 0 && this.results.lighthouse.scores.performance >= 80 ? 'x' : ' '}] Performance scores acceptable
- [${this.results.overall.blockers.length === 0 ? 'x' : ' '}] No critical blockers present

## 🔧 Recommendations

### Pre-Deploy
${this.results.overall.blockers.length > 0 
  ? '⛔ **MUST FIX BEFORE DEPLOY**:\n' + this.results.overall.blockers.map(b => `- ${b}`).join('\n')
  : '✅ Ready for deployment'
}

### Post-Deploy
- Monitor application logs for errors
- Verify all integrations (Stripe, email, OAuth) are working
- Test user registration and login flows
- Check database connectivity and performance
- Validate SSL certificate and domain configuration

### Performance Optimizations
${this.results.overall.warnings.length > 0
  ? this.results.overall.warnings.map(w => `- ${w}`).join('\n')
  : '- Continue monitoring Core Web Vitals'
}

---
*Report generated by pre-deploy-validation.js*
`;

    return report;
  }

  async run() {
    console.log('🚀 Starting Pre-Deployment Validation...\n');
    
    // Run all validation steps
    await this.validateRoutes();
    console.log('');
    
    await this.validateBuild();
    console.log('');
    
    await this.runLighthouse();
    console.log('');
    
    // Generate and save report
    const report = this.generateReport();
    fs.writeFileSync('./PRE_DEPLOY_VALIDATION_REPORT.md', report);
    
    console.log('📋 Validation complete. Report saved to PRE_DEPLOY_VALIDATION_REPORT.md\n');
    console.log(this.results.overall.ready ? '✅ READY FOR DEPLOYMENT' : '❌ DEPLOYMENT BLOCKED');
    
    if (this.results.overall.blockers.length > 0) {
      console.log('\n🚨 Critical issues found:');
      this.results.overall.blockers.forEach(blocker => console.log(`  - ${blocker}`));
    }
    
    if (this.results.overall.warnings.length > 0) {
      console.log('\n⚠️ Warnings (non-blocking):');
      this.results.overall.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Exit with appropriate code
    process.exit(this.results.overall.ready ? 0 : 1);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PreDeployValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PreDeployValidator;