import { NextRequest, NextResponse } from "next/server";
import { runLLM } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, systemPrompt, userMessage, images } = body;

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: "User message is required" },
        { status: 400 },
      );
    }

    const result = await runLLM({
      model,
      systemPrompt,
      userMessage,
      images,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
