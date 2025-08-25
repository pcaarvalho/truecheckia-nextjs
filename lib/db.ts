import { PrismaClient } from '@prisma/client'

// Configuração global do Prisma Client com otimizações para PostgreSQL
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    // Configurações de logging para debugging
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    
    // Configurações específicas para PostgreSQL
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Em desenvolvimento, evita múltiplas instâncias do Prisma Client
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Configurações específicas para PostgreSQL Neon
export const dbConfig = {
  // Connection pool settings
  maxConnections: process.env.NODE_ENV === 'production' ? 20 : 10,
  acquireTimeout: 60000, // 60 segundos
  createTimeout: 30000,   // 30 segundos
  
  // Query optimization
  queryTimeout: 10000,    // 10 segundos
  
  // Configurações específicas para Neon
  neonConfig: {
    serverless: true,
    pooling: true,
    poolSize: process.env.NODE_ENV === 'production' ? 20 : 5,
  }
}

// Função para verificar saúde da conexão
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now()
    
    // Teste simples de conectividade
    await prisma.$queryRaw`SELECT 1 as test`
    
    const latency = Date.now() - start
    
    return {
      status: 'healthy',
      latency
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Função para obter estatísticas de conexão
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      analysisCount,
      subscriptionCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.analysis.count(),
      prisma.subscription.count()
    ])
    
    return {
      users: userCount,
      analyses: analysisCount,
      subscriptions: subscriptionCount,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    throw error
  }
}

// Configuração de timeouts para queries específicas
export const queryTimeouts = {
  fast: 2000,    // 2 segundos - para queries simples
  medium: 5000,  // 5 segundos - para queries médias
  slow: 10000,   // 10 segundos - para queries complexas
  report: 30000  // 30 segundos - para relatórios
}

// Helper para executar queries com timeout personalizado
export async function executeWithTimeout<T>(
  query: Promise<T>,
  timeout: number = queryTimeouts.medium,
  errorMessage: string = 'Query timeout'
): Promise<T> {
  return Promise.race([
    query,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeout)
    )
  ])
}

// Função para graceful shutdown
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('Database connection closed gracefully')
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}

// Event listeners para graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', disconnectDatabase)
  process.on('SIGTERM', disconnectDatabase)
  process.on('beforeExit', disconnectDatabase)
}

export default prisma