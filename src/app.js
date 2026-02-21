const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./services/logger'); 

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'github-actions-lab',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

const calculatorRoutes = require('./routes/calculatorRoutes');
app.use('/api/calculator', calculatorRoutes);

const historyRoutes = require('./routes/history');
app.use('/history', historyRoutes);

const commentsRoutes = require('./routes/comments');
app.use('/comments', commentsRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

// Routes fichiers
const fileRoutes = require('./routes/files');
app.use('/files', fileRoutes);


if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_VULN === 'true') {
  logger.warn('⚠️ Routes vulnérables activées - NE PAS UTILISER EN PRODUCTION !');
  const vulnerableRoutes = require('./routes/vulnerable');
  app.use('/vuln', vulnerableRoutes);
}


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 7. GESTIONNAIRE D'ERREURS GLOBAL
// ============================================
app.use((err, req, res, next) => {
  // Log de l'erreur
  logger.error(`Erreur: ${err.message}\n${err.stack}`);

  // Réponse adaptée à l'environnement
  const statusCode = err.status || 500;
  const response = {
    error: err.name || 'Erreur interne du serveur',
    message: err.message,
    statusCode
  };

  // En développement, ajouter la stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;