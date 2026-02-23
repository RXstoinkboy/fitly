# Fitly Backend

AdonisJS v6 API server for the Fitly virtual try-on app. Replaces the Supabase Edge Function for AI image generation.

## Tech Stack

- **Framework**: AdonisJS v6
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Validation**: VineJS
- **AI**: Google Generative AI (Gemini)

## Features

- `POST /api/generate-image` – Generate a virtual try-on image using Google GenAI
- `GET /health` – Health check endpoint
- API key authentication (optional, via `x-api-key` header)
- Request validation with detailed error messages

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | HTTP server port (default: `3333`) |
| `HOST` | Yes | HTTP server host (default: `0.0.0.0`) |
| `APP_KEY` | Yes | Random 32-byte secret for encryption |
| `LOG_LEVEL` | Yes | `info`, `debug`, `warn`, `error`, etc. |
| `GOOGLE_API_KEY` | Yes | Google GenAI API key |
| `API_KEY` | No | Secret to protect endpoints. Leave empty to disable auth. |

To generate a secure `APP_KEY`:
```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));"
```

### 3. Start the development server

```bash
npm run dev
```

The server starts at `http://localhost:3333` by default.

## API Reference

### `POST /api/generate-image`

Generates a virtual try-on image using Google's Gemini model.

**Headers:**
- `Content-Type: application/json`
- `x-api-key: <API_KEY>` *(required only if `API_KEY` is set in `.env`)*

**Request Body:**
```json
{
  "modelImageBase64": "<base64 string>",
  "mimeType": "image/jpeg",
  "garmentTopImageBase64": "<base64 string>",
  "garmentBottomImageBase64": "<base64 string>",
  "garmentFullBodyImageBase64": "<base64 string>"
}
```

- `modelImageBase64` – **Required**. Base64-encoded photo of the person.
- `mimeType` – Optional. Defaults to `image/jpeg`.
- At least one garment image is required: `garmentTopImageBase64`, `garmentBottomImageBase64`, or `garmentFullBodyImageBase64`.

**Response (200):**
```json
{
  "generatedImageBase64": "<base64 string>",
  "mimeType": "image/jpeg"
}
```

**Error Responses:**
- `400` – Bad request (missing garment images or validation failure)
- `401` – Unauthorized (invalid or missing API key)
- `502` – Google GenAI request failed

### `GET /health`

Returns server health status.

**Response (200):**
```json
{ "status": "ok" }
```

## Frontend Configuration

In the React Native app, set these environment variables (in the root `.env`):

```
EXPO_PUBLIC_API_URL=http://localhost:3333
EXPO_PUBLIC_API_KEY=your_api_key_here
```

For production, replace `localhost:3333` with your deployed server URL.

## Production Build

```bash
npm run build
npm run start
```
