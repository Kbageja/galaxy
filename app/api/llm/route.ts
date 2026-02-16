import { NextRequest, NextResponse } from "next/server";
import { runLLM } from "@/lib/llm";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { model, systemPrompt, userMessage, images } = body;

    // Validate inputs
    if (!userMessage) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 },
      );
    }

    // Run LLM
    const result = await runLLM({
      model: model || "gemini",
      systemPrompt: systemPrompt || "",
      userMessage,
      images,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
