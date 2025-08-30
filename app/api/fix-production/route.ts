import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Check for admin key
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.CRON_SECRET || 'dev-secret'
  
  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🚀 Starting production fixes...')
    
    // 1. Fix all FREE users with 0 credits
    const fixCreditsResult = await prisma.user.updateMany({
      where: {
        plan: 'FREE',
        OR: [
          { credits: 0 },
          { credits: { lt: 10 } }
        ]
      },
      data: {
        credits: 10,
        creditsResetAt: new Date()
      }
    })
    
    console.log(`✅ Fixed ${fixCreditsResult.count} users with low credits`)
    
    // 2. Verify email for test users
    const testEmails = [
      'test@example.com',
      'testnew@example.com',
      'testfixed@example.com',
      'testcredits@example.com'
    ]
    
    let testUsersFixed = 0
    for (const email of testEmails) {
      try {
        await prisma.user.update({
          where: { email },
          data: {
            credits: 10,
            emailVerified: true,
            creditsResetAt: new Date()
          }
        })
        testUsersFixed++
      } catch (e) {
        // User doesn't exist, skip
      }
    }
    
    // 3. Get current stats
    const stats = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
      _min: { credits: true },
      _max: { credits: true },
      _avg: { credits: true }
    })
    
    // 4. Check for users still with 0 credits
    const zeroCreditsCount = await prisma.user.count({
      where: { credits: 0 }
    })
    
    // 5. Get recent users
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        email: true,
        credits: true,
        plan: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    return NextResponse.json({
      success: true,
      message: 'Production fixes applied successfully',
      results: {
        creditsFixed: fixCreditsResult.count,
        testUsersFixed,
        zeroCreditsRemaining: zeroCreditsCount,
        stats,
        recentUsers
      }
    })
    
  } catch (error) {
    console.error('Error fixing production:', error)
    return NextResponse.json({
      error: 'Failed to apply fixes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Alternative endpoint for specific user fix
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.CRON_SECRET || 'dev-secret'
  
  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { email, credits = 10 } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        credits,
        emailVerified: true,
        creditsResetAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        emailVerified: user.emailVerified
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'  
    }, { status: 500 })
  }
}