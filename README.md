# Gemini API — Hacktiv8 Maju Bareng AI

A hands-on learning project from the **Hacktiv8 Maju Bareng AI** program (supported by Google.org & Asian Development Bank), implementing Google Gemini AI across three progressive sessions — from API fundamentals to a full-stack interactive chatbot.

---

## Project Structure

```
gemini-api/
├── session-1/                     # Session 1 — Documentation
│   └── introduction-of-ai.md     # AI concepts, ethics, prompt engineering notes
│
├── session-2/                     # Session 2 — Multimodal REST API
│   ├── index.js                   # Express server with 4 Gemini endpoints
│   ├── package.json
│   ├── .env                       # API key (not committed)
│   └── .env.example
│
└── session-3/                     # Session 3 — Full-Stack AI Chatbot
    ├── index.js                   # Express server with chat endpoint
    ├── package.json
    ├── .env                       # API key (not committed)
    ├── .env.example
    └── public/
        ├── index.html             # Chat UI
        ├── style.css              # Modern Gemini-inspired design
        └── script.js             # Frontend logic with conversation history
```

---

## Session 1 — Introduction to AI

**No server.** Documentation only.

Covers the foundational concepts from the Hacktiv8 session:

- AI → ML → Deep Learning → Generative AI hierarchy
- LLMs and how they work
- AI Ethics (Transparency, Fairness, Accountability, Privacy, Security)
- Prompt Engineering techniques (Length Control, Style Control, Audience Control, Scenario-Based, Subtask Breakdown)
- AI productivity tools: Gemini Canvas, V0.dev, Gemini Code Assist, GitHub Copilot, NotebookLM

📄 See [`session-1/introduction-of-ai.md`](./session-1/introduction-of-ai.md)

---

## Session 2 — Multimodal REST API

A REST API that accepts text, images, documents, and audio as input and returns AI-generated responses.

**Tech stack:** Node.js (ESM) · Express.js v5 · `@google/genai` · Multer · dotenv

### Setup

```bash
cd session-2
npm install
cp .env.example .env   # then add your GEMINI_API_KEY
node index.js
```

Server runs on `http://localhost:3000`.

### Endpoints

#### `POST /generate-text`
Generate text from a prompt.

```json
// Body (JSON)
{ "prompt": "Jelaskan apa itu machine learning." }

// Response
{ "result": "..." }
```

---

#### `POST /generate-from-image`
Analyze or describe an image.

```
// Body (multipart/form-data)
image   → image file
prompt  → "What is in this image?"
```

```json
{ "result": "..." }
```

---

#### `POST /generate-from-document`
Summarize or query a document (PDF, etc.).

```
// Body (multipart/form-data)
document → document file

// Query param (optional)
?prompt=Tolong buatkan ringkasan dari dokumen ini.
```

```json
{ "result": "..." }
```

---

#### `POST /generate-from-audio`
Transcribe or analyze an audio recording.

```
// Body (multipart/form-data)
audio → audio file

// Query param (optional)
?prompt=Tolong buatkan transkrip dari rekaman berikut.
```

```json
{ "result": "..." }
```

---

## Session 3 — Full-Stack AI Chatbot

An interactive chatbot with a built-in web UI. Supports multi-turn conversation — the full chat history is sent with every request so the AI maintains context.

**Tech stack:** Node.js (ESM) · Express.js v5 · `@google/genai` · CORS · dotenv · Vanilla JS frontend

### Setup

```bash
cd session-3
npm install
cp .env.example .env   # then add your GEMINI_API_KEY
node index.js
```

Open `http://localhost:3000` — the frontend is served directly by Express.

### How it works

```
Browser (public/)
  └── user types message
  └── conversation[] array is updated
  └── POST /api/chat  →  { prompt: [{ role, text }, ...] }
        ↓
  Express (index.js)
  └── transforms [{ role, text }] → [{ role, parts: [{ text }] }]  (Gemini format)
  └── calls genAI.models.generateContent with full conversation history
  └── returns { result: "..." }
        ↓
  Browser
  └── appends AI response to chat UI
  └── saves to conversation[] for next turn
```

### Endpoint

#### `POST /api/chat`

```json
// Body (JSON)
{
  "prompt": [
    { "role": "user",  "text": "Halo, siapa kamu?" },
    { "role": "model", "text": "Halo! Saya Gemini AI..." },
    { "role": "user",  "text": "Bisa bantu saya belajar coding?" }
  ]
}

// Response
{ "result": "Tentu saja! ..." }
```

**Model config:**
- Model: `gemini-2.0-flash`
- Temperature: `0.9`
- System instruction: responds only in casual Indonesian

---

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it into the `.env` file of the session you want to run:

```env
GEMINI_API_KEY=your_api_key_here
```

> The free tier has rate limits. If you hit a `429` quota error, wait ~30 seconds or generate a new key.

---

## Running Both Sessions Simultaneously

Sessions 2 and 3 both default to port `3000`. To run them side by side, set a different port in `.env`:

```env
# session-2/.env
PORT=3001

# session-3/.env
PORT=3000
```
