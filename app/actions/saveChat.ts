"use server";
import { PrismaClient } from "@prisma/client";
import { Message } from "@/hooks/ChatContext";

export const saveChat = async (userId: string, messages: Message[]) => {
  if (!userId || !messages || !Array.isArray(messages)) {
    throw new Error('Invalid parameters: userId and messages array are required');
  }

  const prisma = new PrismaClient();
  try {
    // Create conversation with messages in a transaction
    const response = await prisma.conversation.create({
      data: {
        title: messages[0]?.content?.substring(0, 100) || "New Conversation",
        userId,
        messages: {
          create: messages.map((message) => ({
            content: message.content,
            senderType: message.sender === 'User' ? 'User' : 'System',
            senderId: message.sender === 'User' ? userId : null,
          }))
        }
      },
      include: {
        messages: true,
        user: true
      }
    });

    if (!response) {
      throw new Error('Failed to create chat');
    }

    return response;
  } catch (err) {
    console.error('Error saving chat:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
};