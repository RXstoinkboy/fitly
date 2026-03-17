# @virtual-try-on/backend

AdonisJS v6 API server for the Fitly virtual try-on app.

## Tech Stack

- **Framework**: AdonisJS v6
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Database**: PostgreSQL via Lucid ORM
- **Auth**: AdonisJS Auth with access tokens
- **Validation**: VineJS

## Features

- `POST /api/v1/auth/anonymous` – Create an anonymous user and receive an access token
- `POST /api/v1/images/generate` – Generate a virtual try-on image using Google GenAI
- `GET /api/v1/health` – Health check endpoint
- Optional API key authentication via `x-api-key` header
- CORS enabled for all origins

## Getting Started

### 1. Install dependencies

```bash
cd apps/backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

| Variable                | Required | Description                                               |
| ----------------------- | -------- | --------------------------------------------------------- |
| `NODE_ENV`              | Yes      | `development`, `production`, or `test`                    |
| `PORT`                  | Yes      | HTTP server port (default: `3333`)                        |
| `HOST`                  | Yes      | HTTP server host (default: `0.0.0.0`)                     |
| `APP_KEY`               | Yes      | Random 32-byte hex secret for encryption                  |
| `LOG_LEVEL`             | Yes      | `info`, `debug`, `warn`, `error`, etc.                    |
| `GOOGLE_API_KEY`        | Yes      | Google GenAI API key                                      |
| `GOOGLE_GENAI_ENDPOINT` | No       | Override the default Gemini model endpoint                |
| `API_KEY`               | No       | Secret to protect endpoints. Leave empty to disable auth. |
| `DB_HOST`               | Yes      | PostgreSQL host (default: `localhost`)                    |
| `DB_PORT`               | Yes      | PostgreSQL port (default: `5432`)                         |
| `DB_USER`               | Yes      | PostgreSQL user                                           |
| `DB_PASSWORD`           | No       | PostgreSQL password                                       |
| `DB_DATABASE`           | Yes      | PostgreSQL database name (default: `virtual_try_on`)      |

To generate a secure `APP_KEY`:

```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));"
```

### 3. Run database migrations

```bash
npm run ace -- migration:run
```

### 4. Start the development server

```bash
npm run dev
```

The server starts at `http://0.0.0.0:3333` by default.

## API Reference

### `POST /api/v1/auth/anonymous`

Creates an anonymous user and returns an access token. No credentials required.

**Response (201):**

```json
{
  "token": "<opaque access token>",
  "userId": "<uuid>"
}
```

Use the returned `token` as `Bearer` token in subsequent authenticated requests.

### `POST /api/v1/images/generate`

Generates a virtual try-on image using Google's Gemini model.

**Headers:**

- `Content-Type: application/json`
- `x-api-key: <API_KEY>` _(required only if `API_KEY` is set in `.env`)_

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
- At least one garment image is required.

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

### `GET /api/v1/health`

Returns server health status.

**Response (200):**

```json
{ "status": "ok" }
```

## Frontend Configuration

In the Expo app, set these environment variables (`apps/mobile/.env`):

```
# For iOS simulator / Android emulator on the same machine:
EXPO_PUBLIC_API_URL=http://localhost:3333

# For physical devices, use your machine's LAN IP address (not localhost —
# on a real device, localhost refers to the device itself, not your dev machine):
EXPO_PUBLIC_API_URL=http://192.168.1.x:3333

EXPO_PUBLIC_API_KEY=your_api_key_here
```

## Production Build

```bash
npm run build
npm run start
```
