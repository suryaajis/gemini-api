import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PERSONA_TRAITS = {
  explorer: "You are adventurous and love recommending off-the-beaten-path destinations. You get excited about hidden gems and unique local experiences that most tourists miss.",
  planner: "You are detail-oriented and organized. You love creating structured itineraries, day-by-day plans, and giving practical logistics tips like transport options and booking timelines.",
  foodie: "You are passionate about culinary culture. You prioritize local food experiences, street food discoveries, cooking classes, and the stories behind traditional dishes.",
};

const STYLE_DESC = {
  budget: "budget-conscious travelers who maximize experiences within tight budgets (hostels, street food, free attractions)",
  comfort: "travelers who balance quality and cost (3-star hotels, local restaurants, mix of paid/free activities)",
  luxury: "travelers seeking premium experiences (5-star resorts, fine dining, private tours, exclusive access)",
};

function buildSystemInstruction(config = {}) {
  const { travelStyle = "comfort", interests = [], language = "id", persona = "explorer" } = config;

  const styleDesc = STYLE_DESC[travelStyle] || STYLE_DESC.comfort;
  const personaTrait = PERSONA_TRAITS[persona] || PERSONA_TRAITS.explorer;
  const interestList = interests.length > 0 ? interests.join(", ") : "general travel";
  const lang = language === "en" ? "English" : "Indonesian (Bahasa Indonesia)";

  return `You are WanderlAI, an enthusiastic and knowledgeable travel companion AI. ${personaTrait}

Your core personality:
- Warm, inspiring, and genuinely passionate about travel
- Deeply knowledgeable about world destinations, cultures, local customs, and history
- Practical: always include actionable tips, realistic cost estimates, and timing advice
- Safety-conscious: mention relevant safety tips and cultural sensitivities when needed

User travel profile:
- Travel Style: ${travelStyle} — catering to ${styleDesc}
- Main Interests: ${interestList}
- Response Language: ${lang}

CRITICAL RULE: Always respond ONLY in ${lang}. Never mix languages.

When recommending destinations or answering travel questions:
1. Be specific — name actual places, not vague suggestions
2. Include practical info: best season to visit, typical costs (in USD or local currency), duration needed
3. Mention 2-3 must-see/do highlights
4. Add one local food recommendation
5. Share one cultural etiquette tip

Format longer responses with clear sections. Use emojis sparingly (1-2 per response max) to add warmth without being overwhelming.`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, config = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required and must not be empty" });
    }

    // Gemini uses role "model" instead of "assistant", and parts array instead of content string
    const contents = messages.map(({ role, content }) => ({
      role: role === "assistant" ? "model" : "user",
      parts: [{ text: content }],
    }));

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.8,
        systemInstruction: buildSystemInstruction(config),
      },
    });

    const result = response.text || "Sorry, I couldn't generate a response.";
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: "Failed to get AI response. Please try again.",
      detail: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const keyPreview = process.env.GEMINI_API_KEY
    ? `${process.env.GEMINI_API_KEY.slice(0, 10)}...`
    : "NOT SET";
  console.log(`WanderlAI server running at http://localhost:${PORT}`);
  console.log(`Gemini API key loaded: ${keyPreview}`);
});
