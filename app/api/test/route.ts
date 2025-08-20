import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      data: {
        userCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        name: error.name
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'POST test successful',
      received: body
    })
  } catch (error) {
    console.error('POST test error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        name: error.name
      }
    }, { status: 500 })
  }
}