# Gemini API

A REST API built with Express.js that integrates Google Gemini AI to process text, images, documents, and audio using the `gemini-2.0-flash` model.

## Features

- **Text generation** — generate AI responses from a text prompt
- **Image understanding** — analyze or describe an uploaded image with an optional prompt
- **Document summarization** — extract insights or summaries from uploaded documents (PDF, etc.)
- **Audio transcription** — transcribe or analyze uploaded audio recordings

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express.js v5
- **AI**: Google Gemini (`@google/genai`) — model `gemini-2.0-flash`
- **File upload**: Multer
- **Config**: dotenv

## Getting Started

### 1. Clone and install

```bash
cd session
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

> Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the server

```bash
node index.js
```

The server starts on `http://localhost:3000` (or the port set in `PORT` env var).

## API Endpoints

### `POST /generate-text`

Generate text from a prompt.

**Body** (JSON):
```json
{ "prompt": "Explain quantum computing in simple terms." }
```

**Response**:
```json
{ "result": "..." }
```

---

### `POST /generate-from-image`

Analyze or describe an image.

**Body** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| `image` | file | Image file to analyze |
| `prompt` | string | Question or instruction about the image |

**Response**:
```json
{ "result": "..." }
```

---

### `POST /generate-from-document`

Summarize or query a document.

**Body** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| `document` | file | Document file (e.g., PDF) |

**Query param** (optional):
| Param | Default |
|-------|---------|
| `prompt` | `"Tolong buatkan ringkasan dari dokumen ini."` |

**Response**:
```json
{ "result": "..." }
```

---

### `POST /generate-from-audio`

Transcribe or analyze an audio file.

**Body** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| `audio` | file | Audio file to transcribe |

**Query param** (optional):
| Param | Default |
|-------|---------|
| `prompt` | `"Tolong buatkan transkrip dari rekaman berikut."` |

**Response**:
```json
{ "result": "..." }
```

## Project Structure

```
gemini-api/
└── session/
    ├── index.js          # Express server & all route handlers
    ├── package.json
    ├── .env              # Local environment variables (not committed)
    └── .env.example      # Environment variable template
```
