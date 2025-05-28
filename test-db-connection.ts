import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Check if models are properly initialized by querying them
    console.log('\nChecking User model...');
    const userCount = await prisma.user.count();
    console.log(`✅ User model initialized. Current count: ${userCount}`);
    
    console.log('\nChecking Conversation model...');
    const conversationCount = await prisma.conversation.count();
    console.log(`✅ Conversation model initialized. Current count: ${conversationCount}`);
    
    console.log('\nChecking Message model...');
    const messageCount = await prisma.message.count();
    console.log(`✅ Message model initialized. Current count: ${messageCount}`);
    
    console.log('\n🎉 All models are properly initialized!');
    
  } catch (error) {
    console.error('❌ Database connection or initialization error:');
    console.error(error);
  } finally {
    // Close the connection
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

testConnection();
