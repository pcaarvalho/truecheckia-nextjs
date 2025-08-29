import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Simple admin auth check via secret key
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fix all FREE plan users with incorrect credits
    const result = await prisma.user.updateMany({
      where: {
        plan: 'FREE',
        OR: [
          { credits: { lt: 10 } },
          { credits: 0 },
        ]
      },
      data: {
        credits: 10
      }
    })

    // Get stats after fix
    const stats = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
      _min: { credits: true },
      _max: { credits: true },
      _avg: { credits: true }
    })

    // Get some examples of fixed users
    const fixedUsers = await prisma.user.findMany({
      where: {
        plan: 'FREE',
        credits: 10
      },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      success: true,
      fixed: result.count,
      stats,
      examples: fixedUsers,
      message: `Fixed credits for ${result.count} FREE plan users`
    })
  } catch (error) {
    console.error('Error fixing credits:', error)
    return NextResponse.json(
      { error: 'Failed to fix credits', details: error },
      { status: 500 }
    )
  }
}