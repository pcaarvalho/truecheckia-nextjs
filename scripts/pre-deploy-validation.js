#!/usr/bin/env node

/**
 * Pre-Deploy Validation Script
 * Verifica se o projeto está pronto para deploy na Vercel
 */

const fs = require('fs');
const path = require('path');

// Cores para output colorido
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n🔍 ${msg}${colors.reset}`)
};

// Variáveis obrigatórias para deploy básico
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY'
];

// Variáveis recomendadas para funcionalidade completa
const RECOMMENDED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY'
];

// Arquivos obrigatórios
const REQUIRED_FILES = [
  'package.json',
  'next.config.js',
  'vercel.json',
  'prisma/schema.prisma',
  'middleware.ts'
];

let errors = 0;
let warnings = 0;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description}: ${filePath}`);
    return true;
  } else {
    log.error(`${description} não encontrado: ${filePath}`);
    errors++;
    return false;
  }
}

function checkPackageJson() {
  log.header('Validando package.json');
  
  if (!checkFile('package.json', 'Package.json')) return;
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Verificar scripts essenciais
  const requiredScripts = ['build', 'start', 'vercel-build'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      log.success(`Script "${script}" configurado`);
    } else {
      log.error(`Script "${script}" não encontrado em package.json`);
      errors++;
    }
  });
  
  // Verificar dependências críticas
  const criticalDeps = ['next', '@prisma/client', 'prisma', 'jsonwebtoken'];
  criticalDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log.success(`Dependência "${dep}": ${pkg.dependencies[dep]}`);
    } else {
      log.error(`Dependência crítica "${dep}" não encontrada`);
      errors++;
    }
  });
  
  // Verificar Node version
  if (pkg.engines && pkg.engines.node) {
    log.success(`Node.js version requirement: ${pkg.engines.node}`);
  } else {
    log.warning('Versão do Node.js não especificada em engines');
    warnings++;
  }
}

function checkNextConfig() {
  log.header('Validando next.config.js');
  
  if (!checkFile('next.config.js', 'Next.js config')) return;
  
  try {
    const nextConfig = require(path.join(process.cwd(), 'next.config.js'));
    
    // Verificar configurações importantes
    if (nextConfig.images) {
      log.success('Otimização de imagens configurada');
    } else {
      log.warning('Configuração de imagens não encontrada');
      warnings++;
    }
    
    if (nextConfig.experimental && nextConfig.experimental.optimizePackageImports) {
      log.success('Package imports optimization habilitada');
    }
    
    if (nextConfig.compiler && nextConfig.compiler.removeConsole) {
      log.success('Remoção de console.log em produção configurada');
    }
    
  } catch (error) {
    log.error(`Erro ao ler next.config.js: ${error.message}`);
    errors++;
  }
}

function checkVercelConfig() {
  log.header('Validando vercel.json');
  
  if (!checkFile('vercel.json', 'Vercel config')) return;
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // Verificar configurações importantes
    if (vercelConfig.build && vercelConfig.build.env && vercelConfig.build.env.NODE_OPTIONS) {
      log.success(`Node options configurado: ${vercelConfig.build.env.NODE_OPTIONS}`);
    } else {
      log.warning('NODE_OPTIONS não configurado para builds grandes');
      warnings++;
    }
    
    if (vercelConfig.functions) {
      log.success('Configurações de functions encontradas');
      
      // Verificar timeouts
      Object.entries(vercelConfig.functions).forEach(([pattern, config]) => {
        if (config.maxDuration) {
          log.success(`Timeout configurado para ${pattern}: ${config.maxDuration}s`);
        }
      });
    }
    
    if (vercelConfig.crons && vercelConfig.crons.length > 0) {
      log.success(`${vercelConfig.crons.length} cron job(s) configurado(s)`);
    } else {
      log.warning('Nenhum cron job configurado (reset de créditos pode não funcionar)');
      warnings++;
    }
    
  } catch (error) {
    log.error(`Erro ao ler vercel.json: ${error.message}`);
    errors++;
  }
}

function checkPrismaSchema() {
  log.header('Validando Prisma Schema');
  
  if (!checkFile('prisma/schema.prisma', 'Prisma schema')) return;
  
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  
  // Verificar provider
  if (schema.includes('provider = "postgresql"')) {
    log.success('PostgreSQL configurado como provider');
  } else if (schema.includes('provider = "sqlite"')) {
    log.warning('SQLite detectado - certifique-se de usar PostgreSQL em produção');
    warnings++;
  }
  
  // Verificar modelos essenciais
  const requiredModels = ['User', 'Analysis'];
  requiredModels.forEach(model => {
    if (schema.includes(`model ${model}`)) {
      log.success(`Modelo "${model}" encontrado`);
    } else {
      log.error(`Modelo "${model}" não encontrado no schema`);
      errors++;
    }
  });
}

