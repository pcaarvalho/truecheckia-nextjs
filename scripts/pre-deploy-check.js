#!/usr/bin/env node

/**
 * =================================================================
 * TRUECHECKIA PRE-DEPLOYMENT VALIDATION SCRIPT
 * =================================================================
 * Este script valida todas as configurações antes do deploy
 * Verifica APIs, banco de dados, variáveis de ambiente e integrações
 * =================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
    this.loadEnvironment();
  }

  loadEnvironment() {
    const envFile = path.join(process.cwd(), '.env.production');
    if (!fs.existsSync(envFile)) {
      throw new Error('.env.production file not found');
    }

    // Parse .env.production file
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.startsWith('#') || !line.includes('=')) return;
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });

    this.env = envVars;
  }

  log(color, icon, message) {
    console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
  }

  async checkRequiredEnvVars() {
    this.log('blue', '🔍', 'Verificando variáveis de ambiente...');
    
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'STRIPE_SECRET_KEY',
      'RESEND_API_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXT_PUBLIC_BASE_URL',
      'NEXT_PUBLIC_API_URL'
    ];

    for (const varName of required) {
      if (!this.env[varName]) {
        this.errors.push(`Missing required environment variable: ${varName}`);
        this.log('red', '❌', `Variável ${varName} não encontrada`);
      } else {
        this.log('green', '✅', `${varName} configurada`);
      }
    }
  }

  async checkDatabaseConnection() {
    this.log('blue', '🗄️', 'Verificando conexão com banco de dados...');
    
    try {
      // This would require actual database connection in production
      // For now, just check if DATABASE_URL is valid PostgreSQL format
      const dbUrl = this.env.DATABASE_URL;
      if (dbUrl && dbUrl.startsWith('postgresql://')) {
        this.log('green', '✅', 'URL do banco de dados válida');
      } else {
        this.errors.push('Invalid DATABASE_URL format');
        this.log('red', '❌', 'URL do banco de dados inválida');
      }
    } catch (error) {
      this.errors.push(`Database connection failed: ${error.message}`);
      this.log('red', '❌', `Erro na conexão: ${error.message}`);
    }
  }

  async checkAPIKeys() {
    this.log('blue', '🔑', 'Verificando chaves de API...');

    // Check OpenAI API Key format
    if (this.env.OPENAI_API_KEY) {
      if (this.env.OPENAI_API_KEY.startsWith('sk-proj-') || this.env.OPENAI_API_KEY.startsWith('sk-')) {
        this.log('green', '✅', 'OpenAI API Key válida');
      } else {
        this.warnings.push('OpenAI API Key format may be invalid');
        this.log('yellow', '⚠️', 'Formato da OpenAI API Key pode estar inválido');
      }
    }

    // Check Stripe API Key format
    if (this.env.STRIPE_SECRET_KEY) {
      if (this.env.STRIPE_SECRET_KEY.startsWith('sk_live_') || this.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        this.log('green', '✅', 'Stripe API Key válida');
      } else {
        this.errors.push('Invalid Stripe API Key format');
        this.log('red', '❌', 'Formato da Stripe API Key inválido');
      }
    }

    // Check Resend API Key format
    if (this.env.RESEND_API_KEY) {
      if (this.env.RESEND_API_KEY.startsWith('re_')) {
        this.log('green', '✅', 'Resend API Key válida');
      } else {
        this.warnings.push('Resend API Key format may be invalid');
        this.log('yellow', '⚠️', 'Formato da Resend API Key pode estar inválido');
      }
    }
  }

  async checkBuildFiles() {
    this.log('blue', '🏗️', 'Verificando arquivos de build...');

    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tailwind.config.ts',
      'prisma/schema.prisma',
      'vercel.json'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        this.log('green', '✅', `${file} encontrado`);
      } else {
        this.errors.push(`Missing required file: ${file}`);
        this.log('red', '❌', `Arquivo ${file} não encontrado`);
      }
    }
  }

  async checkDomainConfiguration() {
    this.log('blue', '🌐', 'Verificando configuração de domínio...');

    const baseUrl = this.env.NEXT_PUBLIC_BASE_URL;
    const apiUrl = this.env.NEXT_PUBLIC_API_URL;

    if (baseUrl && apiUrl) {
      if (baseUrl.startsWith('https://') && apiUrl.startsWith('https://')) {
        this.log('green', '✅', 'URLs configuradas com HTTPS');
      } else {
        this.warnings.push('URLs should use HTTPS in production');
        this.log('yellow', '⚠️', 'URLs deveriam usar HTTPS em produção');
      }
      
      if (baseUrl.includes('www.') && apiUrl.includes('www.')) {
        this.log('green', '✅', 'Configuração WWW consistente');
      } else {
        this.warnings.push('Inconsistent www configuration between BASE_URL and API_URL');
        this.log('yellow', '⚠️', 'Configuração WWW inconsistente');
      }
    }
  }

  async checkSecurityHeaders() {
    this.log('blue', '🛡️', 'Verificando configurações de segurança...');

    if (this.env.JWT_SECRET && this.env.JWT_SECRET.length >= 64) {
      this.log('green', '✅', 'JWT_SECRET tem tamanho adequado');
    } else {
      this.errors.push('JWT_SECRET should be at least 64 characters long');
      this.log('red', '❌', 'JWT_SECRET deve ter pelo menos 64 caracteres');
    }

    if (this.env.JWT_REFRESH_SECRET && this.env.JWT_REFRESH_SECRET.length >= 64) {
      this.log('green', '✅', 'JWT_REFRESH_SECRET tem tamanho adequado');
    } else {
      this.errors.push('JWT_REFRESH_SECRET should be at least 64 characters long');
      this.log('red', '❌', 'JWT_REFRESH_SECRET deve ter pelo menos 64 caracteres');
    }
  }

  async checkPrismaSetup() {
    this.log('blue', '⚡', 'Verificando configuração do Prisma...');

    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      if (schemaContent.includes('provider = "postgresql"')) {
        this.log('green', '✅', 'Prisma configurado para PostgreSQL');
      } else if (schemaContent.includes('provider = "sqlite"')) {
        this.warnings.push('Prisma is configured for SQLite, consider PostgreSQL for production');
        this.log('yellow', '⚠️', 'Prisma configurado para SQLite, considere PostgreSQL para produção');
      }

      if (schemaContent.includes('@@map')) {
        this.log('green', '✅', 'Mapeamento de tabelas configurado');
      }
    }

    // Check for migrations
    const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
    if (fs.existsSync(migrationsPath)) {
      const migrations = fs.readdirSync(migrationsPath);
      if (migrations.length > 0) {
        this.log('green', '✅', `${migrations.length} migrações encontradas`);
      } else {
        this.warnings.push('No database migrations found');
        this.log('yellow', '⚠️', 'Nenhuma migração de banco encontrada');
      }
    }
  }

  async runAllChecks() {
    console.log(`${colors.cyan}`);
    console.log('=================================================================');
    console.log('🚀 TRUECHECKIA PRE-DEPLOYMENT VALIDATION');
    console.log('=================================================================');
    console.log(`${colors.reset}`);

    try {
      await this.checkRequiredEnvVars();
      await this.checkDatabaseConnection();
      await this.checkAPIKeys();
      await this.checkBuildFiles();
      await this.checkDomainConfiguration();
      await this.checkSecurityHeaders();
      await this.checkPrismaSetup();

      this.printSummary();
    } catch (error) {
      this.log('red', '💥', `Erro fatal: ${error.message}`);
      process.exit(1);
    }
  }

  printSummary() {
    console.log(`${colors.cyan}`);
    console.log('=================================================================');
    console.log('📊 RESUMO DA VALIDAÇÃO');
    console.log('=================================================================');
    console.log(`${colors.reset}`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('green', '🎉', 'Todas as verificações passaram! Pronto para deploy.');
      process.exit(0);
    }

    if (this.errors.length > 0) {
      this.log('red', '❌', `${this.errors.length} erro(s) encontrado(s):`);
      this.errors.forEach(error => {
        console.log(`${colors.red}   • ${error}${colors.reset}`);
      });
    }

    if (this.warnings.length > 0) {
      this.log('yellow', '⚠️', `${this.warnings.length} aviso(s):`);
      this.warnings.forEach(warning => {
        console.log(`${colors.yellow}   • ${warning}${colors.reset}`);
      });
    }

    if (this.errors.length > 0) {
      this.log('red', '🚫', 'Corrija os erros antes de fazer o deploy.');
      process.exit(1);
    } else {
      this.log('green', '✅', 'Pronto para deploy (com avisos).');
      process.exit(0);
    }
  }
}

// Run the validator
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.runAllChecks().catch(error => {
    console.error(`${colors.red}❌ Erro na validação: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = DeploymentValidator;