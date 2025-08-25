#!/usr/bin/env node

/**
 * Script de Backup e Restore para PostgreSQL Neon
 * 
 * Uso:
 * - Backup: node scripts/backup-db.js backup
 * - Restore: node scripts/backup-db.js restore <backup-file>
 * - List: node scripts/backup-db.js list
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const execAsync = promisify(exec);

// Configurações
const BACKUP_DIR = path.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_PROD = process.env.DATABASE_URL_PROD;

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

function formatDate(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`📁 Diretório de backup criado: ${BACKUP_DIR}`, 'green');
  }
}

async function createBackup(env = 'dev') {
  try {
    ensureBackupDir();
    
    const timestamp = formatDate();
    const backupFile = path.join(BACKUP_DIR, `backup_${env}_${timestamp}.sql`);
    const dbUrl = env === 'prod' ? DATABASE_URL_PROD : DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error(`URL do banco para ambiente '${env}' não encontrada`);
    }
    
    log(`🔄 Iniciando backup do banco ${env}...`, 'yellow');
    log(`📊 URL: ${dbUrl.replace(/:[^:]*@/, ':***@')}`, 'cyan');
    
    // Extrair componentes da URL
    const url = new URL(dbUrl);
    const pgDumpCommand = `PGPASSWORD="${url.password}" pg_dump -h "${url.hostname}" -p "${url.port || 5432}" -U "${url.username}" -d "${url.pathname.slice(1)}" --no-owner --no-privileges --clean --if-exists`;
    
    const { stdout, stderr } = await execAsync(`${pgDumpCommand} > "${backupFile}"`);
    
    if (stderr && !stderr.includes('NOTICE')) {
      log(`⚠️  Avisos durante backup: ${stderr}`, 'yellow');
    }
    
    const stats = fs.statSync(backupFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    log(`✅ Backup criado com sucesso!`, 'green');
    log(`📄 Arquivo: ${backupFile}`, 'green');
    log(`📊 Tamanho: ${sizeKB} KB`, 'green');
    
    return backupFile;
    
  } catch (error) {
    log(`❌ Erro durante backup: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreBackup(backupFile, env = 'dev') {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFile}`);
    }
    
    const dbUrl = env === 'prod' ? DATABASE_URL_PROD : DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error(`URL do banco para ambiente '${env}' não encontrada`);
    }
    
    log(`🔄 Iniciando restore do backup...`, 'yellow');
    log(`📁 Arquivo: ${backupFile}`, 'cyan');
    log(`📊 Ambiente: ${env}`, 'cyan');
    
    // Extrair componentes da URL
    const url = new URL(dbUrl);
    const psqlCommand = `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port || 5432}" -U "${url.username}" -d "${url.pathname.slice(1)}" -f "${backupFile}"`;
    
    const { stdout, stderr } = await execAsync(psqlCommand);
    
    if (stderr && !stderr.includes('NOTICE')) {
      log(`⚠️  Avisos durante restore: ${stderr}`, 'yellow');
    }
    
    log(`✅ Restore concluído com sucesso!`, 'green');
    
  } catch (error) {
    log(`❌ Erro durante restore: ${error.message}`, 'red');
    throw error;
  }
}

function listBackups() {
  ensureBackupDir();
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        created: stats.ctime.toLocaleString()
      };
    })
    .sort((a, b) => fs.statSync(b.path).ctime - fs.statSync(a.path).ctime);
  
  if (files.length === 0) {
    log('📝 Nenhum backup encontrado', 'yellow');
    return;
  }
  
  log('📋 Backups disponíveis:', 'blue');
  files.forEach((file, index) => {
    log(`${index + 1}. ${file.name}`, 'cyan');
    log(`   📅 Criado: ${file.created}`, 'cyan');
    log(`   📊 Tamanho: ${file.size}`, 'cyan');
    log('', 'reset');
  });
}

async function cleanOldBackups(keepCount = 10) {
  ensureBackupDir();
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      ctime: fs.statSync(path.join(BACKUP_DIR, file)).ctime
    }))
    .sort((a, b) => b.ctime - a.ctime);
  
  if (files.length <= keepCount) {
    log(`📦 ${files.length} backups encontrados. Nenhuma limpeza necessária.`, 'green');
    return;
  }
  
  const toDelete = files.slice(keepCount);
  
  log(`🧹 Removendo ${toDelete.length} backups antigos...`, 'yellow');
  
  toDelete.forEach(file => {
    fs.unlinkSync(file.path);
    log(`🗑️  Removido: ${file.name}`, 'magenta');
  });
  
  log(`✅ Limpeza concluída. Mantidos ${keepCount} backups mais recentes.`, 'green');
}

async function testConnection(env = 'dev') {
  try {
    const dbUrl = env === 'prod' ? DATABASE_URL_PROD : DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error(`URL do banco para ambiente '${env}' não encontrada`);
    }
    
    log(`🔗 Testando conexão com banco ${env}...`, 'yellow');
    
    const url = new URL(dbUrl);
    const testCommand = `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port || 5432}" -U "${url.username}" -d "${url.pathname.slice(1)}" -c "SELECT version();"`;
    
    const { stdout } = await execAsync(testCommand);
    
    log(`✅ Conexão bem-sucedida!`, 'green');
    log(`📊 Versão: ${stdout.split('\n')[2]?.trim()}`, 'cyan');
    
  } catch (error) {
    log(`❌ Erro na conexão: ${error.message}`, 'red');
    throw error;
  }
}

// CLI
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  try {
    switch (command) {
      case 'backup':
        await createBackup(arg1 || 'dev');
        break;
        
      case 'restore':
        if (!arg1) {
          log('❌ Especifique o arquivo de backup para restore', 'red');
          process.exit(1);
        }
        await restoreBackup(arg1, arg2 || 'dev');
        break;
        
      case 'list':
        listBackups();
        break;
        
      case 'clean':
        await cleanOldBackups(parseInt(arg1) || 10);
        break;
        
      case 'test':
        await testConnection(arg1 || 'dev');
        break;
        
      default:
        log('🔧 Script de Backup PostgreSQL Neon', 'blue');
        log('', 'reset');
        log('Comandos disponíveis:', 'yellow');
        log('  backup [dev|prod]     - Criar backup do banco', 'cyan');
        log('  restore <file> [env]  - Restaurar backup', 'cyan');
        log('  list                  - Listar backups', 'cyan');
        log('  clean [count]         - Limpar backups antigos (padrão: manter 10)', 'cyan');
        log('  test [dev|prod]       - Testar conexão', 'cyan');
        log('', 'reset');
        log('Exemplos:', 'yellow');
        log('  node scripts/backup-db.js backup', 'green');
        log('  node scripts/backup-db.js restore backups/backup_dev_2025-08-21.sql', 'green');
        log('  node scripts/backup-db.js test prod', 'green');
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  cleanOldBackups,
  testConnection
};