function checkEnvironmentVariables() {
  log.header('Validando Variáveis de Ambiente');
  
  // Carregar .env.local se existir
  if (fs.existsSync('.env.local')) {
    log.info('Arquivo .env.local encontrado (desenvolvimento)');
  }
  
  log.info('Verificando variáveis obrigatórias para produção:');
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (process.env[envVar]) {
      log.success(`${envVar}: Configurada`);
    } else {
      log.error(`${envVar}: NÃO CONFIGURADA (OBRIGATÓRIA)`);
      errors++;
    }
  });
  
  log.info('\nVerificando variáveis recomendadas:');
  
  RECOMMENDED_ENV_VARS.forEach(envVar => {
    if (process.env[envVar]) {
      log.success(`${envVar}: Configurada`);
    } else {
      log.warning(`${envVar}: Não configurada (recomendada)`);
      warnings++;
    }
  });
  
  // Validar formato de URLs
  if (process.env.NEXT_PUBLIC_APP_URL) {
    if (process.env.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
      log.success('NEXT_PUBLIC_APP_URL usa HTTPS');
    } else {
      log.error('NEXT_PUBLIC_APP_URL deve usar HTTPS em produção');
      errors++;
    }
  }
  
  // Validar DATABASE_URL format
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('postgresql://')) {
      log.success('DATABASE_URL usa PostgreSQL');
    } else {
      log.warning('DATABASE_URL não parece ser PostgreSQL');
      warnings++;
    }
  }
  
  // Validar JWT secrets length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log.error('JWT_SECRET deve ter pelo menos 32 caracteres');
    errors++;
  }
}

function checkMiddleware() {
  log.header('Validando Middleware');
  
  if (!checkFile('middleware.ts', 'Middleware')) return;
  
  const middleware = fs.readFileSync('middleware.ts', 'utf8');
  
  if (middleware.includes('protectedRoutes')) {
    log.success('Rotas protegidas configuradas');
  }
  
  if (middleware.includes('verifyAccessTokenEdge')) {
    log.success('Verificação de token edge configurada');
  }
  
  if (middleware.includes('matcher')) {
    log.success('Matcher de rotas configurado');
  }
}

function checkBuildFiles() {
  log.header('Verificando Arquivos de Build');
  
  // Verificar se não há build anterior
  if (fs.existsSync('.next')) {
    log.warning('Diretório .next existe - considere limpar antes do deploy');
    warnings++;
  }
  
  // Verificar gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const requiredIgnores = ['.env', '.env.local', '.next', 'node_modules'];
    
    requiredIgnores.forEach(item => {
      if (gitignore.includes(item)) {
        log.success(`${item} está no .gitignore`);
      } else {
        log.error(`${item} deve estar no .gitignore`);
        errors++;
      }
    });
  } else {
    log.error('.gitignore não encontrado');
    errors++;
  }
}

function generateSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}📊 RESUMO DA VALIDAÇÃO${colors.reset}`);
  console.log('='.repeat(60));
  
  if (errors === 0) {
    log.success('Nenhum erro crítico encontrado!');
  } else {
    log.error(`${errors} erro(s) crítico(s) encontrado(s)`);
  }
  
  if (warnings === 0) {
    log.success('Nenhum aviso encontrado!');
  } else {
    log.warning(`${warnings} aviso(s) encontrado(s)`);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  
  if (errors > 0) {
    console.log('1. Corrija todos os erros críticos listados acima');
    console.log('2. Execute este script novamente');
    console.log('3. Só então faça o deploy');
  } else {
    console.log('1. Configure todas as variáveis no Vercel Dashboard');
    console.log('2. Execute: git push origin main');
    console.log('3. Monitore o deploy no Vercel Dashboard');
  }
  
  if (warnings > 0) {
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('- Considere resolver os avisos para melhor experiência');
    console.log('- Configure todas as variáveis recomendadas');
  }
  
  console.log(`\n📖 Guia completo: VERCEL_ENV_SETUP.md`);
  
  return errors === 0;
}

// Executar todas as validações
function main() {
  console.log(`${colors.bold}${colors.blue}🚀 VALIDAÇÃO PRÉ-DEPLOY - TRUECHECKIA${colors.reset}`);
  console.log('Verificando se o projeto está pronto para deploy na Vercel...\n');
  
  checkPackageJson();
  checkNextConfig();
  checkVercelConfig();
  checkPrismaSchema();
  checkEnvironmentVariables();
  checkMiddleware();
  checkBuildFiles();
  
  const success = generateSummary();
  
  process.exit(success ? 0 : 1);
}

main();