const prisma = require('../lib/prisma');
const logger = require('../config/logger');

exports.getAll = async (req, res) => {
  logger.info('🏪 Fetching all booths', { userId: req.user.id });

  const booths = await prisma.booth.findMany({
    where: { userId: req.user.id },
    include: { _count: { select: { leads: true } } }
  });

  logger.info('✅ Booths retrieved', { userId: req.user.id, count: booths.length });
  res.json(booths);
};

exports.create = async (req, res) => {
  try {
    const { name, event, location } = req.body;
    const userId = req.user.id;

    logger.info('🏪 Creating new booth', { userId, name, event, location });

    // ✅ Check if user already has a booth
    const existingBooth = await prisma.booth.findFirst({
      where: { userId: userId },
    });

    if (existingBooth) {
      logger.warn('⚠️ Booth creation failed - user already has booth', {
        userId,
        existingBoothId: existingBooth.id
      });
      return res.status(400).json({
        error:
          "You already have a booth. Each account can only create one booth for CES.",
        existingBooth: {
          id: existingBooth.id,
          name: existingBooth.name,
          event: existingBooth.event,
          location: existingBooth.location,
        },
      });
    }

    // Create booth if none exists
    const booth = await prisma.booth.create({
      data: {
        name,
        event,
        location,
        userId: userId,
      },
    });

    logger.info('✅ Booth created successfully', {
      boothId: booth.id,
      userId,
      name: booth.name
    });

    res.status(201).json(booth);
  } catch (error) {
    logger.error('❌ Booth creation failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ error: "Failed to create booth" });
  }
};


exports.getLeads = async (req, res) => {
  const { id } = req.params;

  logger.info('📊 Fetching booth leads', { boothId: id, userId: req.user.id });

  const leads = await prisma.lead.findMany({
    where: {
      boothId: id, // ✅ Use UUID string directly
      booth: { userId: req.user.id },
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info('✅ Leads retrieved', { boothId: id, count: leads.length });
  res.json(leads);
};
