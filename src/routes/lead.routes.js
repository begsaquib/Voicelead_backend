const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAudioToLead } = require('../services/audio.service');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../lib/prisma');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/process-audio', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { boothId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!boothId) {
      return res.status(400).json({ error: 'boothId is required' });
    }

    // Security check: Does this booth belong to the user?
    const booth = await prisma.booth.findFirst({
        where: { id: parseInt(boothId), userId: req.user.id }
    });

    if (!booth) {
        return res.status(403).json({ error: 'Unauthorized access to this booth' });
    }

    const lead = await processAudioToLead(req.file.buffer, boothId, req.file.originalname);
    res.json(lead);
  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({ error: 'Failed to process audio lead', details: error.message });
  }
});

module.exports = router;
