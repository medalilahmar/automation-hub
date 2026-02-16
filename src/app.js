const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const calculatorRoutes = require('./routes/calculatorRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'github-actions-lab',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ICI : Assurez-vous d'UTILISER calculatorRoutes
app.use('/api/calculator', calculatorRoutes);

const historyRoutes = require('./routes/history');
app.use('/history', historyRoutes);


const commentsRoutes = require('./routes/comments');
app.use('/comments', commentsRoutes);

const vulnerableRoutes = require('./routes/vulnerable');
app.use('/vuln', vulnerableRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});




module.exports = app;

