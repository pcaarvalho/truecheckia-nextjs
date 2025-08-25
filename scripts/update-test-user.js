const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateTestUser() {
  try {
    // Hash da nova senha "test1234" (8 caracteres)
    const hashedPassword = await bcrypt.hash('test1234', 12)
    
    // Atualizar usuário de teste
    const updatedUser = await prisma.user.update({
      where: {
        email: 'pedro@truecheckia.com'
      },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Usuário de teste atualizado com sucesso!')
    console.log('📧 Email: pedro@truecheckia.com')
    console.log('🔑 Nova senha: test1234')
    console.log('👤 Nome: Pedro Silva')
    console.log('🏆 Plano: ENTERPRISE (créditos ilimitados)')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTestUser()