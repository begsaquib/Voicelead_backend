require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const boothRoutes = require('./routes/booth.routes');
const leadRoutes = require('./routes/lead.routes');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('🌐 HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/booths', boothRoutes);
app.use('/leads', leadRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('❌ Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  logger.info('🚀 VoiceLead Backend Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
