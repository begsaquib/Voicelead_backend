const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
  const booths = await prisma.booth.findMany({
    where: { userId: req.user.id },
    include: { _count: { select: { leads: true } } }
  });
  res.json(booths);
};

exports.create = async (req, res) => {
  const { name, event, location } = req.body;
  const booth = await prisma.booth.create({
    data: { name, event, location, userId: req.user.id }
  });
  res.status(201).json(booth);
};

exports.getLeads = async (req, res) => {
  const { id } = req.params;
  const leads = await prisma.lead.findMany({
    where: { 
        boothId: parseInt(id),
        booth: { userId: req.user.id } // Ensure security
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(leads);
};
