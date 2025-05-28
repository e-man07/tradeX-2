"use server";
import { PrismaClient } from "@prisma/client";
import { Message } from "@/hooks/ChatContext";

export const saveChat = async (userId: string, messages: Message[]) => {
  if (!userId || !messages || !Array.isArray(messages)) {
    throw new Error('Invalid parameters: userId and messages array are required');
  }

  const prisma = new PrismaClient();
  try {
    const response = await prisma.chat.create({
      data: {
        userId,
        messages: {
          create: messages.map((message) => ({
            sender: message.sender,
            content: message.content,
            chatId: message.chatId || null,
          })),
        },
      },
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
