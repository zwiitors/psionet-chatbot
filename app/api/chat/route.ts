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
    // In Vercel (and Next.js), process.cwd() is the root of the project.
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt
    // We include the rulebook as system context.
    const systemPrompt = `
You are a Cyberpunk TRPG Rule Expert (ΨI/ONET Terminal).
Your primary function is to answer queries based STRICTLY on the provided rulebook content below.
If the answer is not in the rulebook, state that the information is missing from the database.
Adopt a "Cyberpunk Terminal" persona: concise, somewhat robotic but helpful, using terms like "Accessing...", "Query resolved", "Data not found".

--- RULEBOOK START ---
${rulebookContent}
--- RULEBOOK END ---
`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "SYSTEM ONLINE. RULEBOOK DATA LOADED. READY FOR QUERIES." }],
        },
        // We could map the previous chat history here if needed, but for now we'll keep it simple
        // or just append the current user message.
        // If 'history' is provided from frontend, we could adapt it.
        // For this implementation, we'll just focus on the current query with the rulebook context established.
      ],
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
