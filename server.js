require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
🚀 Serveur démarré avec succès!
📍 Environnement: ${NODE_ENV}
🌐 Port: ${PORT}
📅 Date: ${new Date().toLocaleString()}
📦 Version: ${process.env.npm_package_version || '1.0.0'}
🔗 Health Check: http://localhost:${PORT}/health
  `);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt propre du serveur...');
  server.close(() => {
console.log(`Hello, ${user_name}!`);
    process.exit(0);
  });
});

module.exports = server;