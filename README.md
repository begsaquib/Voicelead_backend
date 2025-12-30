# Voice-to-CRM Lead Capture System

This is a Node.js/Express.js backend application that transcribes voice recordings (from trade show booths) and extracts lead information into a structured CRM database using OpenAI's Whisper and GPT-4o models.

## Features

- **JWT Authentication**: Secure login and signup for users.
- **Booth Management**: Users can create and manage multiple event booths.
- **Voice Processing**: Upload audio files to automatically create Leads.
- **AI-Powered Extraction**: Uses OpenAI Whisper for transcription and GPT-4o for JSON parsing.
- **Data Isolation**: Users can only see and process data for their own booths.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API Key

## Installation

1. Clone the repository and navigate to the folder.

2. Install dependencies:
    npm install

3. Configure Environment Variables:
    - Create a `.env` file in the root directory.
    - Copy content from `.env.example` and fill in your details:
        DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
        JWT_SECRET="your_secret"
        OPENAI_API_KEY="sk-..."

4. Initialize Database:
    npx prisma migrate dev --name init

## How to Run

### Development Mode
    npm run dev

### Production Mode
    npm start

## API Usage Examples

### 1. Authentication
- `POST /auth/signup`: Body: `{ "email": "...", "password": "...", "companyName": "..." }`
- `POST /auth/login`: Body: `{ "email": "...", "password": "..." }` -> Returns `token`.

### 2. Manage Booths
- `POST /booths`: Headers: `Authorization: Bearer <token>`, Body: `{ "name": "Main Booth", "event": "TechConf", "location": "Hall A" }`
- `GET /booths`: Get all user booths.

### 3. Process Lead (The Core Feature)
- `POST /leads/process-audio`: 
  - Headers: `Authorization: Bearer <token>`
  - Body: `multipart/form-data`
  - Fields: 
    - `audio`: (Binary File - mp3, wav, m4a, etc.)
    - `boothId`: (Integer ID of the booth)

## Project Structure
- `src/index.js`: App entry point.
- `src/services/audio.service.js`: Logic for OpenAI Whisper and GPT extraction.
- `src/controllers/`: Route handlers.
- `src/middleware/`: Security and auth middleware.
- `prisma/`: Database schema and migrations.

## Troubleshooting
- **Database Connection**: Ensure your PostgreSQL service is running and the `DATABASE_URL` is correct.
- **OpenAI Errors**: Ensure you have valid credits and the API key is active.
- **Multer/File Uploads**: Ensure the client is sending `multipart/form-data`.
