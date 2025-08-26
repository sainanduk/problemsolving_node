require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./models'); // expects index.js exporting sequelize and models

const app = express();
const tagsRoutes = require('./routes/TagsRoutes');
const questionsRoutes = require('./routes/QuestionRoutes');
const companiesRoutes = require('./routes/CompanyRoutes');
const usersRoutes = require('./routes/UserRoutes');
const submissionsRoutes = require('./routes/SubmissionRouter');
// Core middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Specify allowed origins
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', tagsRoutes);
app.use('/api', questionsRoutes);
app.use('/api', companiesRoutes);
app.use('/api', usersRoutes);
app.use('/api', submissionsRoutes);
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
    // await db.sequelize.sync({alter:true}); 

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