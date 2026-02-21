const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../app.log');

const logger = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(logFile, log);
    console.log(message);
  },
  error: (message) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(logFile, log);
    console.error(message);
  },
  logRequest: (req) => {
    const log = `[REQUEST] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Headers: ${JSON.stringify(req.headers)}\n`;
    fs.appendFileSync(logFile, log);
  }
};

module.exports = logger;