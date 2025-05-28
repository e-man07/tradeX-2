import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import NCrypt from "ncrypt-js";

const prisma = new PrismaClient();
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your_strong_encryption_key";
const ncrypt = new NCrypt(ENCRYPTION_KEY);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, password } = await request.json();
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Decrypt the secretKey
    const decryptedSecretKey = ncrypt.decrypt(user.secretKey);

    // Send pubKey and decrypted secretKey
    return NextResponse.json(
        //Saving the userId with along with other details so that we can use them while saving the instance 
      {
        message: "Login successful",
        pubKey: user.pubKey,
        userId: user.id,
        secretKey: decryptedSecretKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
