#!/usr/bin/env node

/**
 * SCRIPT DE CORREÇÃO TOTAL EM PRODUÇÃO
 * Resolve TODOS os problemas identificados
 */

const { PrismaClient } = require('@prisma/client')

async function fixEverything() {
  console.log('🚀 INICIANDO CORREÇÃO TOTAL EM PRODUÇÃO...\n')
  
  // Use a URL de produção diretamente
  const prodDatabaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_PROD
  
  if (!prodDatabaseUrl || prodDatabaseUrl.includes('file:')) {
    console.error('❌ DATABASE_URL de produção não configurada!')
    console.log('Configure: export DATABASE_URL="postgresql://..."')
    process.exit(1)
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: prodDatabaseUrl
      }
    }
  })

  try {
    console.log('📊 Conectando ao banco de produção...')
    await prisma.$connect()
    console.log('✅ Conectado com sucesso!\n')

    // 1. CORRIGIR CRÉDITOS DOS USUÁRIOS
    console.log('🔧 1. CORRIGINDO CRÉDITOS DOS USUÁRIOS...')
    
    // Buscar todos os usuários FREE com 0 créditos
    const usersWithZeroCredits = await prisma.user.findMany({
      where: {
        plan: 'FREE',
        credits: { lte: 0 }
      },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true
      }
    })
    
    console.log(`📌 Encontrados ${usersWithZeroCredits.length} usuários com 0 créditos`)
    
    if (usersWithZeroCredits.length > 0) {
      // Atualizar todos de uma vez
      const updateResult = await prisma.user.updateMany({
        where: {
          plan: 'FREE',
          credits: { lte: 0 }
        },
        data: {
          credits: 10,
          creditsResetAt: new Date()
        }
      })
      
      console.log(`✅ ${updateResult.count} usuários atualizados com 10 créditos!`)
      
      // Listar os usuários corrigidos
      console.log('\n📋 Usuários corrigidos:')
      for (const user of usersWithZeroCredits) {
        console.log(`   - ${user.email} (criado em ${user.createdAt.toLocaleDateString()})`)
      }
    }

    // 2. VERIFICAR CONFIGURAÇÃO DE PLANOS
    console.log('\n🔧 2. VERIFICANDO CONFIGURAÇÃO DE PLANOS...')
    
    const planStats = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
      _min: { credits: true },
      _max: { credits: true },
      _avg: { credits: true }
    })
    
    console.log('📊 Estatísticas por plano:')
    for (const stat of planStats) {
      console.log(`   ${stat.plan}: ${stat._count} usuários`)
      console.log(`   └─ Créditos: Min ${stat._min.credits}, Max ${stat._max.credits}, Média ${Math.round(stat._avg.credits)}`)
    }

    // 3. VERIFICAR USUÁRIOS RECENTES (ÚLTIMAS 24H)
    console.log('\n🔧 3. VERIFICANDO USUÁRIOS RECENTES...')
    
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        credits: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📌 ${recentUsers.length} usuários criados nas últimas 24h:`)
    for (const user of recentUsers) {
      const status = user.credits > 0 ? '✅' : '❌'
      console.log(`   ${status} ${user.email} - ${user.credits} créditos - Verificado: ${user.emailVerified}`)
    }

    // 4. CORRIGIR USUÁRIOS ESPECÍFICOS DE TESTE
    console.log('\n🔧 4. CORRIGINDO USUÁRIOS DE TESTE...')
    
    const testEmails = [
      'test@example.com',
      'testnew@example.com', 
      'testfixed@example.com',
      'testcredits@example.com'
    ]
    
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (user) {
        await prisma.user.update({
          where: { email },
          data: {
            credits: 10,
            emailVerified: true,
            creditsResetAt: new Date()
          }
        })
        console.log(`   ✅ ${email} atualizado com 10 créditos e email verificado`)
      }
    }

    // 5. VERIFICAR SUBSCRIPTIONS
    console.log('\n🔧 5. VERIFICANDO SUBSCRIPTIONS...')
    
    const subscriptions = await prisma.subscription.count()
    console.log(`📌 Total de subscriptions: ${subscriptions}`)
    
    if (subscriptions > 0) {
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active'
        },
        include: {
          user: {
            select: {
              email: true,
              plan: true,
              credits: true
            }
          }
        }
      })
      
      console.log(`   ✅ ${activeSubscriptions.length} subscriptions ativas`)
      for (const sub of activeSubscriptions) {
        console.log(`   └─ ${sub.user.email} (${sub.user.plan}) - ${sub.user.credits} créditos`)
      }
    }

    // 6. LIMPAR TOKENS EXPIRADOS
    console.log('\n🔧 6. LIMPANDO TOKENS EXPIRADOS...')
    
    const cleanupResult = await prisma.user.updateMany({
      where: {
        emailVerificationExpires: {
          lt: new Date()
        }
      },
      data: {
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })
    
    console.log(`   ✅ ${cleanupResult.count} tokens de verificação limpos`)

    // 7. RELATÓRIO FINAL
    console.log('\n' + '='.repeat(60))
    console.log('📊 RELATÓRIO FINAL:')
    console.log('='.repeat(60))
    
    const finalStats = await prisma.user.aggregate({
      _count: true,
      _avg: { credits: true }
    })
    
    const zeroCreditsCount = await prisma.user.count({
      where: {
        credits: 0
      }
    })
    
    console.log(`✅ Total de usuários: ${finalStats._count}`)
    console.log(`✅ Média de créditos: ${Math.round(finalStats._avg.credits)}`)
    console.log(`${zeroCreditsCount === 0 ? '✅' : '❌'} Usuários com 0 créditos: ${zeroCreditsCount}`)
    
    if (zeroCreditsCount === 0) {
      console.log('\n🎉 TODOS OS PROBLEMAS DE CRÉDITOS FORAM RESOLVIDOS!')
    } else {
      console.log('\n⚠️  Ainda existem usuários com 0 créditos. Execute o script novamente.')
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Conexão com banco encerrada.')
  }
}

// Executar
fixEverything().catch(console.error)