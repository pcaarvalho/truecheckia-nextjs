#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🚀 Starting test user creation...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });

    if (existingUser) {
      console.log('⚠️  User with email test@example.com already exists');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Name:', existingUser.name);
      console.log('📦 Plan:', existingUser.plan);
      console.log('💰 Credits:', existingUser.credits);
      console.log('🆔 ID:', existingUser.id);
      return;
    }

    // Hash password with bcryptjs
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Test123!', saltRounds);

    // Create test user with specified credentials
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        plan: 'FREE',
        credits: 10,
        emailVerified: true, // Set to true for testing purposes
        role: 'USER'
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password: Test123!');
    console.log('👤 Name:', testUser.name);
    console.log('📦 Plan:', testUser.plan);
    console.log('💰 Credits:', testUser.credits);
    console.log('🆔 ID:', testUser.id);
    console.log('📅 Created at:', testUser.createdAt.toISOString());
    console.log('');
    console.log('🎉 You can now login with:');
    console.log('   Email: test@example.com');
    console.log('   Password: Test123!');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      console.error('💥 Unique constraint violation - user already exists');
    } else if (error.code === 'P1001') {
      console.error('💥 Database connection error - check your DATABASE_URL');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUser();