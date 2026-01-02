const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
  const booths = await prisma.booth.findMany({
    where: { userId: req.user.id },
    include: { _count: { select: { leads: true } } }
  });
  res.json(booths);
};

exports.create = async (req, res) => {
  try {
    const { name, event, location } = req.body;
    const userId = req.user.id;

    // ✅ Check if user already has a booth
    const existingBooth = await prisma.booth.findFirst({
      where: { userId: userId },
    });

    if (existingBooth) {
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

    res.status(201).json(booth);
  } catch (error) {
    console.error("Create booth error:", error);
    res.status(500).json({ error: "Failed to create booth" });
  }
};


exports.getLeads = async (req, res) => {
  const { id } = req.params;
  const leads = await prisma.lead.findMany({
    where: {
      boothId: id, // ✅ Use UUID string directly
      booth: { userId: req.user.id },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(leads);
};
