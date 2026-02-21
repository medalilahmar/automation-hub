const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Gestion robuste du logger avec fallback
let logger;
try {
  logger = require('./services/logger');
} catch (error) {
  // Fallback si le service logger n'existe pas
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  console.warn('⚠️ Service logger non trouvé, utilisation de console.log comme fallback');
}

const app = express();

// ============================================
// 1. MIDDLEWARES DE BASE
// ============================================

// Logger middleware avec vérification
app.use((req, res, next) => {
  try {
    if (logger && typeof logger.info === 'function') {
      logger.info(`${req.method} ${req.url} - IP: ${req.ip || 'unknown'}`);
    } else {
      console.log(`${req.method} ${req.url} - IP: ${req.ip || 'unknown'}`);
    }
  } catch (err) {
    console.error('Erreur dans le logger:', err.message);
  }
  next();
});

// Sécurité avec helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origin (comme les apps mobiles)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsers avec limites
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// 2. ROUTES PUBLIQUES (SANS AUTH)
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'github-actions-lab',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// ============================================
// 3. ROUTES DE L'APPLICATION
// ============================================

// Routes métier
try {
  const calculatorRoutes = require('./routes/calculatorRoutes');
  app.use('/api/calculator', calculatorRoutes);
} catch (error) {
  console.warn('⚠️ Route calculatorRoutes non chargée:', error.message);
}

try {
  const historyRoutes = require('./routes/history');
  app.use('/history', historyRoutes);
} catch (error) {
  console.warn('⚠️ Route historyRoutes non chargée:', error.message);
}

try {
  const commentsRoutes = require('./routes/comments');
  app.use('/comments', commentsRoutes);
} catch (error) {
  console.warn('⚠️ Route commentsRoutes non chargée:', error.message);
}

// Routes d'authentification
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/auth', authRoutes);
} catch (error) {
  console.warn('⚠️ Route authRoutes non chargée:', error.message);
}

// Routes utilisateurs
try {
  const userRoutes = require('./routes/users');
  app.use('/users', userRoutes);
} catch (error) {
  console.warn('⚠️ Route userRoutes non chargée:', error.message);
}

// Routes fichiers
try {
  const fileRoutes = require('./routes/files');
  app.use('/files', fileRoutes);
} catch (error) {
  console.warn('⚠️ Route fileRoutes non chargée:', error.message);
}

// ============================================
// 4. ROUTES VULNÉRABLES (OPTIONNELLES)
// ============================================

// Routes vulnérables - seulement si explicitement activées
const enableVulnRoutes = process.env.NODE_ENV !== 'production' || process.env.ENABLE_VULN === 'true';

if (enableVulnRoutes) {
  const warnMessage = '⚠️ Routes vulnérables activées - NE PAS UTILISER EN PRODUCTION !';
  
  try {
    if (logger && typeof logger.warn === 'function') {
      logger.warn(warnMessage);
    } else {
      console.warn(warnMessage);
    }
    
    const vulnerableRoutes = require('./routes/vulnerable');
    app.use('/vuln', vulnerableRoutes);
    
    console.warn('✅ Routes vulnérables chargées sur /vuln');
  } catch (error) {
    console.error('❌ Erreur chargement routes vulnérables:', error.message);
  }
}

// ============================================
// 5. SERVEUR DE FICHIERS STATIQUES (OPTIONNEL)
// ============================================

// Servir les fichiers statiques si le dossier existe
const publicPath = path.join(__dirname, 'public');
try {
  if (require('fs').existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log('✅ Serveur statique activé pour /public');
  }
} catch (error) {
  console.warn('⚠️ Impossible de configurer le serveur statique:', error.message);
}

// ============================================
// 6. ROUTE 404 - DOIT ÊTRE APRÈS TOUTES LES AUTRES ROUTES
// ============================================

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
  try {
    const errorMessage = `Erreur: ${err.message}\n${err.stack || 'Pas de stack trace'}`;
    if (logger && typeof logger.error === 'function') {
      logger.error(errorMessage);
    } else {
      console.error(errorMessage);
    }
  } catch (logError) {
    console.error('Impossible de logger l\'erreur:', logError.message);
  }

  // Réponse adaptée à l'environnement
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    error: err.name || 'Erreur interne du serveur',
    message: err.message || 'Une erreur inattendue est survenue',
    statusCode
  };

  // En développement, ajouter la stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Ne pas envoyer de détails d'erreur en production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    response.message = 'Erreur interne du serveur';
    delete response.error;
  }

  res.status(statusCode).json(response);
});

// ============================================
// 8. GESTION DES ERREURS NON CAPTURÉES
// ============================================

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  // Ne pas quitter le processus en production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejection non gérée:', reason);
});

module.exports = app;