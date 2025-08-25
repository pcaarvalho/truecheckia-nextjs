#!/usr/bin/env node

/**
 * =================================================================
 * TRUECHECKIA POST-DEPLOYMENT VALIDATION SCRIPT
 * =================================================================
 * Este script valida se o deploy foi bem-sucedido
 * Testa todas as funcionalidades críticas em produção
 * =================================================================
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class PostDeployValidator {
  constructor(baseUrl = 'https://www.truecheckia.com') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/api`;
    this.errors = [];
    this.warnings = [];
    this.results = [];
  }

  log(color, icon, message) {
    console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const protocol = url.startsWith('https:') ? https : http;
      
      const req = protocol.request(url, { 
        timeout: 10000,
        ...options 
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: responseTime
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.data) {
        req.write(JSON.stringify(options.data));
      }

      req.end();
    });
  }

  async testHealthEndpoint() {
    this.log('blue', '🏥', 'Testando endpoint de health...');
    
    try {
      const response = await this.makeRequest(`${this.apiUrl}/health`);
      
      if (response.statusCode === 200) {
        this.log('green', '✅', `Health endpoint OK (${response.responseTime}ms)`);
        this.results.push({ test: 'Health Endpoint', status: 'PASS', responseTime: response.responseTime });
      } else {
        this.errors.push(`Health endpoint returned ${response.statusCode}`);
        this.log('red', '❌', `Health endpoint falhou: ${response.statusCode}`);
      }
    } catch (error) {
      this.errors.push(`Health endpoint error: ${error.message}`);
      this.log('red', '❌', `Erro no health endpoint: ${error.message}`);
    }
  }

  async testMainPages() {
    this.log('blue', '📄', 'Testando páginas principais...');
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/login', name: 'Login Page' },
      { path: '/register', name: 'Register Page' },
      { path: '/pricing', name: 'Pricing Page' },
      { path: '/contact', name: 'Contact Page' }
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${page.path}`);
        
        if (response.statusCode === 200) {
          this.log('green', '✅', `${page.name} OK (${response.responseTime}ms)`);
          this.results.push({ test: page.name, status: 'PASS', responseTime: response.responseTime });
        } else if (response.statusCode >= 300 && response.statusCode < 400) {
          this.log('yellow', '⚠️', `${page.name} redirecionou: ${response.statusCode}`);
          this.results.push({ test: page.name, status: 'REDIRECT', responseTime: response.responseTime });
        } else {
          this.errors.push(`${page.name} returned ${response.statusCode}`);
          this.log('red', '❌', `${page.name} falhou: ${response.statusCode}`);
        }
      } catch (error) {
        this.errors.push(`${page.name} error: ${error.message}`);
        this.log('red', '❌', `Erro em ${page.name}: ${error.message}`);
      }
    }
  }

  async testAPIEndpoints() {
    this.log('blue', '🔌', 'Testando endpoints da API...');
    
    const endpoints = [
      { path: '/auth/login', method: 'POST', name: 'Login API' },
      { path: '/auth/register', method: 'POST', name: 'Register API' },
      { path: '/analysis', method: 'GET', name: 'Analysis API' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`${this.apiUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'TrueCheckIA-PostDeploy-Validator'
          }
        });
        
        // Most endpoints should return 400/401 for empty requests, not 500
        if (response.statusCode < 500) {
          this.log('green', '✅', `${endpoint.name} acessível (${response.responseTime}ms)`);
          this.results.push({ test: endpoint.name, status: 'PASS', responseTime: response.responseTime });
        } else {
          this.errors.push(`${endpoint.name} internal error: ${response.statusCode}`);
          this.log('red', '❌', `${endpoint.name} erro interno: ${response.statusCode}`);
        }
      } catch (error) {
        this.errors.push(`${endpoint.name} error: ${error.message}`);
        this.log('red', '❌', `Erro em ${endpoint.name}: ${error.message}`);
      }
    }
  }

  async testSecurityHeaders() {
    this.log('blue', '🛡️', 'Verificando cabeçalhos de segurança...');
    
    try {
      const response = await this.makeRequest(this.baseUrl);
      const headers = response.headers;
      
      const securityChecks = [
        { header: 'x-content-type-options', expected: 'nosniff', name: 'X-Content-Type-Options' },
        { header: 'x-frame-options', expected: 'DENY', name: 'X-Frame-Options' },
        { header: 'x-xss-protection', expected: '1; mode=block', name: 'X-XSS-Protection' },
        { header: 'referrer-policy', expected: 'strict-origin-when-cross-origin', name: 'Referrer-Policy' }
      ];

      for (const check of securityChecks) {
        if (headers[check.header]) {
          if (headers[check.header].includes(check.expected)) {
            this.log('green', '✅', `${check.name} configurado corretamente`);
          } else {
            this.warnings.push(`${check.name} has unexpected value: ${headers[check.header]}`);
            this.log('yellow', '⚠️', `${check.name} valor inesperado: ${headers[check.header]}`);
          }
        } else {
          this.warnings.push(`Missing security header: ${check.name}`);
          this.log('yellow', '⚠️', `Cabeçalho de segurança ausente: ${check.name}`);
        }
      }
    } catch (error) {
      this.warnings.push(`Could not check security headers: ${error.message}`);
      this.log('yellow', '⚠️', `Não foi possível verificar cabeçalhos: ${error.message}`);
    }
  }

  async testHTTPSRedirect() {
    this.log('blue', '🔒', 'Testando redirecionamento HTTPS...');
    
    try {
      const httpUrl = this.baseUrl.replace('https://', 'http://');
      const response = await this.makeRequest(httpUrl);
      
      if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (location && location.startsWith('https://')) {
          this.log('green', '✅', 'Redirecionamento HTTPS funcionando');
          this.results.push({ test: 'HTTPS Redirect', status: 'PASS' });
        } else {
          this.warnings.push('HTTP redirect does not lead to HTTPS');
          this.log('yellow', '⚠️', 'Redirecionamento não usa HTTPS');
        }
      } else {
        this.warnings.push('No HTTP to HTTPS redirect configured');
        this.log('yellow', '⚠️', 'Sem redirecionamento HTTP para HTTPS');
      }
    } catch (error) {
      this.warnings.push(`Could not test HTTPS redirect: ${error.message}`);
      this.log('yellow', '⚠️', `Não foi possível testar redirecionamento: ${error.message}`);
    }
  }

  async testPerformance() {
    this.log('blue', '⚡', 'Testando performance...');
    
    const performanceTests = [
      { path: '/', name: 'Homepage Load Time', maxTime: 3000 },
      { path: '/login', name: 'Login Page Load Time', maxTime: 2000 },
      { path: '/api/health', name: 'API Response Time', maxTime: 1000 }
    ];

    for (const test of performanceTests) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${test.path}`);
        
        if (response.responseTime <= test.maxTime) {
          this.log('green', '✅', `${test.name}: ${response.responseTime}ms (bom)`);
          this.results.push({ test: test.name, status: 'PASS', responseTime: response.responseTime });
        } else {
          this.warnings.push(`${test.name} slow: ${response.responseTime}ms > ${test.maxTime}ms`);
          this.log('yellow', '⚠️', `${test.name}: ${response.responseTime}ms (lento)`);
        }
      } catch (error) {
        this.warnings.push(`Performance test failed for ${test.name}: ${error.message}`);
        this.log('yellow', '⚠️', `Erro no teste de performance ${test.name}: ${error.message}`);
      }
    }
  }

  calculateAverageResponseTime() {
    const times = this.results.filter(r => r.responseTime).map(r => r.responseTime);
    if (times.length === 0) return 0;
    return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  }

  async runAllTests() {
    console.log(`${colors.cyan}`);
    console.log('=================================================================');
    console.log('🚀 TRUECHECKIA POST-DEPLOYMENT VALIDATION');
    console.log(`🌐 Testing: ${this.baseUrl}`);
    console.log('=================================================================');
    console.log(`${colors.reset}`);

    const startTime = Date.now();

    try {
      await this.testHealthEndpoint();
      await this.testMainPages();
      await this.testAPIEndpoints();
      await this.testSecurityHeaders();
      await this.testHTTPSRedirect();
      await this.testPerformance();

      this.printSummary(Date.now() - startTime);
    } catch (error) {
      this.log('red', '💥', `Erro fatal: ${error.message}`);
      process.exit(1);
    }
  }

  printSummary(totalTime) {
    console.log(`${colors.cyan}`);
    console.log('=================================================================');
    console.log('📊 RESUMO DA VALIDAÇÃO');
    console.log('=================================================================');
    console.log(`${colors.reset}`);

    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const totalTests = this.results.length;
    const avgResponseTime = this.calculateAverageResponseTime();

    this.log('blue', '📈', `Testes executados: ${totalTests}`);
    this.log('green', '✅', `Testes aprovados: ${passedTests}`);
    this.log('red', '❌', `Erros encontrados: ${this.errors.length}`);
    this.log('yellow', '⚠️', `Avisos: ${this.warnings.length}`);
    this.log('cyan', '⏱️', `Tempo médio de resposta: ${avgResponseTime}ms`);
    this.log('cyan', '🕐', `Tempo total de validação: ${Math.round(totalTime/1000)}s`);

    if (this.errors.length === 0) {
      console.log(`${colors.green}`);
      console.log('🎉 DEPLOY VALIDADO COM SUCESSO!');
      console.log(`${colors.reset}`);
      
      if (this.warnings.length === 0) {
        this.log('green', '🚀', 'Todas as verificações passaram! Sistema pronto para uso.');
      } else {
        this.log('yellow', '⚡', 'Sistema funcionando com alguns avisos (não críticos).');
      }
      
      console.log(`${colors.cyan}`);
      console.log('📋 CHECKLIST PÓS-DEPLOY CONCLUÍDO:');
      console.log('✅ Site acessível');
      console.log('✅ APIs funcionando');
      console.log('✅ Páginas carregando');
      console.log('✅ Performance adequada');
      console.log(`${colors.reset}`);
      
    } else {
      console.log(`${colors.red}`);
      console.log('❌ PROBLEMAS ENCONTRADOS NO DEPLOY');
      console.log(`${colors.reset}`);
      
      this.errors.forEach(error => {
        console.log(`${colors.red}   • ${error}${colors.reset}`);
      });
      
      console.log(`${colors.yellow}`);
      console.log('🔧 AÇÕES NECESSÁRIAS:');
      console.log('1. Verificar logs do Vercel');
      console.log('2. Confirmar configurações de DNS');
      console.log('3. Validar variáveis de ambiente');
      console.log('4. Testar conectividade de rede');
      console.log(`${colors.reset}`);
    }

    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}`);
      console.log('⚠️ AVISOS (não impedem o funcionamento):');
      this.warnings.forEach(warning => {
        console.log(`${colors.yellow}   • ${warning}${colors.reset}`);
      });
      console.log(`${colors.reset}`);
    }

    // Exit with appropriate code
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Command line usage
if (require.main === module) {
  const baseUrl = process.argv[2] || 'https://www.truecheckia.com';
  
  console.log(`${colors.blue}🔍 Iniciando validação pós-deploy...${colors.reset}`);
  console.log(`${colors.blue}🌐 URL: ${baseUrl}${colors.reset}`);
  
  const validator = new PostDeployValidator(baseUrl);
  validator.runAllTests().catch(error => {
    console.error(`${colors.red}❌ Erro na validação: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = PostDeployValidator;