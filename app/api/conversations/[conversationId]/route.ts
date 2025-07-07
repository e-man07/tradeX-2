import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}

// Get messages for a specific conversation
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = req.headers.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    // Validate conversationId format (userId can be a Solana public key)
    if (!isValidObjectId(conversationId)) {
      return NextResponse.json({ 
        error: "Invalid conversationId format. Must be a valid MongoDB ObjectId (24 character hex string)" 
      }, { status: 400 });
    }
    
    // Note: We're not validating userId format as it can be a Solana public key

    // Verify user has access to this conversation
    const participant = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Finding the messages array of the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      conversationId,
      messages: messages,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Send a message in a conversation
export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = req.headers.get("userId");
    const body = await req.json();
    const { content } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: "Content must be a non-empty array of messages" }, { status: 400 });
    }

    // Validate message format
    for (const msg of content) {
      if (!msg.content || typeof msg.content !== 'string') {
        return NextResponse.json({ error: "Each message must have a content field of type string" }, { status: 400 });
      }
      if (!msg.senderType || !['User', 'System'].includes(msg.senderType)) {
        return NextResponse.json({ error: "Each message must have a valid senderType (User or System)" }, { status: 400 });
      }
    }

    // Clean the conversationId if needed (only if your route structure requires it)
    const cleanConversationId = conversationId.replace("conversationId=", "");

    console.log("Incoming request to send message:", {
      conversationId: cleanConversationId,
      contentCount: content.length,
      userId,
    });

    // Verify user has access to this conversation
    const participant = await prisma.conversation.findFirst({
      where: {
        id: cleanConversationId,
        userId: userId,
      },
    });

    if (!participant) {
      console.warn(`Access denied for userId: ${userId} to conversationId: ${conversationId}`);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate conversation exists (this check might be redundant after the previous check)
    const conversation = await prisma.conversation.findUnique({
      where: { id: cleanConversationId },
    });

    if (!conversation) {
      console.warn(`Conversation not found for conversationId: ${conversationId}`);
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Create messages in database
    const createResult = await prisma.message.createMany({
      data: content.map(msg => ({
        content: msg.content as string,
        senderId: userId,
        conversationId: cleanConversationId,
        senderType: msg.senderType,
      }))
    });

    console.log("Messages created successfully:", createResult);

    // Fetch the newly created messages to return in response
    const createdMessages = await prisma.message.findMany({
      where: {
        conversationId: cleanConversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: content.length,
    });

    // Update conversation's updatedAt timestamp
    const update = await prisma.conversation.update({
      where: { id: cleanConversationId },
      data: { updatedAt: new Date() },
    });

    if (!update) {
      console.warn(`Failed to update conversation for conversationId: ${conversationId}`);
      // Continue anyway since messages were created successfully
    }

    return NextResponse.json({ messages: createdMessages }, { status: 201 });
  } catch (error) {
    // Log detailed error information
    console.error("Error sending message:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error({
      message: "Failed to send message",
      error: errorMessage,
      stack: errorStack
    });
    
    return NextResponse.json({ error: "Failed to send message", details: errorMessage }, { status: 500 });
  }
}

// Update conversation title
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = req.headers.get("userId");
    const body = await req.json();
    const { title } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    // Validate userId format
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ 
        error: "Invalid userId format. Must be a valid MongoDB ObjectId (24 character hex string)" 
      }, { status: 400 });
    }

    // Clean the conversationId if needed
    const cleanConversationId = conversationId.replace("conversationId=", "");

    // Verify user has access to this conversation
    const participant = await prisma.conversation.findFirst({
      where: {
        id: cleanConversationId,
        userId: userId,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: cleanConversationId },
      data: { title },
    });

    return NextResponse.json({ updatedConversation: updatedConversation }, { status: 200 });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}

// Delete a conversation
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = req.headers.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    // Clean the conversationId if needed
    const cleanConversationId = conversationId.replace("conversationId=", "");

    // Verify user has access to this conversation
    const participant = await prisma.user.findFirst({
      where: {
        id: userId,
        conversations: {
          some: {
            id: new ObjectId(conversationId).toString(),
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the conversation and all related messages
    await prisma.conversation.delete({
      where: { id: cleanConversationId },
    });

    return NextResponse.json({ message: "Conversation deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}