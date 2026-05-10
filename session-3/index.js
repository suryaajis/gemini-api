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
const GEMINI_MODEL = "gemini-2.0-flash";

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Transform [{ role, text }] → [{ role, parts: [{ text }] }] for Gemini API
    const contents = Array.isArray(prompt)
      ? prompt.map(({ role, text }) => ({ role, parts: [{ text }] }))
      : prompt;

    const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          temperature: 0.9,
          systemInstruction: "Jawab hanya dengan bahasa Indonesia, dan buatlah jawaban yang santai dan mudah dipahami."
        }
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});