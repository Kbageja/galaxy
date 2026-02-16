import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "✓" : "✗");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface LLMRequest {
  model: string;
  systemPrompt: string;
  userMessage: string;
  images?: string[]; // Base64 encoded images
}

export interface LLMResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export async function runLLM(request: LLMRequest): Promise<LLMResponse> {
  try {
    // Map model names to Gemini models (with models/ prefix!)
    const modelMap: Record<string, string> = {
      "gpt-4": "models/gemini-2.5-flash",
      "gpt-3.5": "models/gemini-2.5-flash",
      claude: "models/gemini-2.5-flash",
      gemini: "models/gemini-2.5-flash",
    };

    const modelName = modelMap[request.model] || "models/gemini-2.5-flash";
    console.log("Using model:", modelName);
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // Combine system prompt and user message
    const textPrompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.userMessage}`
      : request.userMessage;

    // Prepare parts (text + images)
    const promptParts: any[] = [textPrompt];

    if (request.images && request.images.length > 0) {
      request.images.forEach((imgBase64) => {
        const mimeMatch = imgBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const base64Data = imgBase64.replace(
          /^data:image\/[a-zA-Z]+;base64,/,
          "",
        );

        promptParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      });
    }

    // Generate response
    const result = await model.generateContent(promptParts);
    const response = result.response.text();

    return {
      success: true,
      response,
    };
  } catch (error: any) {
    console.error("LLM execution error:", error);
    
    if (error.status) console.error("Status:", error.status);
    if (error.statusText) console.error("Status Text:", error.statusText);
    if (error.errorDetails) console.error("Error Details:", error.errorDetails);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}