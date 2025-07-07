import { NextRequest, NextResponse } from "next/server";
import prisma from "@/client";
import { getUserId } from "@/utils/api";
// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}

// Get all conversations for a user
export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the request headers
    const userId = req.headers.get("userId");
    console.log("Fetching conversations for userId from headers:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;
    
    // Get userId from request headers
    const userId = req.headers.get("userId");
    console.log("This is the userId from headers:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required in headers" }, { status: 400 });
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Valid title is required" }, { status: 400 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
      },
    });

    console.log(`New conversation created with ID: ${conversation.id}`);

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
