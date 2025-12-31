import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import fs from "fs";
import path from "path";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set in environment variables.", { status: 500 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // Read the rulebook content
    const rulebookPath = path.join(process.cwd(), "public", "rulebook.md");
    let rulebookContent = "";

    try {
      rulebookContent = fs.readFileSync(rulebookPath, "utf-8");
    } catch (err) {
      console.error("Error reading rulebook:", err);
      return new Response("Failed to read rulebook.md from server.", { status: 500 });
    }

    const systemPrompt = `
You are a Cyberpunk TRPG Rule Expert (ΨI/ONET Terminal).
Your primary function is to answer queries based STRICTLY on the provided rulebook content below.
If the answer is not in the rulebook, state that the information is missing from the database.
Adopt a "Cyberpunk Terminal" persona: concise, somewhat robotic but helpful, using terms like "Accessing...", "Query resolved", "Data not found".

--- RULEBOOK START ---
${rulebookContent}
--- RULEBOOK END ---
`;

//Do not change model from gemini-3-flash-preview
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
