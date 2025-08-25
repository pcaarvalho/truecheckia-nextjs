#!/usr/bin/env node

/**
 * Script de Validação da Migração PostgreSQL
 * 
 * Valida que a migração do SQLite para PostgreSQL foi bem-sucedida
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateDatabaseConnection() {
  log('🔗 Testando conexão com PostgreSQL...', 'yellow');
  
  try {
    const result = await prisma.$queryRaw`SELECT version() as version, now() as current_time`;
    
    log('✅ Conexão PostgreSQL bem-sucedida!', 'green');
    log(`📊 Versão: ${result[0].version}`, 'cyan');
    log(`⏰ Hora do servidor: ${result[0].current_time}`, 'cyan');
    
    return true;
  } catch (error) {
    log(`❌ Erro na conexão PostgreSQL: ${error.message}`, 'red');
    return false;
  }
}

async function validateDatabaseSchema() {
  log('📋 Validando schema do banco...', 'yellow');
  
  try {
    // Verificar se todas as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    const requiredTables = ['User', 'Analysis', 'Subscription'];
    
    log(`📋 Tabelas encontradas: ${tableNames.join(', ')}`, 'cyan');
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      log(`❌ Tabelas obrigatórias ausentes: ${missingTables.join(', ')}`, 'red');
      return false;
    }
    
    log('✅ Todas as tabelas obrigatórias estão presentes!', 'green');
    
    // Verificar contagem de registros
    const userCount = await prisma.user.count();
    const analysisCount = await prisma.analysis.count();
    const subscriptionCount = await prisma.subscription.count();
    
    log(`📊 Estatísticas:`, 'blue');
    log(`   👥 Usuários: ${userCount}`, 'cyan');
    log(`   📄 Análises: ${analysisCount}`, 'cyan');
    log(`   💳 Assinaturas: ${subscriptionCount}`, 'cyan');
    
    return true;
  } catch (error) {
    log(`❌ Erro validando schema: ${error.message}`, 'red');
    return false;
  }
}

async function validateDatabaseOperations() {
  log('🔧 Testando operações CRUD...', 'yellow');
  
  try {
    // Teste de criação
    const testUser = await prisma.user.create({
      data: {
        email: `test-migration-${Date.now()}@example.com`,
        password: 'test-password-hash',
        name: 'Test Migration User'
      }
    });
    
    log(`✅ CREATE: Usuário de teste criado (ID: ${testUser.id})`, 'green');
    
    // Teste de leitura
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    if (foundUser) {
      log('✅ READ: Usuário encontrado com sucesso', 'green');
    }
    
    // Teste de atualização
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Test User' }
    });
    
    if (updatedUser.name === 'Updated Test User') {
      log('✅ UPDATE: Usuário atualizado com sucesso', 'green');
    }
    
    // Teste de exclusão
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    log('✅ DELETE: Usuário de teste removido com sucesso', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Erro nas operações CRUD: ${error.message}`, 'red');
    return false;
  }
}

async function validateEnvironmentVariables() {
  log('🔧 Validando variáveis de ambiente...', 'yellow');
  
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'DATABASE_URL_PROD'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Variáveis de ambiente ausentes: ${missingVars.join(', ')}`, 'red');
    return false;
  }
  
  // Verificar se as URLs são PostgreSQL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://')) {
    log('❌ DATABASE_URL não é uma URL PostgreSQL válida', 'red');
    return false;
  }
  
  // Verificar se contém as configurações Neon
  if (!dbUrl.includes('neon.tech')) {
    log('❌ DATABASE_URL não aponta para Neon PostgreSQL', 'red');
    return false;
  }
  
  log('✅ Todas as variáveis de ambiente estão configuradas corretamente!', 'green');
  log(`🔗 Dev Database: ${dbUrl.replace(/:[^:]*@/, ':***@')}`, 'cyan');
  
  return true;
}

async function validateMigrationFiles() {
  log('📁 Validando arquivos de migração...', 'yellow');
  
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    log('❌ Diretório de migrações não encontrado', 'red');
    return false;
  }
  
  const migrationFolders = fs.readdirSync(migrationsDir);
  const postgresqlMigration = migrationFolders.find(folder => 
    folder.includes('postgresql') || folder.includes('initial')
  );
  
  if (!postgresqlMigration) {
    log('❌ Migração PostgreSQL não encontrada', 'red');
    return false;
  }
  
  log(`✅ Migração PostgreSQL encontrada: ${postgresqlMigration}`, 'green');
  return true;
}

async function validateHealthEndpoint() {
  log('🩺 Testando endpoint de health check...', 'yellow');
  
  try {
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 10000
    });
    
    if (response.status === 200) {
      const health = response.data.data;
      
      log('✅ Health endpoint respondendo', 'green');
      log(`📊 Status geral: ${health.status}`, 'cyan');
      log(`💾 Database: ${health.services.database.status}`, 'cyan');
      log(`🤖 OpenAI: ${health.services.openai.status}`, 'cyan');
      log(`💭 Cache: ${health.services.cache.status}`, 'cyan');
      
      return health.services.database.status === 'up';
    }
  } catch (error) {
    log(`❌ Erro no health check: ${error.message}`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('💡 Dica: Certifique-se de que o servidor está rodando (npm run dev)', 'yellow');
    }
    
    return false;
  }
}

async function validateBackupDirectory() {
  log('💾 Validando configuração de backup...', 'yellow');
  
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    log('📁 Criando diretório de backups...', 'yellow');
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Verificar se o script de backup existe
  const backupScript = path.join(__dirname, 'backup-db.js');
  if (!fs.existsSync(backupScript)) {
    log('❌ Script de backup não encontrado', 'red');
    return false;
  }
  
  log('✅ Configuração de backup validada!', 'green');
  return true;
}

async function generateMigrationReport() {
  log('📊 Gerando relatório de migração...', 'blue');
  
  const report = {
    migration_date: new Date().toISOString(),
    database_type: 'PostgreSQL (Neon)',
    status: 'SUCCESS',
    environment: process.env.NODE_ENV || 'development',
    database_url: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'),
    validations: {
      connection: false,
      schema: false,
      operations: false,
      environment: false,
      migrations: false,
      health_endpoint: false,
      backup_config: false
    },
    statistics: {},
    recommendations: []
  };
  
  // Executar todas as validações
  report.validations.connection = await validateDatabaseConnection();
  report.validations.schema = await validateDatabaseSchema();
  report.validations.operations = await validateDatabaseOperations();
  report.validations.environment = await validateEnvironmentVariables();
  report.validations.migrations = await validateMigrationFiles();
  report.validations.health_endpoint = await validateHealthEndpoint();
  report.validations.backup_config = await validateBackupDirectory();
  
  // Coletar estatísticas
  try {
    const userCount = await prisma.user.count();
    const analysisCount = await prisma.analysis.count();
    const subscriptionCount = await prisma.subscription.count();
    
    report.statistics = {
      users: userCount,
      analyses: analysisCount,
      subscriptions: subscriptionCount
    };
  } catch (error) {
    log(`⚠️ Não foi possível coletar estatísticas: ${error.message}`, 'yellow');
  }
  
  // Verificar se todas as validações passaram
  const allValidationsPassed = Object.values(report.validations).every(Boolean);
  
  if (!allValidationsPassed) {
    report.status = 'PARTIAL_SUCCESS';
    report.recommendations.push('Algumas validações falharam - verificar logs acima');
  }
  
  // Adicionar recomendações
  if (!report.validations.health_endpoint) {
    report.recommendations.push('Corrigir endpoint de health check para monitoramento adequado');
  }
  
  if (process.env.NODE_ENV === 'development') {
    report.recommendations.push('Testar em ambiente de produção antes do deploy');
    report.recommendations.push('Configurar monitoramento e alertas para produção');
  }
  
  // Salvar relatório
  const reportPath = path.join(__dirname, '../migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('', 'reset');
  log('📊 RELATÓRIO DE MIGRAÇÃO', 'blue');
  log('='.repeat(50), 'blue');
  log(`📅 Data: ${report.migration_date}`, 'cyan');
  log(`💾 Banco: ${report.database_type}`, 'cyan');
  log(`🎯 Status: ${report.status}`, report.status === 'SUCCESS' ? 'green' : 'yellow');
  log('', 'reset');
  
  log('✅ VALIDAÇÕES:', 'green');
  Object.entries(report.validations).forEach(([key, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${key.replace(/_/g, ' ').toUpperCase()}`, color);
  });
  
  if (Object.keys(report.statistics).length > 0) {
    log('', 'reset');
    log('📊 ESTATÍSTICAS:', 'blue');
    Object.entries(report.statistics).forEach(([key, value]) => {
      log(`📈 ${key.toUpperCase()}: ${value}`, 'cyan');
    });
  }
  
  if (report.recommendations.length > 0) {
    log('', 'reset');
    log('💡 RECOMENDAÇÕES:', 'yellow');
    report.recommendations.forEach((rec, index) => {
      log(`${index + 1}. ${rec}`, 'yellow');
    });
  }
  
  log('', 'reset');
  log(`📄 Relatório salvo em: ${reportPath}`, 'magenta');
  log('', 'reset');
  
  return allValidationsPassed;
}

async function main() {
  try {
    log('🚀 VALIDAÇÃO DA MIGRAÇÃO POSTGRESQL NEON', 'blue');
    log('='.repeat(50), 'blue');
    log('', 'reset');
    
    const success = await generateMigrationReport();
    
    if (success) {
      log('🎉 MIGRAÇÃO COMPLETADA COM SUCESSO!', 'green');
      log('', 'reset');
      log('Próximos passos:', 'yellow');
      log('1. Testar todas as funcionalidades da aplicação', 'cyan');
      log('2. Configurar monitoramento em produção', 'cyan');
      log('3. Configurar backups automáticos', 'cyan');
      log('4. Documentar a nova configuração', 'cyan');
    } else {
      log('⚠️ MIGRAÇÃO COMPLETADA COM PROBLEMAS', 'yellow');
      log('Verificar logs acima e corrigir as validações que falharam', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Erro durante validação: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateDatabaseConnection,
  validateDatabaseSchema,
  validateDatabaseOperations,
  validateEnvironmentVariables,
  validateMigrationFiles,
  validateHealthEndpoint,
  validateBackupDirectory,
  generateMigrationReport
};