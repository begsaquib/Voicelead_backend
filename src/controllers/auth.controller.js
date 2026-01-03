const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const logger = require('../config/logger');

exports.signup = async (req, res) => {
  const { email, password, companyName } = req.body;

  logger.info('👤 Signup attempt', { email, hasCompanyName: !!companyName });

  if (!email || !password) {
    logger.warn('⚠️ Signup failed - missing credentials', { email });
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    logger.warn('⚠️ Signup failed - email already exists', { email });
    return res.status(400).json({ error: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, companyName }
  });

  logger.info('✅ User registered successfully', { userId: user.id, email: user.email });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  logger.info('🔑 Login attempt', { email });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn('⚠️ Login failed - user not found', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    logger.warn('⚠️ Login failed - invalid password', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  logger.info('✅ User logged in successfully', { userId: user.id, email: user.email });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
};
