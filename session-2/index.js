import "dotenv/config";
import express from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer();
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const GEMINI_MODEL = "gemini-2.0-flash";

app.use(express.json());

app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBuffer = req.file.buffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt, type: "text" },
        { inline_data: { mime_type: req.file.mimetype, data: imageBuffer } }
      ]
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error("Error generating content from image:", error);
    res.status(500).json({ error: "Failed to generate content from image" });
  }
});

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
  try {
    const { prompt } = req.query;
    const documentBuffer = req.file.buffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt ?? "Tolong buatkan ringkasan dari dokumen ini.", type: "text" },
        { inline_data: { mime_type: req.file.mimetype, data: documentBuffer } }
      ]
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt } = req.query;
    const audioBuffer = req.file.buffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt ?? "Tolong buatkan transkrip dari rekaman berikut.", type: "text" },
        { inline_data: { mime_type: req.file.mimetype, data: audioBuffer } }
      ]
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});