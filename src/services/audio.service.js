const OpenAI = require('openai');
const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const os = require('os');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Processes audio buffer to lead data
 * @param {Buffer} audioBuffer - File buffer from Multer
 * @param {number} boothId - ID of the booth
 * @param {string} originalName - Original filename to determine extension
 */
async function processAudioToLead(audioBuffer, boothId, originalName) {
  // 1. Create a temporary file because Whisper API requires a file stream/object
  const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${originalName}`);
  fs.writeFileSync(tempFilePath, audioBuffer);

  try {
    // 2. Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // 3. Extract structured JSON using GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional assistant. Extract lead information from the provided transcription. 
          Return ONLY a JSON object with the following keys: name, email, phone, company, notes. 
          If a field is unknown, use null.`
        },
        { role: "user", content: transcription.text }
      ],
      response_format: { type: "json_object" }
    });

    const leadData = JSON.parse(response.choices[0].message.content);

    // 4. Save to database
    const newLead = await prisma.lead.create({
      data: {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        notes: leadData.notes || transcription.text,
        boothId: parseInt(boothId)
      }
    });

    return newLead;
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

module.exports = { processAudioToLead };
