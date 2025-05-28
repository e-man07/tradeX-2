import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Trade-local received payload:", payload);
    
    // Forward to pumpportal.fun
    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, application/octet-stream"
      },
      body: JSON.stringify(payload)
    });

    console.log("Pumpportal response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from pumpportal:", errorText);
      throw new Error(`Failed to create transaction: ${response.status} - ${errorText}`);
    }

    // Get the response as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    console.log("Received array buffer of size:", arrayBuffer.byteLength);

    // Return the binary data with correct headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': arrayBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error("Error in trade-local:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}