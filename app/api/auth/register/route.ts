import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import NCrypt from "ncrypt-js";
import { v4 as uuidv4} from "uuid";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your_strong_encryption_key";
const ncrypt = new NCrypt(ENCRYPTION_KEY);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, password, pubKey, secretKey } = await request.json();

    // Validate input
    if (!email || !password || !pubKey || !secretKey) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Encrypt the private key of the user using NCrypt
    const encryptedSecretKey = ncrypt.encrypt(secretKey);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        pubKey,
        secretKey: encryptedSecretKey
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("This is the token", token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
