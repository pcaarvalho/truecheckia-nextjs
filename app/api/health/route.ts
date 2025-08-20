import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { withErrorHandler, handleOptions } from '../../lib/middleware'

async function healthCheckHandler(): Promise<NextResponse> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TrueCheck-AI Next.js API',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'TrueCheck-AI Next.js API',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: 'Database connection failed',
    }, { status: 503 })
  }
}

// Export handlers for different HTTP methods
export const GET = withErrorHandler(healthCheckHandler)
export const OPTIONS = handleOptions