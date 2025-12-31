import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    // Read the rulebook content
    const rulebookPath = path.join(process.cwd(), "public", "rulebook.md");
    let rulebookContent = "";

    try {
      rulebookContent = fs.readFileSync(rulebookPath, "utf-8");
    } catch (err) {
      console.error("Error reading rulebook:", err);
      return NextResponse.json(
        { error: "Failed to read rulebook.md from server." },
        { status: 500 }
      );
    }

    // Construct the prompt
    const systemPrompt = `
You are a Cyberpunk TRPG Rule Expert (ΨI/ONET Terminal).
Your primary function is to answer queries based STRICTLY on the provided rulebook content below.
If the answer is not in the rulebook, state that the information is missing from the database.
Adopt a "Cyberpunk Terminal" persona: concise, somewhat robotic but helpful, using terms like "Accessing...", "Query resolved", "Data not found".

--- RULEBOOK START ---
${rulebookContent}
--- RULEBOOK END ---
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
      systemInstruction: systemPrompt 
    });

    // Map the incoming history to Gemini format
    const mappedHistory = history
      .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: mappedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
