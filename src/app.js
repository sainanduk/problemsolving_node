require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./models'); // expects index.js exporting sequelize and models

const app = express();
const tagsRoutes = require('./routes/TagsRoutes');
// Core middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', tagsRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  return res.status(404).json({ error: 'NotFound', path: req.originalUrl });
});

// Centralized error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'InternalServerError' });
});

// Start server after DB is ready
const PORT = 3000;

async function start() {
  try {
    // Prefer authenticate() here; manage schema via migrations
    await db.sequelize.authenticate();
    // await db.sequelize.sync({force:true}); // avoid in production

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();

module.exports = app;