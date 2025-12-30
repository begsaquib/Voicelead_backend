require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const boothRoutes = require('./routes/booth.routes');
const leadRoutes = require('./routes/lead.routes');

const app = express();
const PORT = process.env.PORT || 3000;

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
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
